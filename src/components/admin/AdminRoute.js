import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Loading admin access...
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = profile?.is_admin || user?.role === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
