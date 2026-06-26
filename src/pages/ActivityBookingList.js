import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import "../styles/ActivityBookingList.css"

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const availabilityLabel = {
    all_days: "All Days",
    weekdays: "Weekdays",
    weekends: "Weekends",
};

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
        <div className="ab-lightbox" onMouseDown={onClose}>
            <div className="ab-lightbox-inner" onMouseDown={(e) => e.stopPropagation()}>
                <button className="ab-lightbox-close" onClick={onClose} aria-label="Close">
                    &#x2715;
                </button>
                <img src={src} alt={caption} className="ab-lightbox-img" draggable={false} />
                <div className="ab-lightbox-caption">{caption}</div>
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
            className="ab-doc-thumb-wrap"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
        >
            {!imgError && src ? (
                <img
                    src={src}
                    alt={label}
                    className="ab-doc-thumb"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="ab-doc-thumb ab-doc-thumb--fallback">🪪</div>
            )}
            <div className="ab-doc-overlay"><span>🔍</span></div>
            <div className="ab-doc-label">{label}</div>
        </div>
    );
}

/* ══════════════════════════════════════════
   ActivityBookingCard
   ══════════════════════════════════════════ */
function ActivityBookingCard({ v }) {
    const [avatarError, setAvatarError] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    const openLightbox = useCallback((src, caption) => setLightbox({ src, caption }), []);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    const avgRating = v.ratings?.average_rating ?? "0.00";
    const totalReviews = v.ratings?.total_reviews ?? 0;
    const addr = v.address || {};
    const wh = v.working_hours || {};


    return (
        <>
            <div className="ab-card">

                {/* ── Banner ── */}
                <div className="ab-card-banner">
                    <div className="ab-avatar-wrap">
                        {v.profile_photo && !avatarError ? (
                            <img
                                src={v.profile_photo}
                                alt={v.full_name}
                                className="ab-avatar"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div className="ab-avatar-fallback">
                                {v.full_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Card body ── */}
                <div className="ab-card-body">
                    <div className="ab-name">{v.full_name}</div>
                    <div className="ab-shop">{v.shop_name || "Independent Instructor"}</div>

                    {v.activity?.name && (
                        <span className="ab-activity-badge">
                            🎯 {v.activity.name}
                        </span>
                    )}

                    {/* Info grid */}
                    <div className="ab-info-grid">
                        <div className="ab-info-item">
                            <span className="ab-info-label">📞 Phone</span>
                            <span className="ab-info-value">{v.phone}</span>
                        </div>
                        <div className="ab-info-item">
                            <span className="ab-info-label">💬 WhatsApp</span>
                            <span className="ab-info-value">{v.whatsapp_number || "—"}</span>
                        </div>
                        <div className="ab-info-item">
                            <span className="ab-info-label">✉️ Email</span>
                            <span className="ab-info-value ab-info-value--sm">{v.email}</span>
                        </div>
                        <div className="ab-info-item">
                            <span className="ab-info-label">📍 City</span>
                            <span className="ab-info-value">
                                {addr.city}{addr.pincode ? ` – ${addr.pincode}` : ""}
                            </span>
                        </div>
                        <div className="ab-info-item">
                            <span className="ab-info-label">🕐 Timing</span>
                            <span className="ab-info-value">
                                {formatTime(wh.start_time)} – {formatTime(wh.end_time)}
                            </span>
                        </div>
                        <div className="ab-info-item">
                            <span className="ab-info-label">🌐 Languages</span>
                            <span className="ab-info-value ab-info-value--sm">{v.languages_known || "—"}</span>
                        </div>
                        {v.experience && (
                            <div className="ab-info-item">
                                <span className="ab-info-label">🏆 Experience</span>
                                <span className="ab-info-value">{v.experience}</span>
                            </div>
                        )}
                        {v.upi_id && (
                            <div className="ab-info-item">
                                <span className="ab-info-label">💳 UPI</span>
                                <span className="ab-info-value ab-info-value--sm">{v.upi_id}</span>
                            </div>
                        )}
                        <div className="ab-info-item">
                            <span className="ab-info-label">📌 Address</span>
                            <span className="ab-info-value ab-info-value--sm">
                                {[addr.address1, addr.address2].filter(Boolean).join(", ") || "—"}
                            </span>
                        </div>

                         <div className="ab-info-item">
                            <span className="ab-info-label">📅 Joined Date</span>
                            <span className="ab-info-value ab-info-value--sm">
                               {v.created_at ? new Date(v.created_at).toLocaleDateString("en-GB") : "—"}
                            </span>
                        </div>
                        
                        <div className="ab-info-item">
                            <span className="ab-info-label">🔢 Reviews</span>
                            <span className="ab-info-value">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* Availability + Rating */}
                    <div className="ab-meta-row">
                        <span className={`ab-avail-badge ab-avail-badge--${v.availability}`}>
                            {availabilityLabel[v.availability] || v.availability}
                        </span>
                        <div className="ab-rating">
                            <span className="ab-stars">{renderStars(avgRating)}</span>
                            <span className="ab-rating-num">{parseFloat(avgRating).toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Description */}
                    {v.business_description && (
                        <>
                            <hr className="ab-divider" />
                            <p className="ab-desc">{v.business_description}</p>
                        </>
                    )}

                    {/* Documents */}
                    <hr className="ab-divider" />
                    <div className="ab-docs-section">
                        <div className="ab-docs-title">Documents</div>
                        <div className="ab-docs-grid">
                            <DocThumb
                                src={v.profile_photo}
                                label="Profile Photo"
                                onClick={() => openLightbox(v.profile_photo, `${v.full_name} — Profile Photo`)}
                            />
                            <DocThumb
                                src={v.government_id}
                                label="Government ID"
                                onClick={() => openLightbox(v.government_id, `${v.full_name} — Government ID`)}
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
   ActivityBookingList — main export
   ══════════════════════════════════════════ */
export default function ActivityBookingList() {
    const [vendors, setVendors] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [activityFilter, setActivityFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 9 cards per page (3x3)

    useEffect(() => {
        let list = vendors;

        if (activityFilter !== "All")
            list = list.filter((v) => v.activity?.name === activityFilter);

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (v) =>
                    v.full_name?.toLowerCase().includes(q) ||
                    v.shop_name?.toLowerCase().includes(q) ||
                    v.activity?.name?.toLowerCase().includes(q) ||
                    v.address?.city?.toLowerCase().includes(q)
            );
        }

        setFiltered(list);
        setCurrentPage(1); // Reset to first page
    }, [search, activityFilter, vendors]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/act/admin/activity-bookings`, {
                    headers: { Authorization: `Bearer ${TOKEN()}` },
                });
                const data = await res.json();
                if (data.success) {
                    setVendors(data.data);
                    setFiltered(data.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const activities = ["All", ...new Set(vendors.map((v) => v.activity?.name).filter(Boolean))];

    useEffect(() => {
        let list = vendors;
        if (activityFilter !== "All")
            list = list.filter((v) => v.activity?.name === activityFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (v) =>
                    v.full_name?.toLowerCase().includes(q) ||
                    v.shop_name?.toLowerCase().includes(q) ||
                    v.activity?.name?.toLowerCase().includes(q) ||
                    v.address?.city?.toLowerCase().includes(q)
            );
        }
        setFiltered(list);
    }, [search, activityFilter, vendors]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;

    const currentItems = filtered.slice(indexOfFirst, indexOfLast);

    return (
        <div>
            {/* Header */}
            <div className="ab-header">
                <div>
                    <h1>Activity Bookings</h1>
                    <p>{filtered.length} instructor{filtered.length !== 1 ? "s" : ""} found</p>
                </div>
                <div className="ab-search-bar">
                    <span>🔍</span>
                    <input
                        placeholder="Search by name, shop, activity, city…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Activity filter chips */}
            <div className="ab-filters">
                {activities.map((act) => (
                    <button
                        key={act}
                        className={`ab-chip${activityFilter === act ? " active" : ""}`}
                        onClick={() => setActivityFilter(act)}
                    >
                        {act}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="ab-loading"><span>⏳</span><p>Loading activity bookings…</p></div>
            ) : filtered.length === 0 ? (
                <div className="ab-empty"><span>🔍</span><p>No instructors match your search.</p></div>
            ) : (
                <div className="ab-grid">
                    {currentItems.map((v) => (
                        <ActivityBookingCard key={v.id} v={v} />
                    ))}
                </div>
            )}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={currentPage === index + 1 ? "active" : ""}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}