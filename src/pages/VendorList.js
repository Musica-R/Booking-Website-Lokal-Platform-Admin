import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import "../styles/VendorList.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const availabilityLabel = {
  all_days: "All Days",
  weekdays: "Weekdays",
  weekends: "Weekends",
};

/* ── Per-category colour themes ── */



const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const renderStars = (rating) => {
  const r = Math.min(5, Math.round(parseFloat(rating)));
  return "★".repeat(r) + "☆".repeat(5 - r);
};

/* ══════════════════════════════════════════
   Lightbox — portal-mounted, zero flicker
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
    <div className="vl-lightbox" onMouseDown={onClose}>
      <div className="vl-lightbox-inner" onMouseDown={(e) => e.stopPropagation()}>
        <button className="vl-lightbox-close" onClick={onClose} aria-label="Close">
          &#x2715;
        </button>
        <img src={src} alt={caption} className="vl-lightbox-img" draggable={false} />
        <div className="vl-lightbox-caption">{caption}</div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════
   DocThumb — thumbnail only, no lightbox state
   ══════════════════════════════════════════ */
function DocThumb({ src, label, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="vl-doc-thumb-wrap"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={label}
          className="vl-doc-thumb"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="vl-doc-thumb vl-doc-thumb--fallback">🪪</div>
      )}
      <div className="vl-doc-overlay"><span>🔍</span></div>
      <div className="vl-doc-label">{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   VendorCard
   ══════════════════════════════════════════ */
function VendorCard({ v }) {
  const [avatarError, setAvatarError] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { src, caption } | null
  // const theme = getTheme(v.category_name);

  const openLightbox = useCallback((src, caption) => setLightbox({ src, caption }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <>
      <div className="vl-card">

        {/* ── Coloured banner ── */}
        <div className="vl-card-banner">
          {/* <span className={`vl-status-badge${v.terms_accepted ? " verified" : " pending"}`}>
            {v.terms_accepted ? "✓ Verified" : "⏳ Pending"}
          </span> */}

          <div className="vl-avatar-wrap">
            {v.profile_url && !avatarError ? (
              <img
                src={v.profile_url}
                alt={v.full_name}
                className="vl-avatar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="vl-avatar-fallback">
                {v.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="vl-card-body">
          <div className="vl-name">{v.full_name}</div>
          <div className="vl-shop">{v.shop_name || "Independent Vendor"}</div>

          <span
            className="vl-category-badge"

          >
            {v.category_name}
          </span>

          {/* Info grid */}
          <div className="vl-info-grid">
            <div className="vl-info-item">
              <span className="vl-info-label">📞 Phone</span>
              <span className="vl-info-value">{v.phone}</span>
            </div>
            <div className="vl-info-item">
              <span className="vl-info-label">💬 WhatsApp</span>
              <span className="vl-info-value">{v.whatsapp_number || "—"}</span>
            </div>
            <div className="vl-info-item">
              <span className="vl-info-label">✉️ Email</span>
              <span className="vl-info-value vl-info-value--sm">{v.email}</span>
            </div>
            <div className="vl-info-item">
              <span className="vl-info-label">📍 City</span>
              <span className="vl-info-value">
                {v.city}{v.pincode ? ` – ${v.pincode}` : ""}
              </span>
            </div>
            <div className="vl-info-item">
              <span className="vl-info-label">🕐 Timing</span>
              <span className="vl-info-value">
                {formatTime(v.start_time)} – {formatTime(v.end_time)}
              </span>
            </div>
            <div className="vl-info-item">
              <span className="vl-info-label">🌐 Languages</span>
              <span className="vl-info-value vl-info-value--sm">{v.languages_known || "—"}</span>
            </div>
            {v.experience && (
              <div className="vl-info-item">
                <span className="vl-info-label">🏆 Experience</span>
                <span className="vl-info-value">{v.experience}</span>
              </div>
            )}
            <div className="vl-info-item">
              <span className="vl-info-label">📌 Address</span>
              <span className="vl-info-value vl-info-value--sm">
                {[v.address1, v.address2].filter(Boolean).join(", ") || "—"}
              </span>
            </div>


            <div className="vl-info-item">
              <span className="vl-info-label">📅 Joined Date</span>
              <span className="vl-info-value vl-info-value--sm">
                {v.created_at ? new Date(v.created_at).toLocaleDateString("en-GB") : "—"}
              </span>
            </div>

          </div>

          {/* Availability + Rating */}
          <div className="vl-meta-row">
            <span className={`vl-avail-badge vl-avail-badge--${v.availability}`}>
              {availabilityLabel[v.availability] || v.availability}
            </span>
            <div className="vl-rating">
              <span className="vl-stars">{renderStars(v.rating)}</span>
              <span className="vl-rating-num">{parseFloat(v.rating).toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          {v.business_description && (
            <>
              <hr className="vl-divider" />
              <p className="vl-desc">{v.business_description}</p>
            </>
          )}

          {/* Documents */}
          <hr className="vl-divider" />
          <div className="vl-docs-section">
            <div className="vl-docs-title">Documents</div>
            <div className="vl-docs-grid">
              <DocThumb
                src={v.profile_url}
                label="Profile Photo"
                onClick={() => openLightbox(v.profile_url, `${v.full_name} — Profile Photo`)}
              />
              <DocThumb
                src={v.government_id_url}
                label="Government ID"
                onClick={() => openLightbox(v.government_id_url, `${v.full_name} — Government ID`)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Portal lightbox — sits on document.body, never inside the card */}
      {lightbox && (
        <Lightbox src={lightbox.src} caption={lightbox.caption} onClose={closeLightbox} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   VendorList — main export
   ══════════════════════════════════════════ */
export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vendors/list-vendors`, {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        const data = await res.json();
        if (data.success) {
          setVendors(data.vendors);
          setFiltered(data.vendors);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = ["All", ...new Set(vendors.map((v) => v.category_name))];

  useEffect(() => {
    let list = vendors;
    if (categoryFilter !== "All")
      list = list.filter((v) => v.category_name === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.full_name.toLowerCase().includes(q) ||
          v.shop_name?.toLowerCase().includes(q) ||
          v.category_name.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, categoryFilter, vendors]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  useEffect(() => {
    let list = vendors;
    if (categoryFilter !== "All")
      list = list.filter((v) => v.category_name === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.full_name.toLowerCase().includes(q) ||
          v.shop_name?.toLowerCase().includes(q) ||
          v.category_name.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
    setCurrentPage(1); // ← reset to page 1 on every filter change
  }, [search, categoryFilter, vendors]);


  return (
    <div>
      {/* Header */}
      <div className="vl-header">
        <div>
          <h1>Vendor List</h1>
          <p>{filtered.length} vendor{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="vl-search-bar">
          <span>🔍</span>
          <input
            placeholder="Search by name, shop, category, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="vl-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`vl-chip${categoryFilter === cat ? " active" : ""}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="vl-loading"><span>⏳</span><p>Loading vendors…</p></div>
      ) : filtered.length === 0 ? (
        <div className="vl-empty"><span>🔍</span><p>No vendors match your search.</p></div>
      ) : (
        <div className="vl-grid">
          {paginated.map((v) => <VendorCard key={v.id} v={v} />)}
        </div>
      )}
      {totalPages > 1 && (
        <div className="vl-pagination">
          <button
            className="vl-page-btn"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`vl-page-btn${currentPage === page ? " active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="vl-page-btn"
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