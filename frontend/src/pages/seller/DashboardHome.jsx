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
    PieChart,
    Pie,
    Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function DashboardHome() {
    const [data, setData] = useState({ inventory: [], revenue: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/products/seller/dashboard");
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    const totalRevenue = data.revenue.reduce((acc, curr) => acc + curr.value, 0);
    const totalStock = data.inventory.reduce((acc, curr) => acc + curr.stock, 0);
    const lowStockCount = data.inventory.filter((i) => i.stock < 5).length;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>Dashboard Overview</h1>

            {/* Summary Cards */}
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 30 }}>
                <SummaryCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} color="#10b981" />
                <SummaryCard title="Total Inventory" value={totalStock} color="#3b82f6" />
                <SummaryCard title="Low Stock Items" value={lowStockCount} color="#ef4444" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                {/* Revenue Chart */}
                <div className="card" style={{ minHeight: 400 }}>
                    <h3 style={{ marginBottom: 20 }}>Revenue by Product</h3>
                    {data.revenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.revenue}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.revenue.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No revenue data yet.</div>
                    )}
                </div>

                {/* Stock Chart */}
                <div className="card" style={{ minHeight: 400 }}>
                    <h3 style={{ marginBottom: 20 }}>Inventory Levels</h3>
                    {data.inventory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.inventory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="stock" fill="#8884d8" name="Stock" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No products found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, color }) {
    return (
        <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 4 }}>{value}</div>
        </div>
    );
}
