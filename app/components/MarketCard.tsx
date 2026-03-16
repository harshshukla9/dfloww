"use client";

import Link from "next/link";
import type { DFlowEvent, DFlowMarket, MarketAccount } from "@/types/dflow";
import { TrendingUp, BarChart2 } from "lucide-react";

interface MarketCardProps {
    event: DFlowEvent;
    index: number;
}

function getStatusBadge(status: string) {
    const map: Record<string, string> = {
        active: "badge-active",
        determined: "badge-determined",
        finalized: "badge-finalized",
        closed: "badge-closed",
        inactive: "badge-closed",
    };
    return map[status] || "badge-closed";
}

function getStatusLabel(status: string) {
    const map: Record<string, string> = {
        active: "Live",
        determined: "Determined",
        finalized: "Settled",
        closed: "Closed",
        inactive: "Inactive",
    };
    return map[status] || status;
}

/** Convert dFlow price string (e.g. "0.30") to cent display (e.g. "30¢") */
function toCents(price: string | null | undefined): string {
    if (!price) return "—";
    const cents = Math.round(parseFloat(price) * 100);
    if (isNaN(cents)) return "—";
    return `${cents}¢`;
}

/** Get the best YES and NO prices from a market */
function getMarketPrices(market: DFlowMarket) {
    // YES price = yesAsk (cost to buy YES) or yesBid (what you can sell YES for)
    // NO price = noAsk (cost to buy NO) or noBid
    const yesPrice = market.yesAsk || market.yesBid;
    const noPrice = market.noAsk || market.noBid;
    return { yesPrice, noPrice };
}

/** Format volume (dFlow returns volume in cents, convert to dollars) */
function formatVolume(volInCents: number | undefined): string {
    if (!volInCents) return "";
    const dollars = volInCents / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
    if (dollars >= 1) return `$${dollars.toFixed(0)}`;
    return `$${dollars.toFixed(2)}`;
}

export function MarketCard({ event, index }: MarketCardProps) {
    const market = event.markets?.[0];
    if (!market) return null;

    const { yesPrice, noPrice } = getMarketPrices(market);
    const yesCents = toCents(yesPrice);
    const noCents = toCents(noPrice);

    // Calculate percentage from price (YES price of 0.30 = 30%)
    const yesPct = yesPrice ? Math.round(parseFloat(yesPrice) * 100) : null;

    return (
        <Link href={`/market/${encodeURIComponent(event.ticker)}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div
                className="glass-card fade-in"
                style={{
                    padding: 0,
                    cursor: "pointer",
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    overflow: "hidden",
                }}
            >
                {/* Header with status + percentage */}
                <div
                    style={{
                        padding: "16px 20px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {event.seriesTicker && (
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "var(--blue)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    marginBottom: 6,
                                }}
                            >
                                {event.seriesTicker}
                            </div>
                        )}
                        <h3
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                lineHeight: 1.4,
                                margin: 0,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as const,
                                overflow: "hidden",
                            }}
                        >
                            {event.title}
                        </h3>
                        {event.subtitle && (
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "var(--text-muted)",
                                    margin: "4px 0 0",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical" as const,
                                    overflow: "hidden",
                                }}
                            >
                                {event.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Percentage badge */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {yesPct !== null && (
                            <div
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    lineHeight: 1,
                                }}
                            >
                                {yesPct}%
                            </div>
                        )}
                        <span className={`badge ${getStatusBadge(market.status)}`} style={{ marginTop: 4 }}>
                            {market.status === "active" && <span className="pulse-dot" />}
                            {getStatusLabel(market.status)}
                        </span>
                    </div>
                </div>

                {/* Probability bar */}
                {yesPct !== null && (
                    <div style={{ padding: "0 20px 12px" }}>
                        <div className="prob-bar">
                            <div
                                className="prob-bar-fill"
                                style={{
                                    width: `${yesPct}%`,
                                    background: `linear-gradient(90deg, var(--green), ${yesPct > 60 ? "var(--green-bright)" : "var(--blue)"})`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* YES / NO cent buttons — Kalshi style */}
                <div
                    style={{
                        padding: "0 20px 16px",
                        display: "flex",
                        gap: 8,
                    }}
                >
                    <button
                        style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(34, 197, 94, 0.25)",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            transition: "all 0.2s ease",
                            background: "var(--green-glow)",
                            color: "var(--green)",
                        }}
                    >
                        Yes {yesCents}
                    </button>
                    <button
                        style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            transition: "all 0.2s ease",
                            background: "var(--red-glow)",
                            color: "var(--red)",
                        }}
                    >
                        No {noCents}
                    </button>
                </div>

                {/* Footer: volume + market count */}
                <div
                    style={{
                        padding: "10px 20px",
                        borderTop: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--text-muted)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {market.volume ? (
                            <>
                                <BarChart2 size={12} />
                                {formatVolume(market.volume)} vol
                            </>
                        ) : null}
                    </div>
                    {event.markets && event.markets.length > 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <TrendingUp size={12} />
                            {event.markets.length} markets
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

/** Skeleton loader for market cards */
export function MarketCardSkeleton() {
    return (
        <div
            className="glass-card"
            style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div className="skeleton" style={{ height: 12, width: "40%" }} />
            <div className="skeleton" style={{ height: 16, width: "85%" }} />
            <div className="skeleton" style={{ height: 6, width: "100%", marginTop: 4 }} />
            <div
                style={{ display: "flex", gap: 8, marginTop: 4 }}
            >
                <div className="skeleton" style={{ height: 48, flex: 1 }} />
                <div className="skeleton" style={{ height: 48, flex: 1 }} />
            </div>
        </div>
    );
}
