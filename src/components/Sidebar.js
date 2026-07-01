import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const navGroups = [
  {
    key: "main",
    title: "Dashboard",
    items: [
      { to: "/dashboard", icon: "📊", label: "Dashboard" },
    ],
  },

  {
    key: "settlement",
    title: "Settlements",
    items: [
      { to: "/vendor-settlement", icon: "🤝", label: "Services Settlements" },
      { to: "/act-settlement", icon: "🤝", label: "Activity Settlements" },
    ],
  },

  {
    key: "profit",
    title: "Revenue",
    items: [
      { to: "/earn", icon: "💰", label: "HS User Cancellation Profit" },
      { to: "/near-profit", icon: "💹", label: "Stall Profits" },
    ],
  },

  {
    key: "list",
    title: "Records",
    items: [
      { to: "/vendors", icon: "🔧", label: "Home Service Vendors" },
      { to: "/activity", icon: "🎮", label: "Activity Vendors" },
      { to: "/near", icon: "🛒", label: "Nearby Stalls" },
      { to: "/users", icon: "👥", label: "Users" },
      { to: "/bookings", icon: "📅", label: "Bookings" },
      { to: "/payment-report", icon: "💳", label: "Payments" },
    ],
  },



  {
    key: "userwallet",
    title: "Wallet",
    items: [
      { to: "/wall", icon: "👛", label: "Wallet Refunds" },
    ],
  },
];

export default function Sidebar({ isOpen, isMobileOpen, onMobileClose }) {
  // Track which groups are expanded. All open by default.
  const [openGroups, setOpenGroups] = useState(
    navGroups.reduce((acc, g) => ({ ...acc, [g.key]: true }), {})
  );

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("lokal_admin");
    window.location.href = "/";
  };

  const handleNavClick = () => {
    if (isMobileOpen) onMobileClose?.();
  };

  return (
    <>
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
          {navGroups.map((group) => {
            const expanded = openGroups[group.key];
            return (
              <div className="nav-group" key={group.key}>
                {isOpen ? (
                  <button
                    type="button"
                    className="sidebar-section-title sidebar-section-toggle"
                    onClick={() => toggleGroup(group.key)}
                  >
                    <span>{group.title}</span>
                    <span
                      className={`section-caret ${expanded ? "expanded" : ""}`}
                    >
                      ▸
                    </span>
                  </button>
                ) : (
                  <div className="sidebar-section-divider" />
                )}

                <div
                  className={`nav-group-items ${isOpen && !expanded ? "collapsed" : ""
                    }`}
                >
                  {/* Single grid child — this wrapper is what actually
                      collapses. All nav-items live inside it together. */}
                  <div className="nav-group-items-inner">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `nav-item ${isActive ? "active" : ""}`
                        }
                        title={!isOpen ? item.label : ""}
                        onClick={handleNavClick}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        {isOpen && (
                          <span className="nav-label">{item.label}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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