import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, DollarSign, Users,
  Plus, AlertTriangle, FileText, Wallet
} from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { getDashboardStats } from '../../lib/api';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueMode, setRevenueMode] = useState('daily');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const revenueSeries = revenueMode === 'daily' ? (stats?.revenue_daily || []) : (stats?.revenue_weekly || []);

  if (loading) {
    return (
      <AdminLayout title="Overview" subtitle="Realtime business snapshot">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-secondary rounded" />
            ))}
          </div>
          <div className="h-64 bg-secondary rounded" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Overview"
      subtitle="Realtime business snapshot"
      actions={(
        <Link to="/admin/products/new">
          <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90" data-testid="add-product-btn">
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </Link>
      )}
    >
      <div className="max-w-[1300px]" data-testid="admin-dashboard">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
            <Card className="border border-border bg-background shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-display text-2xl md:text-3xl">₹{Number(stats?.total_revenue || 0).toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-background shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Orders</CardTitle>
                <ShoppingCart size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-display text-2xl md:text-3xl">{stats?.total_orders || 0}</p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-background shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Incoming Revenue</CardTitle>
                <Wallet size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-display text-2xl md:text-3xl">₹{Number(stats?.incoming_revenue || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending / COD / Unpaid</p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-background shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Order Value</CardTitle>
                <Package size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-display text-2xl md:text-3xl">₹{Math.round(stats?.average_order_value || 0).toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-background shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
                <Users size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-display text-2xl md:text-3xl">{stats?.total_users || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <Card className="xl:col-span-2 border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl">Revenue</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant={revenueMode === 'daily' ? 'default' : 'outline'} size="sm" className="rounded-none" onClick={() => setRevenueMode('daily')}>Daily</Button>
                    <Button variant={revenueMode === 'weekly' ? 'default' : 'outline'} size="sm" className="rounded-none" onClick={() => setRevenueMode('weekly')}>Weekly</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={revenueMode === 'daily' ? 'date' : 'week_start'} />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="#111111" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-xl">Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats?.low_stock_alerts?.length ? stats.low_stock_alerts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border border-border px-3 py-2">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-none">
                      <AlertTriangle size={12} className="mr-1" />
                      {p.stock}
                    </Badge>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No low stock alerts.</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="font-display text-xl">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.top_selling_products?.length ? (
                <div className="space-y-3">
                  {stats.top_selling_products.map((p) => (
                    <div key={p.product_id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-sm overflow-hidden">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : null}
                        </div>
                        <p className="font-medium">{p.name}</p>
                      </div>
                      <Badge variant="outline">{p.units_sold} sold</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No sales data yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Link to="/admin/products">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-sm"><Package size={24} /></div>
                  <div>
                    <h3 className="font-medium">Manage Products</h3>
                    <p className="text-sm text-muted-foreground">Add, edit, stock & categories</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/orders">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-sm"><ShoppingCart size={24} /></div>
                  <div>
                    <h3 className="font-medium">Manage Orders</h3>
                    <p className="text-sm text-muted-foreground">Track, update and export orders</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/users">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-sm"><Users size={24} /></div>
                  <div>
                    <h3 className="font-medium">View Users</h3>
                    <p className="text-sm text-muted-foreground">List all registered customers</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/content">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-sm"><FileText size={24} /></div>
                  <div>
                    <h3 className="font-medium">Edit Site Content</h3>
                    <p className="text-sm text-muted-foreground">Contact, terms, refund, shipping</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
