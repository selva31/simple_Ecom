import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/orders/seller");
    setOrders(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/seller/${orderId}/status`, { status });
      toast.success("Order status updated");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to update status");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>Orders</h1>

      {loading ? (
        <div className="card">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="card">No orders yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Order ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Items</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Total</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Buyer</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px" }}>#{o.order_id}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {o.items?.map((it, idx) => (
                        <div key={idx} style={{ fontSize: 13 }}>
                          {it.product_name} <span style={{ color: "#6b7280" }}>x{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>₹{o.total_price}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>{o.buyer_name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(o.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      className="input"
                      style={{ padding: "4px 8px", fontSize: 13 }}
                      value={o.status}
                      onChange={(e) => updateStatus(o.order_id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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

