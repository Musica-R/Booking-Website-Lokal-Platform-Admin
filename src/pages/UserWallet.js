import React, { useState, useEffect } from "react";
import "../styles/UserWallet.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const bookingStatusLabel = {
  cancelled_by_user: "Cancelled by User",
  cancelled_by_vendor: "Cancelled by Vendor",
  completed: "Completed",
  pending: "Pending",
  confirmed: "Confirmed",
};

const walletStatusLabel = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  processing: "Processing",
};

const formatCurrency = (val) => {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* ══════════════════════════════════════════
   WalletCard
   ══════════════════════════════════════════ */
function WalletCard({ item }) {
  const userInitial = item.user_name
    ? item.user_name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="uw-card">
      {/* Header */}
      <div className="uw-card-header">
        <div className="uw-avatar">{userInitial}</div>
        <div className="uw-header-text">
          <div className="uw-user-name">{item.user_name}</div>
          <div className="uw-user-phone">{item.user_phone}</div>
        </div>
        <div className="uw-badges-stack">
          <span
            className={`uw-status-badge uw-status-badge--${item.booking_status}`}
          >
            {bookingStatusLabel[item.booking_status] || item.booking_status}
          </span>
          <span
            className={`uw-type-badge uw-type-badge--${item.type}`}
          >
            {item.type === "credit" ? "↑ Credit" : "↓ Debit"}
          </span>
        </div>
      </div>

      {/* Booking row */}
      <div className="uw-booking-row">
        <span className="uw-booking-number">#{item.booking_number}</span>
        <span
          className={`uw-mini-badge uw-mini-badge--${item.payment_status}`}
        >
          {item.payment_status}
        </span>
        {/* <span
          className={`uw-mini-badge uw-mini-badge--${item.status}`}
        >
          Wallet: {walletStatusLabel[item.status] || item.status}
        </span> */}
      </div>

      <hr className="uw-divider" />

      {/* Vendor info */}
      <div className="uw-vendor-info">
        <div className="uw-vendor-chip">
          <span className="uw-vendor-icon">🏪</span>
          <div className="uw-vendor-details">
            <span className="uw-vendor-name">{item.vendor_name}</span>
            {item.shop_name && (
              <span className="uw-shop-name">{item.shop_name}</span>
            )}
          </div>
          <span className="uw-vendor-phone">{item.vendor_phone}</span>
        </div>
      </div>

      {/* UPI if available */}
      {/* {item.upi_id && (
        <div className="uw-upi-row">
          <span className="uw-upi-label">UPI</span>
          <span className="uw-upi-value">{item.upi_id}</span>
        </div>
      )} */}

      <hr className="uw-divider" />

      {/* Amounts */}
      <div className="uw-amount-grid">
        <div className="uw-amount-item">
          <span className="uw-amount-label">Total Booking Amount</span>
          <span className="uw-amount-value">
            {formatCurrency(item.total_amount)}
          </span>
        </div>
        <div className="uw-amount-item">
          <span className="uw-amount-label">Refund Amount</span>
          <span className="uw-amount-value uw-amount-value--refund">
            {formatCurrency(item.amount)}
          </span>
        </div>
        <div className="uw-amount-item">
          <span className="uw-amount-label">Balance Payment</span>
          <span className="uw-amount-value">{item.balance_payment_status}</span>
        </div>
        <div className="uw-amount-item">
          <span className="uw-amount-label">Transaction Type</span>
          <span className="uw-amount-value" style={{ textTransform: "capitalize" }}>
            {item.type}
          </span>
        </div>
      </div>

      <hr className="uw-divider" />

      {/* Refund highlight */}
      <div className="uw-refund-row">
        <span className="uw-refund-label">
          <span className="uw-refund-icon">🔄</span> Wallet Refund
        </span>
        <span className="uw-refund-amount">{formatCurrency(item.amount)}</span>
      </div>

      {/* Reason chip */}
      {item.reason && (
        <div className="uw-reason-chip">
          <span className="uw-reason-label">Reason</span>
          <span className="uw-reason-value">{item.reason}</span>
        </div>
      )}

      {/* Date */}
      <div className="uw-dates-row">
        <span>
          {formatDate(item.created_at)} {formatTime(item.created_at)}
        </span>
        <span className="uw-booking-id-small">ID #{item.booking_id}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   UserWallet — main export
   ══════════════════════════════════════════ */
export default function UserWallet() {
  const [wallets, setWallets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [totalRefunded, setTotalRefunded] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/vendors/user-wallet-list`,
          { headers: { Authorization: `Bearer ${TOKEN()}` } }
        );
        const data = await res.json();
        if (data.success) {
          setWallets(data.data);
          setFiltered(data.data);
          const total = data.data.reduce(
            (acc, item) =>
              item.type === "credit"
                ? acc + parseFloat(item.amount || 0)
                : acc,
            0
          );
          setTotalRefunded(total);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statuses = [
    "All",
    ...new Set(wallets.map((w) => w.booking_status)),
  ];

  useEffect(() => {
    let list = wallets;
    if (statusFilter !== "All")
      list = list.filter((w) => w.booking_status === statusFilter);
    if (typeFilter !== "All")
      list = list.filter((w) => w.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) =>
          w.user_name?.toLowerCase().includes(q) ||
          w.vendor_name?.toLowerCase().includes(q) ||
          w.shop_name?.toLowerCase().includes(q) ||
          w.booking_number?.toLowerCase().includes(q) ||
          w.user_phone?.includes(q) ||
          w.upi_id?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, typeFilter, wallets]);

  const creditCount = wallets.filter((w) => w.type === "credit").length;
  const debitCount = wallets.filter((w) => w.type === "debit").length;

  return (
    <div>
      {/* Summary banner */}
      <div className="uw-summary-banner">
        <div className="uw-summary-item">
          <span className="uw-summary-value">{wallets.length}</span>
          <span className="uw-summary-label">Total Transactions</span>
        </div>
        <div className="uw-summary-divider" />
        <div className="uw-summary-item">
          <span className="uw-summary-value uw-summary-value--green">
            {formatCurrency(totalRefunded)}
          </span>
          <span className="uw-summary-label">Total Refunded</span>
        </div>
        <div className="uw-summary-divider" />
        <div className="uw-summary-item">
          <span className="uw-summary-value uw-summary-value--credit">
            {creditCount}
          </span>
          <span className="uw-summary-label">Credits</span>
        </div>
        <div className="uw-summary-divider" />
        <div className="uw-summary-item">
          <span className="uw-summary-value uw-summary-value--debit">
            {debitCount}
          </span>
          <span className="uw-summary-label">Debits</span>
        </div>
      </div>

      {/* Header */}
      <div className="uw-header">
        <div>
          <h1>User Wallet Refunds</h1>
          <p>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="uw-search-bar">
          <span>🔍</span>
          <input
            placeholder="Search by user, vendor, booking, UPI…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="uw-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="uw-filters">
        <div className="uw-filter-group">
          <span className="uw-filter-label">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              className={`uw-chip${statusFilter === st ? " active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === "All"
                ? "All"
                : bookingStatusLabel[st] || st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="uw-filter-group">
          <span className="uw-filter-label">Type:</span>
          {["All", "credit", "debit"].map((t) => (
            <button
              key={t}
              className={`uw-chip uw-chip--type${typeFilter === t ? " active" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === "All" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="uw-loading">
          <span>⏳</span>
          <p>Loading wallet records…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="uw-empty">
          <span>👛</span>
          <p>No wallet records match your search.</p>
        </div>
      ) : (
        <div className="uw-grid">
          {filtered.map((item) => (
            <WalletCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}