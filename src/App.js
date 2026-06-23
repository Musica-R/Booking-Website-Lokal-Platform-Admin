import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VendorList from "./pages/VendorList";
import UserList from "./pages/UserList";
import BookingList from "./pages/BookingList";
import PaymentReport from "./pages/PaymentReport";
import VendorSettlement from "./pages/VendorSettlement";
import "./styles/global.css";
import PlatformProfit from "./pages/PlatformProfit";
import UserWallet from "./pages/UserWallet";

function AdminLayout({ children, adminName, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Track screen size to auto-close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false); // clean up if user resizes back
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev); // mobile: toggle drawer
    } else {
      setSidebarOpen((prev) => !prev);        // desktop: toggle icon-rail
    }
  };

  return (
    <div
      className={`admin-root
        ${!isMobile && !sidebarOpen ? "sidebar-collapsed" : ""}
        ${isMobile && mobileSidebarOpen ? "sidebar-open" : ""}
      `.trim()}
    >
      <Sidebar
        isOpen={isMobile ? true : sidebarOpen}   // on mobile always show labels
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="main-area">
        <Header
          adminName={adminName}
          onLogout={onLogout}
          onMenuToggle={handleMenuToggle}
        />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("lokal_admin");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (adminData) => {
    localStorage.setItem("lokal_admin", JSON.stringify(adminData));
    setAuth(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem("lokal_admin");
    setAuth(null);
  };

  if (!auth) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <AdminLayout adminName={auth.name} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/payment-report" element={<PaymentReport />} />
          <Route path="/vendor-settlement" element={<VendorSettlement />} />
          <Route path="/earn" element={<PlatformProfit />} />
          <Route path="/wall" element={<UserWallet />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
}