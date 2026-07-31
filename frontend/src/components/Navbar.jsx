import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Catering Management System
      </Link>
      <div className="navbar-links">
        {!user && (
          <Link to="/login" className="btn-link">
            Login
          </Link>
        )}
        {user && user.role === "customer" && <Link to="/customer">Dashboard</Link>}
        {user && user.role === "staff" && <Link to="/staff">Dashboard</Link>}
        {user && user.role === "admin" && <Link to="/admin">Dashboard</Link>}
        {user && (
          <button className="btn-link" onClick={handleLogout}>
            Logout ({user.role})
          </button>
        )}
      </div>
    </nav>
  );
}
