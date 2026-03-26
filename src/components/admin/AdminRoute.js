import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // For now, we'll check if user has admin role (this should come from backend)
  // TODO: Add proper role checking from backend user data
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
