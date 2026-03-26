import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { getOrders } from '../lib/api';

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await getOrders();
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="font-display text-2xl mb-2">Sign in to view orders</h2>
          <p className="text-muted-foreground mb-6">Track your orders and view order history</p>
          <Link to="/login">
            <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-5">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-screen-xl">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12" data-testid="orders-page">
      <div className="container mx-auto max-w-screen-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-4xl mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16" data-testid="no-orders">
              <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <h2 className="font-display text-xl mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Link to="/products">
                <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-5">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const StatusIcon = statusIcons[order.status] || Package;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border border-border rounded-sm p-4 md:p-6 hover:border-accent/50 transition-colors"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                          {order.items?.[0]?.product_image ? (
                            <img
                              src={order.items[0].product_image}
                              alt="Order item"
                              className="w-full h-full object-cover img-warm"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="text-left md:text-right">
                          <p className="font-display text-lg">₹{order.total?.toLocaleString()}</p>
                          <Badge className={`${statusColors[order.status]} border-none`}>
                            <StatusIcon size={14} className="mr-1" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="rounded-none">
                            <ChevronRight size={20} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
