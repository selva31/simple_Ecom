import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/products/seller");
    setProducts(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to delete");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>Inventory</h1>
        <Link className="btn" to="/seller/products/new">
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : products.length === 0 ? (
        <div className="card">No products yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Name</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Category</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Price</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Stock</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px" }}>{p.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="pill" style={{ background: "#e5e7eb", color: "#374151", fontWeight: 500 }}>
                      {p.category || "uncategorized"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>₹{p.price}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: p.stock < 5 ? "#ef4444" : "inherit", fontWeight: p.stock < 5 ? 600 : 400 }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <Link to={`/seller/products/${p.id}`} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 14 }}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 12px", fontSize: 14, color: "#ef4444" }}
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

