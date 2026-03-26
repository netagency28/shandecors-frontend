import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getAdminOrder, updateOrderStatus } from '../../lib/api';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrderDetail() {
  return (
    <AdminRoute>
      <AdminOrderDetailContent />
    </AdminRoute>
  );
}

function AdminOrderDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAdminOrder(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error loading order:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const customer = useMemo(() => order?.shipping_address || {}, [order]);

  const handleStatusChange = async (value) => {
    if (!order) return;
    setSavingStatus(true);
    try {
      const response = await updateOrderStatus(order.id, value);
      setOrder(response.data);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return <AdminLayout title="Order Details"><p>Loading order...</p></AdminLayout>;
  }

  if (!order) {
    return (
      <AdminLayout title="Order Details">
        <p>Order not found.</p>
        <Link to="/admin/orders">
          <Button variant="outline" className="rounded-none mt-4">Back to Orders</Button>
        </Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Order ${order.order_number}`}
      subtitle="Line items, customer details, and payment status"
      actions={(
        <>
          <Badge className={`${statusColors[order.status] || 'bg-secondary text-foreground'} border-none`}>
            {order.status}
          </Badge>
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px] rounded-none" disabled={savingStatus}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}
    >
      <div className="max-w-[1300px] space-y-6" data-testid="admin-order-detail-page">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items?.length ? order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary rounded-sm overflow-hidden flex items-center justify-center">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name || 'Product'} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.product_name || item.product_id}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₹{Number(item.price || 0).toLocaleString()}</p>
                </div>
              )) : <p className="text-muted-foreground">No items found.</p>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {customer.full_name || '-'}</p>
              <p><span className="text-muted-foreground">Email:</span> {customer.email || '-'}</p>
              <p><span className="text-muted-foreground">Phone:</span> {customer.phone || '-'}</p>
              <p><span className="text-muted-foreground">Address:</span> {customer.address_line1 || '-'} {customer.address_line2 || ''}</p>
              <p><span className="text-muted-foreground">City/State:</span> {customer.city || '-'}, {customer.state || '-'}</p>
              <p><span className="text-muted-foreground">Postal:</span> {customer.postal_code || '-'}</p>
              <p><span className="text-muted-foreground">Payment:</span> {order.payment_status || 'pending'}</p>
              <p className="pt-2 font-medium">Total: ₹{Number(order.total || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
