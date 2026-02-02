import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

export default function Products() {
  const { user } = useAuth();
  const { add } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => {
      const name = String(p.name ?? "").toLowerCase();
      const category = String(p.category ?? "").toLowerCase();
      const desc = String(p.description ?? "").toLowerCase();
      return name.includes(query) || category.includes(query) || desc.includes(query);
    });
  }, [products, q]);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/products/");
    setProducts(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addToCart = async (productId) => {
    if (!user) return toast.error("Please login first");
    try {
      await add(productId);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add to cart");
    }
  };

  const buyNow = async (productId) => {
    if (!user) return toast.error("Please login first");
    try {
      await api.post(`/products/buy/${productId}`);
      toast.success("Order placed");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to buy");
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Products</h1>

      <div className="toolbar">
        <div className="row" style={{ flex: 1 }}>
          <input
            className="input"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <div className="card" key={p.id}>
              <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                {p.image_url ? (
                  <img className="img" src={p.image_url} alt={p.name} />
                ) : (
                  <div className="img" />
                )}
              </Link>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>{p.name}</strong>
                </Link>
                <span className="badge">{p.category || "uncategorized"}</span>
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                ₹{p.price} • stock {p.stock}
              </div>
              {p.description && (
                <p className="muted" style={{ marginTop: 8 }}>
                  {String(p.description).slice(0, 120)}
                  {String(p.description).length > 120 ? "..." : ""}
                </p>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => addToCart(p.id)} disabled={p.stock <= 0}>
                  Add to cart
                </button>
                <button className="btn btn-ghost" onClick={() => buyNow(p.id)} disabled={p.stock <= 0}>
                  Buy now
                </button>
                <Link className="btn btn-ghost" to={`/products/${p.id}`}>
                  View
                </Link>
              </div>
              {p.stock <= 0 && <div className="badge danger" style={{ marginTop: 10 }}>Out of stock</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

