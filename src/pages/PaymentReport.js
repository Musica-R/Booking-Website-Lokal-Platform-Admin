import React, { useState, useEffect } from "react";
import "../styles/PaymentReport.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

export default function PaymentReport() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/users-admin-list`, {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue  = users.reduce((s, u) => s + parseFloat(u.total_paid    || 0), 0);
  const totalBookings = users.reduce((s, u) => s + parseInt(u.total_bookings  || 0), 0);
  const activeUsers   = users.filter(u => parseInt(u.total_bookings) > 0).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User Payment Report</h1>
          <p>Overview of all customer transactions and payment history</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="pr-stats-grid">
        <div className="stat-card">
          <div className="stat-icon pr-icon-revenue">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pr-icon-bookings">📅</div>
          <div className="stat-info">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{totalBookings}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pr-icon-customers">👤</div>
          <div className="stat-info">
            <div className="stat-label">Active Customers</div>
            <div className="stat-value">{activeUsers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pr-icon-avg">📊</div>
          <div className="stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Payment Details by Customer</div>
            <div className="card-subtitle">Individual payment breakdown</div>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state">
              <span>⏳</span>
              <p>Loading payment data...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Total Bookings</th>
                  <th>Total Paid</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const paid = parseFloat(u.total_paid    || 0);
                  const bk   = parseInt(u.total_bookings  || 0);
                  return (
                    <tr key={u.id}>
                      <td className="pr-serial">{i + 1}</td>
                      <td>
                        <div className="user-info-cell">
                          <div className="user-avatar-placeholder">
                            {u.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="name">{u.name}</div>
                            <div className="sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone}</td>
                      <td>{u.location || "—"}</td>
                      <td className="pr-bookings-cell">
                        <span className="badge badge-info">{bk}</span>
                      </td>
                      <td className="pr-amount">
                        ₹{paid.toLocaleString("en-IN")}
                      </td>
                      <td className="pr-date">
                        {new Date(u.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`badge ${paid > 0 ? "badge-success" : "badge-secondary"}`}>
                          {paid > 0 ? "Paid" : "No Payment"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}