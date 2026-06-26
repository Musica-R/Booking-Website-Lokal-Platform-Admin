import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import "../styles/NearbyStallList.css"

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const PAGE_SIZE = 10;

const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

/* ══════════════════════════════════════════
   Lightbox
   ══════════════════════════════════════════ */
function Lightbox({ src, caption, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="ns-lightbox" onMouseDown={onClose}>
      <div className="ns-lightbox-inner" onMouseDown={(e) => e.stopPropagation()}>
        <button className="ns-lightbox-close" onClick={onClose} aria-label="Close">
          &#x2715;
        </button>
        <img src={src} alt={caption} className="ns-lightbox-img" draggable={false} />
        <div className="ns-lightbox-caption">{caption}</div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════
   DocThumb
   ══════════════════════════════════════════ */
function DocThumb({ src, label, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="ns-doc-thumb-wrap"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={label}
          className="ns-doc-thumb"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="ns-doc-thumb ns-doc-thumb--fallback">🪪</div>
      )}
      <div className="ns-doc-overlay"><span>🔍</span></div>
      <div className="ns-doc-label">{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   NearbyStallCard
   ══════════════════════════════════════════ */
function NearbyStallCard({ v }) {
  const [avatarError, setAvatarError] = useState(false);
  const [lightbox, setLightbox]       = useState(null);

  const openLightbox  = useCallback((src, caption) => setLightbox({ src, caption }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const addr = v.address || {};

  return (
    <>
      <div className="ns-card">

        {/* ── Banner ── */}
        <div className="ns-card-banner">
          {/* Status + Verified badges */}
          <div className="ns-banner-badges">
            <span className={`ns-status-badge ns-status-badge--${v.status}`}>
              {v.status === "pending" ? "⏳ Pending" : "✓ Active"}
            </span>
            {v.is_verified ? (
              <span className="ns-verified-badge">✓ Verified</span>
            ) : (
              <span className="ns-unverified-badge">Unverified</span>
            )}
          </div>

          <div className="ns-avatar-wrap">
            {v.profile_photo && !avatarError ? (
              <img
                src={v.profile_photo}
                alt={v.shop_name}
                className="ns-avatar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="ns-avatar-fallback">
                {v.shop_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="ns-card-body">
          <div className="ns-name">{v.shop_name}</div>
          {v.description && (
            <span className="ns-desc-badge">🏪 {v.description}</span>
          )}

          {/* Info grid */}
          <div className="ns-info-grid">
            <div className="ns-info-item">
              <span className="ns-info-label">📞 Phone</span>
              <span className="ns-info-value">{v.phone}</span>
            </div>
            <div className="ns-info-item">
              <span className="ns-info-label">💬 WhatsApp</span>
              <span className="ns-info-value">{v.whatsapp_number || "—"}</span>
            </div>
            <div className="ns-info-item">
              <span className="ns-info-label">✉️ Email</span>
              <span className="ns-info-value ns-info-value--sm">{v.email}</span>
            </div>
            <div className="ns-info-item">
              <span className="ns-info-label">📍 City</span>
              <span className="ns-info-value">
                {addr.city}{addr.pincode ? ` – ${addr.pincode}` : ""}
              </span>
            </div>
            <div className="ns-info-item">
              <span className="ns-info-label">🕐 Hours</span>
              <span className="ns-info-value">
                {formatTime(v.opening_time)} – {formatTime(v.closing_time)}
              </span>
            </div>
            <div className="ns-info-item">
              <span className="ns-info-label">💳 Fee</span>
              <span className="ns-info-value">₹{v.listing_fee}</span>
            </div>
            <div className="ns-info-item">
              <span className="ns-info-label">💰 Payment</span>
              <span className={`ns-payment-tag ns-payment-tag--${v.payment_status}`}>
                {v.payment_status === "paid" ? "✓ Paid" : v.payment_status}
              </span>
            </div>

            <div className="ns-info-item">
              <span className="ns-info-label">📌 Address</span>
              <span className="ns-info-value ns-info-value--sm">
                {[addr.address1, addr.address2].filter(Boolean).join(", ") || "—"}
              </span>
            </div>

            <div className="ns-info-item">
              <span className="ns-info-label">📅 Joined Date</span>
              <span className="ns-info-value ns-info-value--sm">
                {v.created_at ? new Date(v.created_at).toLocaleDateString("en-GB") : "—"}
              </span>
            </div>
          </div>

          {/* Map link */}
          {v.google_map_link && (
            <a
              className="ns-map-link"
              href={v.google_map_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              🗺️ View on Google Maps
            </a>
          )}

          {/* Documents */}
          <hr className="ns-divider" />
          <div className="ns-docs-section">
            <div className="ns-docs-title">Documents</div>
            <div className="ns-docs-grid">
              <DocThumb
                src={v.profile_photo}
                label="Profile Photo"
                onClick={() => openLightbox(v.profile_photo, `${v.shop_name} — Profile Photo`)}
              />
              <DocThumb
                src={v.government_id}
                label="Government ID"
                onClick={() => openLightbox(v.government_id, `${v.shop_name} — Government ID`)}
              />
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <Lightbox src={lightbox.src} caption={lightbox.caption} onClose={closeLightbox} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   Pagination
   ══════════════════════════════════════════ */
function Pagination({ total, page, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="ns-pagination">
      <button
        className="ns-page-btn ns-page-btn--nav"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        ‹
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="ns-page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`ns-page-btn${page === p ? " active" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="ns-page-btn ns-page-btn--nav"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        ›
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   NearbyStallList — main export
   ══════════════════════════════════════════ */
export default function NearbyStallList() {
  const [stalls,        setStalls]        = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [page,          setPage]          = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/act/nearby-stalls`, {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        const data = await res.json();
        if (data.success) {
          setStalls(data.data);
          setFiltered(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statuses = ["All", ...new Set(stalls.map((s) => s.status).filter(Boolean))];

  useEffect(() => {
    let list = stalls;
    if (statusFilter !== "All")
      list = list.filter((s) => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.shop_name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.address?.city?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.includes(q)
      );
    }
    setFiltered(list);
    setPage(1); // reset to first page on filter/search change
  }, [search, statusFilter, stalls]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="ns-header">
        <div>
          <h1>Nearby Stalls</h1>
          <p>{filtered.length} stall{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="ns-search-bar">
          <span>🔍</span>
          <input
            placeholder="Search by name, type, city, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status filter chips */}
      <div className="ns-filters">
        {statuses.map((s) => (
          <button
            key={s}
            className={`ns-chip${statusFilter === s ? " active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="ns-loading"><span>⏳</span><p>Loading nearby stalls…</p></div>
      ) : filtered.length === 0 ? (
        <div className="ns-empty"><span>🔍</span><p>No stalls match your search.</p></div>
      ) : (
        <>
          <div className="ns-grid">
            {paginated.map((v) => <NearbyStallCard key={v.id} v={v} />)}
          </div>

          <div className="ns-pagination-row">
            <p className="ns-pagination-info">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={PAGE_SIZE}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          </div>
        </>
      )}
    </div>
  );
}