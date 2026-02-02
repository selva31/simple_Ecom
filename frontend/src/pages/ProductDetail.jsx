import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [related, setRelated] = useState([]);

  const canBuy = (product?.stock ?? 0) > 0;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data?.product ?? null);
      setImageUrls(res.data?.image_urls ?? []);
      setSelectedImage((res.data?.image_urls ?? [])[0] ?? "");
      setRelated(res.data?.related_products ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
     
  }, [id]);

  const title = useMemo(() => product?.name || "Product", [product?.name]);

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    try {
      await add(product.id);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add to cart");
    }
  };

  const buyNow = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    try {
      await api.post(`/products/buy/${product.id}`);
      toast.success("Order placed");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to buy");
    }
  };

  return (
    <div className="container">
      <div className="toolbar">
        <div>
          <div className="muted">Product</div>
          <h1 className="page-title" style={{ margin: "6px 0 0" }}>
            {title}
          </h1>
        </div>
        <Link to="/" className="btn btn-ghost">
          Back
        </Link>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : !product ? (
        <div className="card">Product not found.</div>
      ) : (
        <>
          <div
            className="card"
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "1.2fr 1fr",
              alignItems: "start",
            }}
          >
            <div>
              {selectedImage ? (
                <img className="img" style={{ height: 320 }} src={selectedImage} alt={product.name} />
              ) : (
                <div className="img" style={{ height: 320 }} />
              )}

              {imageUrls.length > 1 && (
                <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
                  {imageUrls.map((u) => (
                    <button
                      key={u}
                      className="btn btn-ghost"
                      style={{
                        padding: 0,
                        borderRadius: 12,
                        borderColor: u === selectedImage ? "#111827" : "#e5e7eb",
                      }}
                      onClick={() => setSelectedImage(u)}
                      type="button"
                    >
                      <img
                        src={u}
                        alt="thumb"
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 12,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="badge">{product.category || "uncategorized"}</span>
                {(product.stock ?? 0) <= 0 ? (
                  <span className="badge danger">Out of stock</span>
                ) : (
                  <span className="badge">In stock: {product.stock}</span>
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800 }}>₹{product.price}</div>
              {product.description && <p className="muted">{product.description}</p>}

              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn" onClick={addToCart} disabled={!canBuy}>
                  Add to cart
                </button>
                <button className="btn btn-ghost" onClick={buyNow} disabled={!canBuy}>
                  Buy now
                </button>
              </div>

              <div className="muted" style={{ marginTop: 12 }}>
                Tip: sellers can manage products in Seller Products.
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h2 style={{ margin: "6px 0 10px" }}>Related</h2>
              <div className="grid">
                {related.map((p) => (
                  <Link
                    to={`/products/${p.id}`}
                    key={p.id}
                    className="card"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <strong>{p.name}</strong>
                    <div className="muted" style={{ marginTop: 6 }}>
                      ₹{p.price}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

