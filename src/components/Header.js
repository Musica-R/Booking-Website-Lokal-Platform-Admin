import React from "react";
import { useLocation } from "react-router-dom";

const pageMeta = {
  "/dashboard": { title: "Dashboard", sub: "Welcome back, here's what's happening" },
  "/vendors": { title: "Vendor List", sub: "Manage all registered vendors" },
  "/users": { title: "User List", sub: "View and manage customer accounts" },
  "/bookings": { title: "Booking List", sub: "Track all service bookings" },
  "/payment-report": { title: "Payment Report", sub: "User payment history and analytics" },
  "/vendor-settlement": { title: "Vendor Settlement", sub: "Manage payouts to vendors" },
};

export default function Header({ adminName, onLogout, onMenuToggle }) {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: "Lokal Admin", sub: "" };
  const initials = adminName ? adminName.slice(0, 2).toUpperCase() : "AD";

  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onMenuToggle} aria-label="Toggle sidebar">
        ☰
      </button>

      <div className="header-breadcrumb">
        <h2>{meta.title}</h2>
        {meta.sub && <p>{meta.sub}</p>}
      </div>

      <div className="header-right">
        {/* <button className="header-badge" title="Notifications">
          🔔
          <span className="badge-dot"></span>
        </button> */}
        <div className="header-admin">
          <div className="admin-avatar">{initials}</div>
          <div className="admin-info">
            <span className="admin-name">{adminName || "Admin"}</span>
            <span className="admin-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
