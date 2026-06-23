import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import "../styles/VendorSettlements.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const statusLabel = {
  pending: "Pending",
  settled: "Settled",
  on_hold: "On Hold",
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

/* ══════════════════════════════════════════
   UpiQrModal — portal-mounted, generates the
   UPI deep link QR for one settlement row
   ══════════════════════════════════════════ */
function UpiQrModal({ settlement, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const amount = parseFloat(settlement.vendor_amount || 0).toFixed(2);
  const note = `Settlement ${settlement.booking_number}`;
  const upiUri =
    `upi://pay?pa=${encodeURIComponent(settlement.upi_id)}` +
    `&pn=${encodeURIComponent(settlement.vendor_name)}` +
    `&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  return ReactDOM.createPortal(
    <div className="vs-qr-overlay" onMouseDown={onClose}>
      <div className="vs-qr-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="vs-qr-close" onClick={onClose} aria-label="Close">&#x2715;</button>

        <div className="vs-qr-vendor">{settlement.vendor_name}</div>
        <div className="vs-qr-shop">{settlement.shop_name}</div>

        <div className="vs-qr-code-wrap">
          <QRCodeSVG value={upiUri} size={220} level="M" includeMargin />
        </div>

        <div className="vs-qr-amount">{formatCurrency(settlement.vendor_amount)}</div>
        <div className="vs-qr-upi">{settlement.upi_id}</div>
        <div className="vs-qr-hint">Scan with any UPI app to pay</div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════
   SettlementCard
   ══════════════════════════════════════════ */
function SettlementCard({ s, onShowQr }) {
  return (
    <div className="vs-card">
      <div className="vs-card-header">
        <div className="vs-avatar">{s.vendor_name.charAt(0).toUpperCase()}</div>
        <div className="vs-header-text">
          <div className="vs-vendor-name">{s.vendor_name}</div>
          <div className="vs-shop-name">{s.shop_name}</div>
        </div>
        <span className={`vs-status-badge vs-status-badge--${s.settlement_status}`}>
          {statusLabel[s.settlement_status] || s.settlement_status}
        </span>
      </div>

      <div className="vs-booking-row">
        <span className="vs-booking-number">#{s.booking_number}</span>
        <span className={`vs-mini-badge vs-mini-badge--${s.booking_status}`}>{s.booking_status}</span>
        <span className={`vs-mini-badge vs-mini-badge--${s.payment_status}`}>{s.payment_status}</span>
      </div>

      <hr className="vs-divider" />

      <div className="vs-amount-grid">
        <div className="vs-amount-item">
          <span className="vs-amount-label">Advance Paid</span>
          <span className="vs-amount-value">{formatCurrency(s.advance_paid)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Balance Paid</span>
          <span className="vs-amount-value">{formatCurrency(s.balance_paid)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Total Paid (User)</span>
          <span className="vs-amount-value">{formatCurrency(s.total_paid_user)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Razorpay Settlement</span>
          <span className="vs-amount-value">{formatCurrency(s.razorpay_settlement)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Razorpay Fee</span>
          <span className="vs-amount-value vs-amount-value--neg">−{formatCurrency(s.razorpay_fee)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Razorpay Tax</span>
          <span className="vs-amount-value vs-amount-value--neg">−{formatCurrency(s.razorpay_tax)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Total Received</span>
          <span className="vs-amount-value">{formatCurrency(s.total_received)}</span>
        </div>
        <div className="vs-amount-item">
          <span className="vs-amount-label">Platform Processing Fee ({parseFloat(s.platform_commission_percent)}%)</span>
          <span className="vs-amount-value ">{formatCurrency(s.platform_commission_amount)}</span>
        </div>
      </div>

      <hr className="vs-divider" />

      <div className="vs-payout-row">
        <span className="vs-payout-label">Vendor Payout</span>
        <span className="vs-payout-amount">{formatCurrency(s.vendor_amount)}</span>
      </div>

      <button className="vs-upi-chip" onClick={() => onShowQr(s)} title="Click to show UPI QR code">
        <span className="vs-upi-icon">📱</span>
        <span className="vs-upi-id">{s.upi_id}</span>
        <span className="vs-upi-action">Show QR →</span>
      </button>

      <div className="vs-dates-row">
        <span>Created: {formatDate(s.created_at)}</span>
        {s.settled_at && <span>Settled: {formatDate(s.settled_at)}</span>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   VendorSettlements — main export
   ══════════════════════════════════════════ */
export default function VendorSettlements() {
  const [settlements, setSettlements] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading]         = useState(true);
  const [qrSettlement, setQrSettlement] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vendors/admin/vendor-settlements`, {
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
          s.vendor_name.toLowerCase().includes(q) ||
          s.shop_name?.toLowerCase().includes(q) ||
          s.booking_number.toLowerCase().includes(q) ||
          s.upi_id?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, settlements]);

  return (
    <div>
      <div className="vs-header">
        <div>
          <h1>Vendor Settlements</h1>
          <p>{filtered.length} settlement{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="vs-search-bar">
          <span>🔍</span>
          <input
            placeholder="Search by vendor, shop, booking, UPI ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="vs-filters">
        {statuses.map((st) => (
          <button
            key={st}
            className={`vs-chip${statusFilter === st ? " active" : ""}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === "All" ? "All" : statusLabel[st] || st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="vs-loading"><span>⏳</span><p>Loading settlements…</p></div>
      ) : filtered.length === 0 ? (
        <div className="vs-empty"><span>🔍</span><p>No settlements match your search.</p></div>
      ) : (
        <div className="vs-grid">
          {filtered.map((s) => (
            <SettlementCard key={s.settlement_id} s={s} onShowQr={setQrSettlement} />
          ))}
        </div>
      )}

      {qrSettlement && (
        <UpiQrModal settlement={qrSettlement} onClose={() => setQrSettlement(null)} />
      )}
    </div>
  );
}