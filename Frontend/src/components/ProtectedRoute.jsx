import { Navigate } from 'react-router-dom';
import { isLoggedIn, getUser } from '../utils/auth';

export default function ProtectedRoute({ children, adminOnly = false }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  if (adminOnly) {
    const user = getUser();
    if (user?.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  }

  return children;
}
