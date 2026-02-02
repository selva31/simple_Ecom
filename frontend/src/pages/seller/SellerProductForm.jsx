import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function SellerProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      const p = res.data?.product;
      if (p) {
        setName(p.name ?? "");
        setPrice(String(p.price ?? ""));
        setStock(String(p.stock ?? ""));
        setCategory(p.category ?? "");
        setDescription(p.description ?? "");
      }
      setLoading(false);
    })();
  }, [id, isEdit]);

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("stock", stock);
    fd.append("category", category);
    fd.append("description", description);
    for (const f of images) fd.append("images", f);

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated");
      } else {
        await api.post(`/products/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product created");
      }
      navigate("/seller/products");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="toolbar">
        <h1 className="page-title" style={{ margin: 0 }}>
          {isEdit ? "Edit product" : "Add product"}
        </h1>
        <Link className="btn btn-ghost" to="/seller/products">
          Back
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={save} style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="muted">Name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="row">
              <label style={{ flex: 1 }}>
                <div className="muted">Price</div>
                <input
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  step="0.01"
                />
              </label>
              <label style={{ flex: 1 }}>
                <div className="muted">Stock</div>
                <input
                  className="input"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  type="number"
                  min="0"
                />
              </label>
            </div>
            <label>
              <div className="muted">Category</div>
              <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
            </label>
            <label>
              <div className="muted">Description</div>
              <textarea
                className="input"
                style={{ minHeight: 120 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              <div className="muted">Images</div>
              <input
                className="input"
                type="file"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
              />
            </label>

            <button className="btn" type="submit">
              {isEdit ? "Update" : "Create"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

