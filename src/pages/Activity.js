import React, { useState, useEffect, useCallback } from "react";
import "../styles/Activity.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Completed: "Completed",
  Cancelled_by_user: "Cancelled (User)",
  Cancelled_by_vendor: "Cancelled (Vendor)",
};

const PAYMENT_LABEL = {
  paid: "Paid",
  unpaid: "Unpaid",
};

function badgeClass(status = "") {
  return status.toString().toLowerCase().replace(/ /g, "_");
}

function formatINR(value) {
  const n = parseFloat(value);
  if (value === undefined || value === null || value === "" || isNaN(n)) return "—";
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
    <span className={`abl-badge ${cls}`}>
      <span className="abl-badge-dot" />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Activity() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/act/activity-bookings`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (data.success) {
        const list = data.data || [];
        setBookings(list);
        setFiltered(list);
        setCurrentPage(1);
      } else {
        throw new Error(data.message || "Failed to load activity bookings.");
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
      list = list.filter((b) => (b.booking_status || "Pending") === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.customer_name?.toLowerCase().includes(q) ||
          b.user_name?.toLowerCase().includes(q) ||
          b.vendor_name?.toLowerCase().includes(q) ||
          b.shop_name?.toLowerCase().includes(q) ||
          b.activity_name?.toLowerCase().includes(q) ||
          b.plan_name?.toLowerCase().includes(q) ||
          b.booking_number?.toLowerCase().includes(q) ||
          b.id?.toString().includes(q)
      );
    }

    setFiltered(list);
  }, [search, statusFilter, bookings]);

  // ── Unique statuses for filter tabs ────────────────────────────────────────
  const statuses = ["All", ...new Set(bookings.map((b) => b.booking_status || "Pending"))];

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="abl-wrapper">
      {/* Header */}
      <div className="abl-header">
        <div className="abl-header-left">
          <h1>Activity Bookings</h1>
          <p>
            {loading
              ? "Loading…"
              : error
                ? "Could not load activity bookings"
                : `${filtered.length} of ${bookings.length} bookings`}
          </p>
        </div>
        <div className="abl-header-right">
          <div className="abl-search">
            <SearchIcon />
            <input
              placeholder="Search by name, vendor, activity, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="abl-refresh-btn"
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
        <div className="abl-filters">
          {statuses.map((s) => (
            <button
              key={s}
              className={`abl-filter-btn${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "All" ? "All" : (STATUS_LABEL[s] || s)}
            </button>
          ))}
        </div>
      )}

      {/* Card / Table */}
      <div className="abl-card">
        <div className="abl-table-wrapper">
          {loading ? (
            <div className="abl-state">
              <div className="abl-spinner" />
              <p>Loading activity bookings…</p>
            </div>
          ) : error ? (
            <div className="abl-state">
              <span className="abl-state-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="abl-state">
              <span className="abl-state-icon">📋</span>
              <p>
                {bookings.length === 0
                  ? "No activity bookings found. Make sure your API is connected."
                  : "No bookings match your current filters."}
              </p>
            </div>
          ) : (
            <table className="abl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Vendor / Activity</th>
                  <th>Date &amp; Time</th>
                  <th>Advance Payment</th>
                  <th>Status</th>
                  {/* <th>Balance</th>
                  <th>Booking Status</th> */}
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, i) => {
                //   const total = parseFloat(b.total_amount) || 0;
                //   const paidAdvance = parseFloat(b.paid_advance_amount) || 0;
                //   const balance = total - paidAdvance;

                  return (
                    <tr key={b.id ?? i}>
                      {/* ID */}
                      <td data-label="ID">
                        <div className="abl-cell-id">#{b.id}</div>
                        <div className="abl-cell-booking-no">{b.booking_number || ""}</div>
                      </td>

                      {/* Customer */}
                      <td data-label="Customer">
                        <div className="abl-user-cell">
                          <div className="abl-avatar">
                            {(b.customer_name || b.user_name || "U").charAt(0)}
                          </div>
                          <div>
                            <div className="abl-user-name">{b.customer_name || b.user_name || "—"}</div>
                            <div className="abl-user-sub">{b.customer_phone || b.user_phone || ""}</div>
                          </div>
                        </div>
                      </td>

                      {/* Vendor / Activity */}
                      <td data-label="Vendor">
                        <div className="abl-vendor-name">{b.vendor_name || "—"}</div>
                        {b.shop_name && (
                          <div className="abl-shop-name">{b.shop_name}</div>
                        )}
                        {(b.activity_name || b.plan_name) && (
                          <div className="abl-activity-name">
                            {b.activity_name}
                            {b.plan_name ? ` · ${b.plan_name}` : ""}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td data-label="Date">
                        <div className="abl-date">{formatDate(b.booking_date)}</div>
                        {b.booking_time && (
                          <div className="abl-time">{b.booking_time}</div>
                        )}
                      </td>

                      {/* Advance Amount */}
                      <td data-label="Advance">
                        <div className="abl-amount-total">{formatINR(b.paid_advance_amount)}</div>
                        {b.advance_amount && (
                          <div className="abl-amount-sub">of {formatINR(b.advance_amount)}</div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td data-label="Payment">
                        <div className="abl-payment-row">
                          <Badge value={b.payment_status} labelMap={PAYMENT_LABEL} />
                        </div>
                      </td>

                      {/* Balance */}
                      {/* <td data-label="Balance">
                        <div className="abl-amount-total">{formatINR(balance)}</div>
                      </td> */}

                      {/* Booking Status */}
                      {/* <td data-label="Status">
                        <Badge value={b.booking_status} labelMap={STATUS_LABEL} />
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="abl-pagination">
          <button
            className="abl-page-btn"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`abl-page-btn${currentPage === page ? " active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="abl-page-btn"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}