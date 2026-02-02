import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  color: isActive ? "#111827" : "#374151",
  fontWeight: isActive ? 700 : 500,
});

export default function NavBar() {
  const { user, isSeller, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          storezy
        </Link>

        <nav className="links">
          <NavLink to="/" style={linkStyle}>
            Products
          </NavLink>
          <NavLink to="/cart" style={linkStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Cart
              {user && count > 0 && <span className="pill">{count}</span>}
            </span>
          </NavLink>

          {isSeller && (
            <>
              <NavLink to="/seller/products" style={linkStyle}>
                Seller Products
              </NavLink>
              <NavLink to="/seller/orders" style={linkStyle}>
                Seller Orders
              </NavLink>
            </>
          )}
        </nav>

        <div className="auth">
          {user ? (
            <>
              <span className="muted">
                {user.name} ({user.role})
              </span>
              <button className="btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Login
              </Link>
              <Link className="btn" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

