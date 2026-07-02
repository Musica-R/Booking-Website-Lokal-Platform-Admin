import React, { useState, useEffect } from "react";
import "../styles/ProfitDashboard.css";

const API_BASE = process.env.REACT_APP_API_URL_IMAGE;
const TOKEN = () => localStorage.getItem("lokal_token");

const IconWrench = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.7 6.3a4 4 0 1 0-5.4 5.4l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.1-.7-.7-2.1 2.1-2.1z" />
    </svg>
);
const IconTicket = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z" />
        <path d="M13 5v2M13 11v2M13 17v2" />
    </svg>
);
const IconBan = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
    </svg>
);
const IconStore = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
        <path d="M5 9v9a1 1 0 0 0 1 1h3v-5h6v5h3a1 1 0 0 0 1-1V9" />
    </svg>
);
const IconWallet = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
        <path d="M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h5" />
    </svg>
);

/* Single muted data-series palette — used only where color must carry
   meaning (the distribution chart). Everything else stays neutral. */
const profitConfig = [
    { key: "vendor_profit", label: "Home Service Profit", desc: "Home Service Booking Platform Fee", Icon: IconWrench, chart: "#4F46E5" },
    { key: "cancellation_profit", label: "Home Service User Cancellation Profit", desc: "Non-refundable cancellation fees", Icon: IconBan, chart: "#94A3B8" },
    { key: "activity_profit", label: "Activity Profit", desc: "Activity Booking Platform Fee", Icon: IconTicket, chart: "#0EA5A0" },
    { key: "nearby_stall_profit", label: "Nearby Stall Profit", desc: "Earnings from nearby stall listings", Icon: IconStore, chart: "#C084FC" },
];

export default function ProfitDashboard() {
    const [profit, setProfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfit = async () => {
            try {
                const headers = { Authorization: `Bearer ${TOKEN()}` };
                const res = await fetch(`${API_BASE}/api/vendors/platform-profit-summary`, { headers });
                const data = await res.json();
                if (data.success) {
                    setProfit(data.data);
                } else {
                    setError("Failed to load profit data");
                }
            } catch (e) {
                console.error("Profit fetch error:", e);
                setError("Something went wrong while fetching profit data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfit();
    }, []);

    const fmt = (n) =>
        `₹${parseFloat(n || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const total = profit?.total_platform_profit || 0;

    const getPercent = (value) => {
        if (!total) return 0;
        return ((parseFloat(value || 0) / total) * 100).toFixed(1);
    };

    return (
        <div className="profit-dashboard">

            {/* ── Page Header ── */}
            <div className="profit-page-header">
                <div>
                    <h1 className="profit-page-title">Platform Profit</h1>
                    <p className="profit-page-subtitle">Overview of platform earnings across all revenue sources</p>
                </div>
            </div>

            {loading ? (
                <div className="profit-loading-state">
                    <span className="profit-spinner" />
                    <span>Loading profit summary…</span>
                </div>
            ) : error ? (
                <div className="profit-error-state">
                    <span>{error}</span>
                </div>
            ) : (
                <>
                    {/* ── Hero Total Card ── */}
                    <div className="profit-hero-card">
                        <div className="profit-hero-left">
                            <div className="profit-hero-label">Total Platform Profit</div>
                            <div className="profit-hero-value">{fmt(total)}</div>
                            <div className="profit-hero-note">Combined earnings across all sources</div>
                        </div>
                        <div className="profit-hero-icon">
                            <IconWallet width={24} height={24} />
                        </div>
                    </div>

                    {/* ── Breakdown Cards ── */}
                    <div className="profit-grid">
                        {profitConfig.map((p) => (
                            <div className="profit-card" key={p.key}>
                                <div className="profit-card-top">
                                    <div className="profit-card-icon">
                                        <p.Icon width={18} height={18} />
                                    </div>
                                    <span className="profit-card-percent">
                                        {getPercent(profit[p.key])}%
                                    </span>
                                </div>
                                <div className="profit-card-value">{fmt(profit[p.key])}</div>
                                <div className="profit-card-label">{p.label}</div>
                                <div className="profit-card-desc">{p.desc}</div>
                                <div className="profit-card-bar-track">
                                    <div
                                        className="profit-card-bar-fill"
                                        style={{ width: `${getPercent(profit[p.key])}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Distribution Bar ── */}
                    <div className="profit-distribution-card">
                        <div className="profit-distribution-header">
                            <div className="profit-distribution-title">Profit Distribution</div>
                            <div className="profit-distribution-subtitle">Share of each source in total profit</div>
                        </div>
                        <div className="profit-distribution-bar">
                            {profitConfig.map((p) => (
                                <div
                                    key={p.key}
                                    className="profit-distribution-segment"
                                    style={{
                                        width: `${getPercent(profit[p.key])}%`,
                                        background: p.chart,
                                    }}
                                    title={`${p.label}: ${getPercent(profit[p.key])}%`}
                                />
                            ))}
                        </div>
                        <div className="profit-distribution-legend">
                            {profitConfig.map((p) => (
                                <div className="profit-legend-item" key={p.key}>
                                    <span className="profit-legend-dot" style={{ background: p.chart }} />
                                    <span className="profit-legend-label">{p.label}</span>
                                    <span className="profit-legend-value">{getPercent(profit[p.key])}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}