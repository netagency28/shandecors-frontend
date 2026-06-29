import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, Package, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getAdminOrders, updateOrderStatus } from '../../lib/api';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminOrders() {
  return (
    <AdminRoute>
      <AdminOrdersContent />
    </AdminRoute>
  );
}

function AdminOrdersContent() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await getAdminOrders({ ...params, limit: 100 });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const method = String(order.payment_method || '').toLowerCase();
    if (method === 'cod') return false;
    return (
      order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_address?.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExportCsv = () => {
    const rows = filteredOrders.map((order) => ({
      order_number: order.order_number,
      customer_name: order.shipping_address?.full_name || '',
      customer_email: order.shipping_address?.email || '',
      phone: order.shipping_address?.phone || '',
      total: order.total || 0,
      payment_status: order.payment_status || 'pending',
      status: order.status || '',
      created_at: order.created_at || '',
    }));

    const headers = Object.keys(rows[0] || {
      order_number: '',
      customer_name: '',
      customer_email: '',
      phone: '',
      total: '',
      payment_status: '',
      status: '',
      created_at: '',
    });

    const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="Manage and track customer orders"
      actions={(
        <Button variant="outline" className="rounded-none" onClick={handleExportCsv}>
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      )}
    >
      <div className="max-w-[1300px]" data-testid="admin-orders-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-none"
                data-testid="search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-none" data-testid="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-sm">
              <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="bg-background rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm">Order</th>
                      <th className="text-left p-4 font-medium text-sm">Customer</th>
                      <th className="text-left p-4 font-medium text-sm">Total</th>
                      <th className="text-left p-4 font-medium text-sm">Payment</th>
                      <th className="text-left p-4 font-medium text-sm">Status</th>
                      <th className="text-left p-4 font-medium text-sm">Date</th>
                      <th className="text-right p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      return (
                        <tr key={order.id} className="border-b border-border last:border-0" data-testid={`order-row-${order.id}`}>
                          <td className="p-4">
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} items
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{order.shipping_address?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_address?.email}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">₹{order.total?.toLocaleString()}</p>
                          </td>
                          <td className="p-4">
                            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {order.payment_status || 'pending'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-[140px] rounded-none h-8" data-testid={`status-select-${order.id}`}>
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
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <Link to={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="rounded-none">
                                <Eye size={16} className="mr-1" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
