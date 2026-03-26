import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Package, ArrowRight, Loader2, Clock3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { verifyPayment } from '../lib/api';
import { useCart } from '../contexts/CartContext';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const gateway = searchParams.get('gateway') || '';
  const paymentId = searchParams.get('payment_id') || '';
  const paymentRequestId = searchParams.get('payment_request_id') || '';
  const paymentStatusParam = searchParams.get('payment_status') || '';
  const { clearCart } = useCart();
  const cartClearedRef = useRef(false);
  
  const [status, setStatus] = useState('loading'); // loading, success, failed, pending
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        setStatus('failed');
        setError('Order ID not found');
        return;
      }

      try {
        const response = await verifyPayment(orderId, {
          gateway,
          payment_id: paymentId,
          payment_request_id: paymentRequestId,
          payment_status: paymentStatusParam,
        });
        const data = response.data;
        
        if (data.payment_status === 'paid') {
          if (!cartClearedRef.current) {
            clearCart();
            cartClearedRef.current = true;
          }
          setStatus('success');
          setOrderDetails(data);
        } else if (data.payment_status === 'failed') {
          setStatus('failed');
          setError('Payment was declined');
        } else {
          // Pending can happen while bank/UPI confirmation is in progress.
          setStatus('pending');
          setOrderDetails(data);
          setError('Payment is still processing. Please check again in a moment.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('failed');
        setError('Failed to verify payment');
      }
    };

    verify();
  }, [orderId, gateway, paymentId, paymentRequestId, paymentStatusParam, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="payment-loading">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-accent mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 md:px-8 lg:px-12" data-testid="payment-status-page">
      <div className="container mx-auto max-w-screen-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {status === 'success' ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
              </motion.div>
              
              <h1 className="font-display text-3xl md:text-4xl mb-4" data-testid="success-title">
                Order Confirmed!
              </h1>
              
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Thank you for your order. We've sent a confirmation email with all the details.
              </p>

              {orderDetails && (
                <div className="bg-secondary/30 p-6 rounded-sm mb-8 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Package size={24} className="text-accent" />
                    <span className="font-medium">Order Details</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-green-600 capitalize">{orderDetails.order_status || 'Confirmed'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button 
                    variant="outline" 
                    className="rounded-none px-8 py-5"
                    data-testid="continue-shopping-btn"
                  >
                    Continue Shopping
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button 
                    className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-5 group"
                    data-testid="view-orders-btn"
                  >
                    View My Orders
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </>
          ) : status === 'pending' ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Clock3 size={80} className="mx-auto text-amber-500 mb-6" />
              </motion.div>

              <h1 className="font-display text-3xl md:text-4xl mb-4" data-testid="pending-title">
                Payment Processing
              </h1>

              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {error}
              </p>

              {orderDetails && (
                <div className="bg-secondary/30 p-6 rounded-sm mb-8 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Package size={24} className="text-accent" />
                    <span className="font-medium">Order Details</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize">{orderDetails.order_status || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-5"
                  data-testid="check-again-btn"
                >
                  Check Again
                </Button>
                <Link to="/orders">
                  <Button
                    variant="outline"
                    className="rounded-none px-8 py-5"
                    data-testid="view-orders-pending-btn"
                  >
                    View My Orders
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <XCircle size={80} className="mx-auto text-destructive mb-6" />
              </motion.div>
              
              <h1 className="font-display text-3xl md:text-4xl mb-4" data-testid="failed-title">
                Payment Failed
              </h1>
              
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {error || 'Unfortunately, your payment could not be processed. Please try again.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/checkout">
                  <Button 
                    className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-5"
                    data-testid="retry-btn"
                  >
                    Try Again
                  </Button>
                </Link>
                <Link to="/products">
                  <Button 
                    variant="outline" 
                    className="rounded-none px-8 py-5"
                  >
                    Back to Shop
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
