import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { getOrder } from '../lib/api';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: 'bg-yellow-100 text-yellow-800', Icon: Clock },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-800',    Icon: CheckCircle },
  processing:       { label: 'Processing',        color: 'bg-purple-100 text-purple-800',Icon: Package },
  shipped:          { label: 'Shipped',           color: 'bg-indigo-100 text-indigo-800',Icon: Truck },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-orange-100 text-orange-800',Icon: Truck },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-800',  Icon: CheckCircle },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-800',      Icon: XCircle },
};

const STATUS_TIMELINE = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Order not found or you don\'t have permission to view it.'))
      .finally(() => setLoading(false));
  }, [orderId, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-screen-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-secondary rounded-sm" />
            <div className="h-64 bg-secondary rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-screen-xl">
          <Link to="/orders" className="text-sm text-muted-foreground hover:text-accent flex items-center gap-2 mb-8">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">{error || 'Order not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.Icon;
  const isCancelled = order.status === 'cancelled';
  const currentStep = STATUS_TIMELINE.indexOf(order.status);
  const addr = order.shipping_address || {};

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto max-w-screen-xl">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-accent flex items-center gap-2 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={`${cfg.color} border-none text-sm px-4 py-2 self-start sm:self-auto`}>
              <StatusIcon size={15} className="mr-2" />
              {cfg.label}
            </Badge>
          </div>

          {/* Status timeline (hidden for cancelled orders) */}
          {!isCancelled && (
            <div className="bg-secondary/20 p-6 rounded-sm">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-border mx-8" />
                {STATUS_TIMELINE.map((step, i) => {
                  const s = STATUS_CONFIG[step];
                  const done = i <= currentStep;
                  const StepIcon = s.Icon;
                  return (
                    <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-foreground text-background' : 'bg-border text-muted-foreground'}`}>
                        <StepIcon size={14} />
                      </div>
                      <span className={`text-xs text-center hidden sm:block ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-xl">Items Ordered</h2>
              <div className="border border-border rounded-sm divide-y divide-border">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="w-20 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover img-warm" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.product_name || 'Product'}</p>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">
                        ₹{(Number(item.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-muted-foreground">₹{Number(item.price || 0).toLocaleString('en-IN')} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar: totals + address */}
            <div className="space-y-6">
              {/* Order summary */}
              <div className="bg-secondary/20 p-6 rounded-sm">
                <h2 className="font-display text-xl mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{Number(order.shipping_fee || 0) === 0 ? 'Free' : `₹${Number(order.shipping_fee).toLocaleString('en-IN')}`}</span>
                  </div>
                  {Number(order.tax || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>₹{Number(order.tax).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="font-display text-lg">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Payment: <span className="capitalize">{order.payment_status === 'paid' ? 'Paid' : order.payment_status || 'Pending'}</span>
                </div>
              </div>

              {/* Shipping address */}
              {addr.address_line1 && (
                <div className="bg-secondary/20 p-6 rounded-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-muted-foreground" />
                    <h2 className="font-display text-lg">Shipping Address</h2>
                  </div>
                  <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                    {addr.full_name && <p className="font-medium text-foreground">{addr.full_name}</p>}
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} – {addr.postal_code}</p>
                    <p>{addr.country || 'India'}</p>
                    {addr.phone && <p className="mt-1">📞 {addr.phone}</p>}
                  </address>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
