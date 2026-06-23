import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const statConfig = [
  { key: "vendors",  label: "Total Vendors",  icon: "🔧", color: "#246BFD", bg: "#EEF3FF", change: "+2 this week", up: true },
  { key: "users",    label: "Total Users",    icon: "👥", color: "#22c55e", bg: "#f0fdf4", change: "+1 this week", up: true },
  { key: "bookings", label: "Total Bookings", icon: "📅", color: "#f59e0b", bg: "#fffbeb", change: "Active",       up: true },
  { key: "revenue",  label: "Total Revenue",  icon: "💰", color: "#7c3aed", bg: "#f5f3ff", change: "Paid",         up: true },
];

export default function Dashboard() {
  const [vendors, setVendors] = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${TOKEN()}` };
        const [vRes, uRes] = await Promise.all([
          fetch(`${API_BASE}/api/vendors/list-vendors`,      { headers }),
          fetch(`${API_BASE}/api/users/users-admin-list`,    { headers }),
        ]);
        const vData = await vRes.json();
        const uData = await uRes.json();
        if (vData.success) setVendors(vData.vendors || []);
        if (uData.success) setUsers(uData.users     || []);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue  = users.reduce((sum, u) => sum + parseFloat(u.total_paid    || 0), 0);
  const totalBookings = users.reduce((sum, u) => sum + parseInt(u.total_bookings  || 0), 0);

  const stats = [
    { ...statConfig[0], value: vendors.length },
    { ...statConfig[1], value: users.length },
    { ...statConfig[2], value: totalBookings },
    { ...statConfig[3], value: `₹${totalRevenue.toLocaleString("en-IN")}` },
  ];

  const categoryBreakdown = vendors.reduce((acc, v) => {
    acc[v.category_name] = (acc[v.category_name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.key}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{loading ? "—" : s.value}</div>
              <div className={`stat-change ${s.up ? "up" : "down"}`}>
                {s.up ? "↑" : "↓"} {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column cards ── */}
      <div className="db-two-col">

        {/* Recent Vendors */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Vendors</div>
              <div className="card-subtitle">Latest registered professionals</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate("/vendors")}>
              View All
            </button>
          </div>
          <div className="db-list">
            {loading ? (
              <div className="loading-state"><span>⏳</span></div>
            ) : vendors.slice(0, 4).map((v) => (
              <div key={v.id} className="db-list-item">
                <div className="user-avatar-placeholder">
                  {v.full_name.slice(0, 1)}
                </div>
                <div className="db-list-info">
                  <div className="db-list-name">{v.full_name}</div>
                  <div className="db-list-sub">{v.category_name} · {v.city}</div>
                </div>
                <span className={`badge ${parseFloat(v.rating) > 0 ? "badge-success" : "badge-secondary"}`}>
                  ⭐ {parseFloat(v.rating).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Users</div>
              <div className="card-subtitle">Latest registered customers</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate("/users")}>
              View All
            </button>
          </div>
          <div className="db-list">
            {loading ? (
              <div className="loading-state"><span>⏳</span></div>
            ) : users.slice(0, 4).map((u) => (
              <div key={u.id} className="db-list-item">
                <div className="user-avatar-placeholder">
                  {u.name.slice(0, 1)}
                </div>
                <div className="db-list-info">
                  <div className="db-list-name">{u.name}</div>
                  <div className="db-list-sub">{u.phone} · {u.location}</div>
                </div>
                <div className="db-list-right">
                  <div className="db-list-amount">
                    ₹{parseFloat(u.total_paid).toLocaleString("en-IN")}
                  </div>
                  <div className="db-list-bookings">{u.total_bookings} bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Category Breakdown ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Vendors by Category</div>
            <div className="card-subtitle">Service category distribution</div>
          </div>
        </div>
        <div className="card-body">
          <div className="db-category-grid">
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="db-category-chip">
                <span className="db-category-count">{count}</span>
                <span className="db-category-label">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}