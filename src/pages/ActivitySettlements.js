import React, { useState, useEffect } from "react";
import "../styles/ActivitySettlements.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const PAGE_SIZE = 10;

const statusLabel = {
  pending: "Pending",
  settled: "Settled",
  on_hold: "On Hold",
  paid: "Paid",
};

const formatCurrency = (val) => {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (date, time) => {
  if (!date) return "—";
  const datePart = formatDate(date);
  return time ? `${datePart}, ${time.slice(0, 5)}` : datePart;
};

// Fallback used until the API starts returning a real upi_id field
const DEFAULT_UPI_ID = "Not added yet";

/* ══════════════════════════════════════════
   Pagination
   ══════════════════════════════════════════ */
function Pagination({ total, page, onPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="as-pagination">
      <span className="as-pagination-info">
        Showing {from}–{to} of {total}
      </span>
      <div className="as-pagination-controls">
        <button
          className="as-page-btn"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="as-page-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`as-page-btn${p === page ? " active" : ""}`}
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className="as-page-btn"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SettlementCard
   ══════════════════════════════════════════ */
function SettlementCard({ s, onMarkPaid, payingId }) {
  const upiId = s.upi_id && s.upi_id.trim() ? s.upi_id : DEFAULT_UPI_ID;
  const hasUpi = upiId !== DEFAULT_UPI_ID;
  const isPaid = s.settlement_status === "paid";
  const isPaying = payingId === s.booking_id;

  return (
    <div className="as-card">
      <div className="as-card-header">
        <div className="as-avatar">{(s.vendor_name || "?").charAt(0).toUpperCase()}</div>
        <div className="as-header-text">
          <div className="as-vendor-name">{s.vendor_name}</div>
          <div className="as-shop-name">{s.shop_name}</div>
        </div>
        <span className={`as-status-badge as-status-badge--${s.settlement_status}`}>
          {statusLabel[s.settlement_status] || s.settlement_status}
        </span>
      </div>

      <div className="as-booking-row">
        <span className="as-booking-number">#{s.booking_number}</span>
        {/* <span className={`as-mini-badge as-mini-badge--${(s.booking_status || "").toLowerCase()}`}>
          {s.booking_status}
        </span> */}
        <span className={`as-mini-badge as-mini-badge--${(s.payment_status || "").toLowerCase()}`}>
          {s.payment_status}
        </span>
      </div>

      <div className="as-activity-row">
        <span>📅 {formatDateTime(s.booking_date, s.booking_time)}</span>
        <span>👤 {s.user_name} ({s.user_mobile})</span>
      </div>

      <hr className="as-divider" />

      <div className="as-amount-grid">
        <div className="as-amount-item">
          <span className="as-amount-label">Total Amount</span>
          <span className="as-amount-value">{formatCurrency(s.total_amount)}</span>
        </div>
        <div className="as-amount-item">
          <span className="as-amount-label">Advance Paid</span>
          <span className="as-amount-value">{formatCurrency(s.advance_amount)}</span>
        </div>
        <div className="as-amount-item">
          <span className="as-amount-label">Razorpay Settlement</span>
          <span className="as-amount-value">{formatCurrency(s.razorpay_settlement)}</span>
        </div>
        <div className="as-amount-item">
          <span className="as-amount-label">Razorpay Fee</span>
          <span className="as-amount-value as-amount-value--neg">−{formatCurrency(s.razorpay_fee)}</span>
        </div>
        <div className="as-amount-item">
          <span className="as-amount-label">Razorpay Tax</span>
          <span className="as-amount-value as-amount-value--neg">−{formatCurrency(s.razorpay_tax)}</span>
        </div>
        <div className="as-amount-item">
          <span className="as-amount-label">Total Received</span>
          <span className="as-amount-value">{formatCurrency(s.total_received)}</span>
        </div>
        
        <div className="as-amount-item">
          <span className="as-amount-label">
            Platform Fee ({parseFloat(s.platform_commission_percent || 0)}%)
          </span>
          <span className="as-amount-value">{formatCurrency(s.platform_commission_amount)}</span>
        </div>

      </div>

      <hr className="as-divider" />

      <div className="as-payout-row">
        <span className="as-payout-label">Vendor Payout</span>
        <span className="as-payout-amount">{formatCurrency(s.vendor_amount)}</span>
      </div>

      <div className={`as-upi-chip${hasUpi ? "" : " as-upi-chip--empty"}`} title={hasUpi ? "Vendor UPI ID" : "UPI ID not added yet"}>
        <span className="as-upi-icon">📱</span>
        <span className="as-upi-id">{upiId}</span>
        {!hasUpi && <span className="as-upi-action">Pending</span>}
      </div>

      <button
        className={`as-mark-paid-btn${isPaid ? " as-mark-paid-btn--done" : ""}${isPaying ? " as-mark-paid-btn--loading" : ""}`}
        onClick={() => onMarkPaid(s.booking_id)}
        disabled={isPaid || isPaying}
        title={isPaid ? "Already marked as paid" : "Mark this settlement as paid"}
      >
        {isPaid ? "✓ Paid" : isPaying ? "Updating…" : "Mark as Paid"}
      </button>

      <div className="as-dates-row">
        <span>Created: {formatDate(s.created_at)}</span>
        {s.settled_at && <span>Settled: {formatDate(s.settled_at)}</span>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ActivitySettlements — main export
   ══════════════════════════════════════════ */
export default function ActivitySettlements() {
  const [settlements, setSettlements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/act/activity-vendor-settlements`, {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        const data = await res.json();
        if (data.success) {
          setSettlements(data.data);
          setFiltered(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statuses = ["All", ...new Set(settlements.map((s) => s.settlement_status))];

  useEffect(() => {
    let list = settlements;
    if (statusFilter !== "All") list = list.filter((s) => s.settlement_status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.vendor_name?.toLowerCase().includes(q) ||
          s.shop_name?.toLowerCase().includes(q) ||
          s.booking_number?.toLowerCase().includes(q) ||
          s.user_name?.toLowerCase().includes(q) ||
          s.upi_id?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
    setPage(1);
  }, [search, statusFilter, settlements]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkPaid = async (bookingId) => {
    setPayError("");
    setPayingId(bookingId);
    try {
      const res = await fetch(
        `${API_BASE}/api/vendors/activity-vendor-settlement/pay/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN()}`,
          },
          body: JSON.stringify({ settlement_status: "paid" }),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update settlement status");
      }

      setSettlements((prev) =>
        prev.map((s) =>
          s.booking_id === bookingId
            ? { ...s, settlement_status: "paid", ...(data.data || {}) }
            : s
        )
      );
    } catch (e) {
      console.error(e);
      setPayError(e.message || "Something went wrong while marking as paid.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <div className="as-header">
        <div>
          <h1>Activity Settlements</h1>
          <p>{filtered.length} settlement{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="as-search-bar">
          <span>🔍</span>
          <input
            placeholder="Search by vendor, shop, booking, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {payError && <div className="as-error-banner">{payError}</div>}

      <div className="as-filters">
        {statuses.map((st) => (
          <button
            key={st}
            className={`as-chip${statusFilter === st ? " active" : ""}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === "All" ? "All" : statusLabel[st] || st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="as-loading"><span>⏳</span><p>Loading settlements…</p></div>
      ) : filtered.length === 0 ? (
        <div className="as-empty"><span>🔍</span><p>No settlements match your search.</p></div>
      ) : (
        <>
          <div className="as-grid">
            {paginated.map((s) => (
              <SettlementCard
                key={s.settlement_id}
                s={s}
                onMarkPaid={handleMarkPaid}
                payingId={payingId}
              />
            ))}
          </div>

          <Pagination total={filtered.length} page={page} onPage={setPage} />
        </>
      )}
    </div>
  );
}