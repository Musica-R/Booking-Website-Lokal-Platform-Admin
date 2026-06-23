import React, { useState, useEffect } from "react";
import "../styles/UserList.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

export default function UserList() {
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/users/users-admin-list`, {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setFiltered(data.users);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.name.toLowerCase().includes(q)      ||
      u.email.toLowerCase().includes(q)     ||
      u.phone.includes(q)                   ||
      u.location?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const totalRevenue  = users.reduce((s, u) => s + parseFloat(u.total_paid    || 0), 0);
  const totalBookings = users.reduce((s, u) => s + parseInt(u.total_bookings  || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User List</h1>
          <p>{filtered.length} registered customers</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="ul-stats-grid">
        <div className="stat-card">
          <div className="stat-icon ul-icon-users">👥</div>
          <div className="stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon ul-icon-bookings">📅</div>
          <div className="stat-info">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{totalBookings}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon ul-icon-revenue">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state"><span>⏳</span><p>Loading users...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><span>🔍</span><p>No users found.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="ul-col-serial">#</th>
                  <th>User</th>
                  <th className="ul-col-phone">Phone</th>
                  <th className="ul-col-location">Location</th>
                  <th className="ul-col-bookings">Bookings</th>
                  <th>Total Paid</th>
                  <th className="ul-col-joined">Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td className="ul-serial ul-col-serial">{i + 1}</td>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatars">
                          {u.profileImageUrl ? (
                            <img
                              src={u.profileImageUrl}
                              alt={u.name}
                              className="user-avatars-img"
                            />
                          ) : (
                            <div className="user-avatars-placeholder">
                              {u.name?.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="name">{u.name}</div>
                          <div className="sub">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ul-col-phone">{u.phone}</td>
                    <td className="ul-col-location">{u.location || "—"}</td>
                    <td className="ul-col-bookings">
                      <span className="badge badge-info">{u.total_bookings}</span>
                    </td>
                    <td className="ul-amount">
                      ₹{parseFloat(u.total_paid).toLocaleString("en-IN")}
                    </td>
                    <td className="ul-date ul-col-joined">
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td>
                      <span className={`badge ${parseInt(u.total_bookings) > 0 ? "badge-success" : "badge-secondary"}`}>
                        {parseInt(u.total_bookings) > 0 ? "Active" : "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}