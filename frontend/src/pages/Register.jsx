import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, role });
      toast.success("Registered! Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1 className="page-title">Register</h1>

      <div className="card">
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <label>
            <div className="muted">Full name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            <div className="muted">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <div className="muted">Role</div>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </label>
          <label>
            <div className="muted">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="badge danger">{error}</div>}

          <button className="btn" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

