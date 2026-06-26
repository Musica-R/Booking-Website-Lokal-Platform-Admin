import React, { useState, useEffect } from "react";
import "../styles/PlatformProfit.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");
const PAGE_SIZE = 10;

const bookingStatusLabel = {
    cancelled_by_user: "Cancelled by User",
    cancelled_by_vendor: "Cancelled by Vendor",
    completed: "Completed",
    pending: "Pending",
    confirmed: "Confirmed",
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

function Pagination({ total, page, onPage }) {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;

    const from = (page - 1) * PAGE_SIZE + 1;
    const to   = Math.min(page * PAGE_SIZE, total);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "…") {
            pages.push("…");
        }
    }

    return (
        <div className="pp-pagination">
            <span className="pp-pagination-info">
                Showing {from}–{to} of {total}
            </span>
            <div className="pp-pagination-controls">
                <button className="pp-page-btn" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous">‹</button>
                {pages.map((p, i) =>
                    p === "…"
                        ? <span key={`e-${i}`} className="pp-page-ellipsis">…</span>
                        : <button key={p} className={`pp-page-btn${p === page ? " active" : ""}`} onClick={() => onPage(p)}>{p}</button>
                )}
                <button className="pp-page-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages} aria-label="Next">›</button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   ProfitCard
   ══════════════════════════════════════════ */
function ProfitCard({ item }) {
    const initials = item.user_name
        ? item.user_name.charAt(0).toUpperCase()
        : "V";

    return (
        <div className="pp-card">
            {/* Header */}
            <div className="pp-card-header">
                <div className="pp-avatar">{initials}</div>
                <div className="pp-header-text">
                    <div className="pp-vendor-name">{item.user_name}</div>

                </div>
                <span
                    className={`pp-status-badge pp-status-badge--${item.booking_status}`}
                >
                    {bookingStatusLabel[item.booking_status] || item.booking_status}
                </span>
            </div>

            {/* Booking row */}
            <div className="pp-booking-row">
                <span className="pp-booking-number">#{item.booking_number}</span>
                <span
                    className={`pp-mini-badge pp-mini-badge--${item.payment_status}`}
                >
                    {item.payment_status}
                </span>
                <span
                    className={`pp-mini-badge pp-mini-badge--${item.balance_payment_status}`}
                >
                    Balance: {item.balance_payment_status}
                </span>
            </div>

            <hr className="pp-divider" />

            {/* Amounts */}
            <div className="pp-amount-grid">
                <div className="pp-amount-item">
                    <span className="pp-amount-label">Total Booking Amount</span>
                    <span className="pp-amount-value">
                        {formatCurrency(item.total_amount)}
                    </span>
                </div>
                <div className="pp-amount-item">
                    <span className="pp-amount-label">Platform Profit</span>
                    <span className="pp-amount-value pp-amount-value--profit">
                        {formatCurrency(item.amount)}
                    </span>
                </div>
                <div className="pp-amount-item">
                    <span className="pp-amount-label">User</span>
                    <span className="pp-amount-value">
                        {item.user_name}{" "}
                        <span className="pp-phone"> : {item.user_phone}</span>
                    </span>
                </div>
                <div className="pp-amount-item">
                    <span className="pp-amount-label">Vendor</span>
                    <span className="pp-amount-value">{item.vendor_name}</span>
                    <span className="pp-amount-value">{item.vendor_phone}</span>
                    {item.shop_name && (
                        <div className="pp-shop-name">{item.shop_name}</div>
                    )}
                </div>
            </div>

            <hr className="pp-divider" />

            {/* Profit highlight */}
            <div className="pp-profit-row">
                <span className="pp-profit-label">
                    <span className="pp-profit-icon">💰</span> Platform Profit Retained
                </span>
                <span className="pp-profit-amount">{formatCurrency(item.amount)}</span>
            </div>

            {/* Reason chip */}
            {item.reason && (
                <div className="pp-reason-chip">
                    <span className="pp-reason-label">Reason</span>
                    <span className="pp-reason-value">{item.reason.replace(/_/g, " ")}</span>
                </div>
            )}

            {/* Date */}
            <div className="pp-dates-row">
                <span>
                    Created: {formatDate(item.created_at)} {formatTime(item.created_at)}
                </span>
                <span className="pp-booking-id-small">ID #{item.booking_id}</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   PlatformProfit — main export
   ══════════════════════════════════════════ */
export default function PlatformProfit() {
    const [profits, setProfits] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [totalProfit, setTotalProfit] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/vendors/platform-profit-list`,
                    { headers: { Authorization: `Bearer ${TOKEN()}` } }
                );
                const data = await res.json();
                if (data.success) {
                    setProfits(data.data);
                    setFiltered(data.data);
                    const total = data.data.reduce(
                        (acc, item) => acc + parseFloat(item.amount || 0),
                        0
                    );
                    setTotalProfit(total);
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
        ...new Set(profits.map((p) => p.booking_status)),
    ];

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        let list = profits;
        if (statusFilter !== "All")
            list = list.filter((p) => p.booking_status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.vendor_name?.toLowerCase().includes(q) ||
                    p.user_name?.toLowerCase().includes(q) ||
                    p.booking_number?.toLowerCase().includes(q) ||
                    p.shop_name?.toLowerCase().includes(q) ||
                    p.user_phone?.includes(q) ||
                    p.vendor_phone?.includes(q)
            );
        }
        setFiltered(list);
        setPage(1);
    }, [search, statusFilter, profits]);

    return (
        <div>
            {/* Summary banner */}
            <div className="pp-summary-banner">
                <div className="pp-summary-item">
                    <span className="pp-summary-value">{profits.length}</span>
                    <span className="pp-summary-label">Total Records</span>
                </div>
                <div className="pp-summary-divider" />
                <div className="pp-summary-item">
                    <span className="pp-summary-value pp-summary-value--green">
                        {formatCurrency(totalProfit)}
                    </span>
                    <span className="pp-summary-label">Total Platform Profit</span>
                </div>
                <div className="pp-summary-divider" />
                <div className="pp-summary-item">
                    <span className="pp-summary-value">{filtered.length}</span>
                    <span className="pp-summary-label">Showing</span>
                </div>
            </div>

            {/* Header */}
            <div className="pp-header">
                <div>
                    <h1>Platform Profit</h1>
                    <p>
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                <div className="pp-search-bar">
                    <span>🔍</span>
                    <input
                        placeholder="Search by vendor, user, booking, phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="pp-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="pp-filters">
                {statuses.map((st) => (
                    <button
                        key={st}
                        className={`pp-chip${statusFilter === st ? " active" : ""}`}
                        onClick={() => setStatusFilter(st)}
                    >
                        {st === "All"
                            ? "All"
                            : bookingStatusLabel[st] || st.replace(/_/g, " ")}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="pp-loading">
                    <span>⏳</span>
                    <p>Loading profit records…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="pp-empty">
                    <span>📊</span>
                    <p>No records match your search.</p>
                </div>
            ) : (
                <>
                    <div className="pp-grid">
                        {paginated.map((item) => (
                            <ProfitCard key={item.id} item={item} />
                        ))}
                    </div>
                    <Pagination total={filtered.length} page={page} onPage={setPage} />
                </>
            )}
        </div>
    );
}