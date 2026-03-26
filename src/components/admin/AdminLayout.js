import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Eye,
  LogOut,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/content', label: 'Site Content', icon: FileText },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-secondary/20" data-testid="admin-layout">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] min-h-screen">
        <aside className="border-r border-border bg-background">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <Link to="/" className="font-display text-xl">Shan Decor</Link>
              <p className="text-xs mt-1 uppercase tracking-[0.2em] text-accent">Admin</p>
            </div>
            <Link to="/admin/products/new">
              <Button size="icon" className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                <Plus size={16} />
              </Button>
            </Link>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto p-3 border-t border-border flex flex-col gap-1">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start rounded-none text-muted-foreground">
                <Eye size={16} className="mr-2" />
                View Store
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start rounded-none text-muted-foreground" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex flex-col min-w-0">
          <header className="border-b border-border bg-background px-5 md:px-8 py-5">
            <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
              <div>
                <h1 className="font-display text-2xl md:text-3xl">{title}</h1>
                {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
          </header>

          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

