import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", mobile: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/vendors/super-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("lokal_token", data.token);
        onLogin(data.admin);
      } else {
        setError(data.message || "Login failed. Check your credentials.");
      }
    } catch (err) {
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon" style={{ width: 42, height: 42, borderRadius: 12, background: "#246BFD", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>L</div>
          <span style={{ fontSize: 22, fontWeight: 700 }}>Lokal <span style={{ color: "#246BFD" }}>Admin</span></span>
        </div>

        <h2 className="login-title">Welcome back 👋</h2>
        <p className="login-sub">Sign in to your admin panel to manage vendors, users, and bookings.</p>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="admin@gmail.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mobile Number</label>
          <input
            className="form-input"
            type="text"
            name="mobile"
            placeholder="9876543210"
            value={form.mobile}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
