import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// allowedRoles e.g. ["admin"], ["staff"], ["customer"]
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
