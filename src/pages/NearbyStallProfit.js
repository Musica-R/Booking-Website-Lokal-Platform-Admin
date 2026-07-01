import React, { useState, useEffect } from "react";
import "../styles/NearbyStallProfit.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");
const PAGE_SIZE = 10;

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

const truncateId = (id) => {
    if (!id) return "—";
    if (id.length <= 18) return id;
    return `${id.slice(0, 10)}…${id.slice(-4)}`;
};

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
        <div className="nsp-pagination">
            <span className="nsp-pagination-info">
                Showing {from}–{to} of {total}
            </span>
            <div className="nsp-pagination-controls">
                <button className="nsp-page-btn" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous">‹</button>
                {pages.map((p, i) =>
                    p === "…"
                        ? <span key={`e-${i}`} className="nsp-page-ellipsis">…</span>
                        : <button key={p} className={`nsp-page-btn${p === page ? " active" : ""}`} onClick={() => onPage(p)}>{p}</button>
                )}
                <button className="nsp-page-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages} aria-label="Next">›</button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   StallProfitCard
   ══════════════════════════════════════════ */
function StallProfitCard({ item }) {
    const initials = item.shop_name ? item.shop_name.charAt(0).toUpperCase() : "S";

    return (
        <div className="nsp-card">
            {/* Header */}
            <div className="nsp-card-header">
                <div className="nsp-avatar">{initials}</div>
                <div className="nsp-header-text">
                    <div className="nsp-shop-name">{item.shop_name}</div>
                    <div className="nsp-phone-row">
                        <span>📞 {item.phone}</span>
                        {item.whatsapp_number && item.whatsapp_number !== item.phone && (
                            <span className="nsp-whatsapp">💬 {item.whatsapp_number}</span>
                        )}
                    </div>
                </div>
                <span className="nsp-stall-badge">Stall #{item.stall_id}</span>
            </div>

            <hr className="nsp-divider" />

            {/* Fee breakdown */}
            <div className="nsp-amount-grid">
                <div className="nsp-amount-item">
                    <span className="nsp-amount-label">Listing Fee</span>
                    <span className="nsp-amount-value">{formatCurrency(item.listing_fee)}</span>
                </div>
                <div className="nsp-amount-item">
                    <span className="nsp-amount-label">Razorpay Fee</span>
                    <span className="nsp-amount-value">{formatCurrency(item.razorpay_fee)}</span>
                </div>
                <div className="nsp-amount-item">
                    <span className="nsp-amount-label">Razorpay Tax</span>
                    <span className="nsp-amount-value">{formatCurrency(item.razorpay_tax)}</span>
                </div>
                <div className="nsp-amount-item">
                    <span className="nsp-amount-label">Platform Profit</span>
                    <span className="nsp-amount-value nsp-amount-value--profit">
                        {formatCurrency(item.platform_profit)}
                    </span>
                </div>
            </div>

            <hr className="nsp-divider" />

            {/* Profit highlight */}
            <div className="nsp-profit-row">
                <span className="nsp-profit-label">
                    <span className="nsp-profit-icon">💰</span> Platform Profit Retained
                </span>
                <span className="nsp-profit-amount">{formatCurrency(item.platform_profit)}</span>
            </div>

            {/* Settlement / Payment IDs */}
            <div className="nsp-id-chip">
                <div className="nsp-id-row">
                    <span className="nsp-id-label">Settlement ID</span>
                    <span className="nsp-id-value" title={item.razorpay_settlement_id}>
                        {truncateId(item.razorpay_settlement_id)}
                    </span>
                </div>
                <div className="nsp-id-row">
                    <span className="nsp-id-label">Payment ID</span>
                    <span className="nsp-id-value" title={item.razorpay_payment_id}>
                        {truncateId(item.razorpay_payment_id)}
                    </span>
                </div>
            </div>

            {/* Dates */}
            <div className="nsp-dates-row">
                <span>
                    Settled: {formatDate(item.settled_at)} {formatTime(item.settled_at)}
                </span>
                <span className="nsp-record-id-small">ID #{item.id}</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   NearbyStallProfit — main export
   ══════════════════════════════════════════ */
export default function NearbyStallProfit() {
    const [profits, setProfits] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [totalProfit, setTotalProfit] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/vendors/nearby-stall-profit-list`,
                    { headers: { Authorization: `Bearer ${TOKEN()}` } }
                );
                const data = await res.json();
                if (data.success) {
                    setProfits(data.data);
                    setFiltered(data.data);
                    const total = data.data.reduce(
                        (acc, item) => acc + parseFloat(item.platform_profit || 0),
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

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        let list = profits;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.shop_name?.toLowerCase().includes(q) ||
                    p.phone?.includes(q) ||
                    p.whatsapp_number?.includes(q) ||
                    p.razorpay_settlement_id?.toLowerCase().includes(q) ||
                    p.razorpay_payment_id?.toLowerCase().includes(q)
            );
        }
        setFiltered(list);
        setPage(1);
    }, [search, profits]);

    return (
        <div>
            {/* Summary banner */}
            <div className="nsp-summary-banner">
                <div className="nsp-summary-item">
                    <span className="nsp-summary-value">{profits.length}</span>
                    <span className="nsp-summary-label">Total Records</span>
                </div>
                <div className="nsp-summary-divider" />
                <div className="nsp-summary-item">
                    <span className="nsp-summary-value nsp-summary-value--green">
                        {formatCurrency(totalProfit)}
                    </span>
                    <span className="nsp-summary-label">Total Platform Profit</span>
                </div>
                <div className="nsp-summary-divider" />
                <div className="nsp-summary-item">
                    <span className="nsp-summary-value">{filtered.length}</span>
                    <span className="nsp-summary-label">Showing</span>
                </div>
            </div>

            {/* Header */}
            <div className="nsp-header">
                <div>
                    <h1>Nearby Stall Profit</h1>
                    <p>
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                <div className="nsp-search-bar">
                    <span>🔍</span>
                    <input
                        placeholder="Search by shop, phone, settlement ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="nsp-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="nsp-loading">
                    <span>⏳</span>
                    <p>Loading profit records…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="nsp-empty">
                    <span>📊</span>
                    <p>No records match your search.</p>
                </div>
            ) : (
                <>
                    <div className="nsp-grid">
                        {paginated.map((item) => (
                            <StallProfitCard key={item.id} item={item} />
                        ))}
                    </div>
                    <Pagination total={filtered.length} page={page} onPage={setPage} />
                </>
            )}
        </div>
    );
}