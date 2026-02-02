import { useEffect, useState } from "react";
import api from "../../api/client";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function RevenuePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/products/seller/dashboard");
                // The dashboard API returns { revenue: [{name, value}], ... }
                // We can reuse this or create a specific endpoint if needed.
                // For now, reusing the dashboard data is efficient.
                setData(res.data.revenue || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const totalRevenue = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div>
            <h1 className="page-title">Revenue Analytics</h1>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 16, color: "#6b7280" }}>Total Revenue</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#10b981" }}>
                    ₹{totalRevenue.toFixed(2)}
                </div>
            </div>

            <div className="card">
                <h3>Revenue per Product</h3>
                <div style={{ height: 400, marginTop: 20 }}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Legend />
                                <Bar dataKey="value" fill="#10b981" name="Revenue (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div>No revenue data available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
