import React, { useState, useEffect, useCallback } from "react";
import "../styles/BookingList.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  completed:          "Completed",
  pending:            "Pending",
  confirmed:          "Confirmed",
  cancelled_by_user:  "Cancelled (User)",
  cancelled_by_vendor:"Cancelled (Vendor)",
};

const PAYMENT_LABEL = {
  paid:   "Paid",
  unpaid: "Unpaid",
};

function badgeClass(status = "") {
  return status.toLowerCase().replace(/ /g, "_");
}

function formatINR(value) {
  const n = parseFloat(value);
  if (!value || isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── SearchIcon ───────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <line x1="13.5" y1="13.5" x2="18" y2="18" />
    </svg>
  );
}

// ── RefreshIcon ──────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ width: 14, height: 14, transition: "transform 0.4s", transform: spinning ? "rotate(360deg)" : "none" }}
    >
      <path d="M17 10a7 7 0 1 1-1.34-4.07" />
      <polyline points="17 3 17 7 13 7" />
    </svg>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────

function Badge({ value, labelMap = {} }) {
  const cls = badgeClass(value || "secondary");
  const label = labelMap[value] || (value ? value.replace(/_/g, " ") : "—");
  return (
    <span className={`bl-badge ${cls}`}>
      <span className="bl-badge-dot" />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BookingList() {
  const [bookings, setBookings]       = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [refreshing, setRefreshing]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/booking/bookings-admin`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (data.success) {
        const list = data.bookings || [];
        setBookings(list);
        setFiltered(list);
      } else {
        throw new Error(data.message || "Failed to load bookings.");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let list = bookings;

    if (statusFilter !== "All") {
      list = list.filter((b) => (b.booking_status || "pending") === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.user_name?.toLowerCase().includes(q)    ||
          b.vendor_name?.toLowerCase().includes(q)  ||
          b.shop_name?.toLowerCase().includes(q)    ||
          b.booking_number?.toLowerCase().includes(q) ||
          b.id?.toString().includes(q)
      );
    }

    setFiltered(list);
  }, [search, statusFilter, bookings]);

  // ── Unique statuses for filter tabs ────────────────────────────────────────
  const statuses = ["All", ...new Set(bookings.map((b) => b.booking_status || "pending"))];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bl-wrapper">
      {/* Header */}
      <div className="bl-header">
        <div className="bl-header-left">
          <h1>Bookings</h1>
          <p>
            {loading
              ? "Loading…"
              : error
              ? "Could not load bookings"
              : `${filtered.length} of ${bookings.length} bookings`}
          </p>
        </div>
        <div className="bl-header-right">
          <div className="bl-search">
            <SearchIcon />
            <input
              placeholder="Search by name, vendor, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="bl-refresh-btn"
            onClick={() => fetchBookings(true)}
            disabled={refreshing || loading}
            title="Refresh"
          >
            <RefreshIcon spinning={refreshing} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      {!loading && !error && statuses.length > 1 && (
        <div className="bl-filters">
          {statuses.map((s) => (
            <button
              key={s}
              className={`bl-filter-btn${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "All" ? "All" : (STATUS_LABEL[s] || s)}
            </button>
          ))}
        </div>
      )}

      {/* Card / Table */}
      <div className="bl-card">
        <div className="bl-table-wrapper">
          {loading ? (
            <div className="bl-state">
              <div className="bl-spinner" />
              <p>Loading bookings…</p>
            </div>
          ) : error ? (
            <div className="bl-state">
              <span className="bl-state-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bl-state">
              <span className="bl-state-icon">📋</span>
              <p>
                {bookings.length === 0
                  ? "No bookings found. Make sure your API is connected."
                  : "No bookings match your current filters."}
              </p>
            </div>
          ) : (
            <table className="bl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Vendor / Shop</th>
                  <th>Date &amp; Time</th>
                  <th>Advance payment</th>
                  <th>Status</th>
                  <th>Balance payment</th>
                  <th>Status</th>
                  <th>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id ?? i}>
                    {/* ID */}
                    <td data-label="ID">
                      <div className="bl-cell-id">#{b.id}</div>
                      <div className="bl-cell-booking-no">{b.booking_number || ""}</div>
                    </td>

                    {/* Customer */}
                    <td data-label="Customer">
                      <div className="bl-user-cell">
                        <div className="bl-avatar">
                          {(b.customer_name || b.user_name || "U").charAt(0)}
                        </div>
                        <div>
                          <div className="bl-user-name">{b.customer_name || b.user_name || "—"}</div>
                          <div className="bl-user-sub">{b.customer_phone || ""}</div>
                        </div>
                      </div>
                    </td>

                    {/* Vendor */}
                    <td data-label="Vendor">
                      <div className="bl-vendor-name">{b.vendor_name || "—"}</div>
                      {b.shop_name && (
                        <div className="bl-shop-name">{b.shop_name}</div>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td data-label="Date">
                      <div className="bl-date">{formatDate(b.booking_date)}</div>
                      {b.booking_time && (
                        <div className="bl-time">{b.booking_time}</div>
                      )}
                    </td>

                    {/* Amount */}
                    <td data-label="Amount">
                      <div className="bl-amount-total">{formatINR(b.total_amount)}</div>
                    </td>

                    {/* Payment */}
                    <td data-label="Payment">
                      <div className="bl-payment-row">
                        <Badge value={b.payment_status} labelMap={PAYMENT_LABEL} />
                      </div>
                    </td> 

                     <td data-label="Amount">
                      <div className="bl-amount-total">{formatINR(b.balance_amount)}</div>
                    </td>

                    {/* Payment */}
                    <td data-label="Payment">
                      <div className="bl-payment-row">
                        <Badge value={b.balance_payment_status} labelMap={PAYMENT_LABEL} />
                      </div>
                    </td>


                    {/* Booking Status */}
                    <td data-label="Status">
                      <Badge value={b.booking_status} labelMap={STATUS_LABEL} />
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