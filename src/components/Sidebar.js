import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/vendors", icon: "🔧", label: "Vendor List" },
  { to: "/activity", icon: "🎮", label: "Activity Vendor List" },
  { to: "/near", icon: "🛒", label: "Nearby Quick Stalls" },
  { to: "/users", icon: "👥", label: "User List" },
  { to: "/bookings", icon: "📅", label: "Booking List" },
  { to: "/payment-report", icon: "💳", label: "Payment Report" },
  { to: "/vendor-settlement", icon: "🤝", label: "HS Vendor Settlement" },
  { to: "/earn", icon: "💰", label: "HS Cancellation Earnings" },
  { to: "/wall", icon: "👛", label: "HS Wallet Refunds" },
  { to: "/act-settlement", icon: "🤝", label: "Activity Settlement" },
];

export default function Sidebar({ isOpen, isMobileOpen, onMobileClose }) {
  const handleLogout = () => {
    localStorage.removeItem("lokal_admin");
    window.location.href = "/";
  };

  const handleNavClick = () => {
    // Close the mobile drawer when a link is tapped
    if (isMobileOpen) onMobileClose?.();
  };

  return (
    <>
      {/* Backdrop overlay — only visible on mobile when open */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">L</div>
          {isOpen && (
            <span className="logo-text">
              Lokal<span> Admin</span>
            </span>
          )}
        </div>

        <nav className="sidebar-nav">
          {isOpen && <div className="sidebar-section-title">Main Menu</div>}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title={!isOpen ? item.label : ""}
              onClick={handleNavClick}
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon">🚪</span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}