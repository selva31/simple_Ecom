import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, DollarSign, LogOut } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function SellerLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/seller/products", label: "Inventory", icon: Package },
    { to: "/seller/orders", label: "Orders", icon: ShoppingCart },
    { to: "/seller/revenue", label: "Revenue", icon: DollarSign },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 250,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          padding: 20,
        }}
      >
        <div style={{ marginBottom: 30, fontSize: 20, fontWeight: "bold", color: "#111827" }}>
          Seller Center
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: isActive ? "#fff" : "#4b5563",
                  background: isActive ? "#111827" : "transparent",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#ef4444",
            cursor: "pointer",
            textAlign: "left",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 30, overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
