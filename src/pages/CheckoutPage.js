import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, createGuestOrder, createPaymentOrder, getAddresses } from '../lib/api';
import * as Sentry from '@sentry/react';

const loadCashfreeSdk = () => new Promise((resolve, reject) => {
  if (window.Cashfree) {
    resolve();
    return;
  }

  const existingScript = document.querySelector('script[data-cashfree-sdk="true"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve());
    existingScript.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')));
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
  script.async = true;
  script.dataset.cashfreeSdk = 'true';
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
  document.body.appendChild(script);
});

export default function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    notes: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items, navigate]);

  // Pre-fill from default saved address when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    getAddresses().then((res) => {
      const def = (res.data || []).find((a) => a.isDefault) || res.data?.[0];
      if (def) {
        setFormData((prev) => ({
          ...prev,
          address_line1: def.street || prev.address_line1,
          city: def.city || prev.city,
          state: def.state || prev.state,
          postal_code: def.postalCode || prev.postal_code,
        }));
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const shippingFee = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    Sentry.addBreadcrumb({ category: 'payment', message: 'Checkout form submitted', level: 'info' });

    try {
      // Prepare order data
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || 'Product',
        product_image: item.product?.images?.[0] || '',
        price: item.product?.sale_price || item.product?.price || 0,
        quantity: item.quantity
      }));

      const orderData = {
        items: orderItems,
        subtotal: cartTotal,
        shipping_fee: shippingFee,
        total: total,
        shipping_address: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2 || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: 'India'
        },
        notes: formData.notes || null
      };

      // Create order
      Sentry.addBreadcrumb({ category: 'payment', message: 'Creating order', level: 'info' });
      const createOrderFn = isAuthenticated ? createOrder : createGuestOrder;
      const orderResponse = await createOrderFn(orderData);
      const order = orderResponse.data;
      Sentry.addBreadcrumb({ category: 'payment', message: 'Order created', level: 'info', data: { orderId: order.id } });

      const paymentResponse = await createPaymentOrder({
        order_id: order.id,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_name: formData.full_name
      });

      const gateway = String(paymentResponse.data?.gateway || 'cashfree').toLowerCase();
      const sessionId = paymentResponse.data?.payment_session_id;
      const environment = String(paymentResponse.data?.environment || 'sandbox').toLowerCase();
      const mode = environment === 'production' ? 'production' : 'sandbox';
      const redirectUrl = paymentResponse.data?.redirect_url;
      Sentry.addBreadcrumb({ category: 'payment', message: 'Payment intent created', level: 'info', data: { gateway, mode } });

      if (gateway === 'instamojo') {
        if (!redirectUrl) {
          setError('Instamojo redirect link was not created. Please check Instamojo configuration and try again.');
          return;
        }
        window.location.href = redirectUrl;
        return;
      }

      if (!sessionId) {
        setError('Payment session was not created. Please check payment gateway configuration and try again.');
        return;
      }

      await loadCashfreeSdk();
      const cashfree = window.Cashfree({ mode });
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: '_self'
      });
    } catch (err) {
      console.error('Checkout error:', err);
      Sentry.captureException(err, { extra: { step: 'checkout' } });
      const requiredEnv = err.response?.data?.required_env;
      if (Array.isArray(requiredEnv) && requiredEnv.length > 0) {
        setError(`Payment is not configured. Missing: ${requiredEnv.join(', ')}`);
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to process order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 lg:px-12" data-testid="checkout-page">
      <div className="container mx-auto max-w-screen-xl">
        <Link 
          to="/products" 
          className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 mb-8"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>

        <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-sm" data-testid="checkout-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="font-display text-xl mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="mt-1 rounded-none"
                      data-testid="fullname-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 rounded-none"
                      data-testid="checkout-email-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit mobile number"
                      className="mt-1 rounded-none"
                      data-testid="phone-input"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <h2 className="font-display text-xl mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address_line1">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      required
                      placeholder="Street address, apartment, suite, etc."
                      className="mt-1 rounded-none"
                      data-testid="address1-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address_line2"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      placeholder="Building, floor, etc."
                      className="mt-1 rounded-none"
                      data-testid="address2-input"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="mt-1 rounded-none"
                        data-testid="city-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="mt-1 rounded-none"
                        data-testid="state-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        required
                        className="mt-1 rounded-none"
                        data-testid="postal-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Notes */}
              <div>
                <h2 className="font-display text-xl mb-4">Order Notes (Optional)</h2>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order..."
                  className="rounded-none min-h-[100px]"
                  data-testid="notes-input"
                />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-secondary/30 rounded-sm">
                  <Truck size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Free Shipping over ₹999</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-sm">
                  <CreditCard size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-sm">
                  <ShieldCheck size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">14-Day Returns</p>
                </div>
              </div>

              {/* T&C acceptance — required by Cashfree production */}
              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms-accept"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 border-gray-300 rounded cursor-pointer"
                  data-testid="terms-checkbox"
                />
                <label htmlFor="terms-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" target="_blank" className="underline hover:text-foreground">Terms & Conditions</Link>,{' '}
                  <Link to="/refunds-cancellation-policy" target="_blank" className="underline hover:text-foreground">Refund Policy</Link>, and{' '}
                  <Link to="/shipping-policy" target="_blank" className="underline hover:text-foreground">Shipping Policy</Link>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading || !termsAccepted}
                title={!termsAccepted ? 'Please accept the Terms & Conditions to continue' : ''}
                className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-6 uppercase tracking-widest text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="place-order-btn"
              >
                {loading ? 'Processing...' : `Place Order - ₹${total.toLocaleString()}`}
              </Button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-secondary/30 p-6 rounded-sm">
              <h2 className="font-display text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4" data-testid={`checkout-item-${item.product_id}`}>
                    <div className="w-16 h-20 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.jpg'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover img-warm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">
                        ₹{((item.product?.sale_price || item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-xl">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
