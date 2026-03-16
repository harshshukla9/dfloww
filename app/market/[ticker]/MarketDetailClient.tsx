"use client";

import Link from "next/link";
import type { DFlowEvent, MarketAccount } from "@/types/dflow";
import { ArrowLeft, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { TradePanel } from "../../components/TradePanel";
import { WalletButton } from "../../components/WalletButton";

interface Props {
    event: DFlowEvent;
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

function truncateAddress(addr: string) {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function MarketDetailClient({ event }: Props) {
    return (
        <div
            style={{
                padding: "32px 40px",
                maxWidth: 900,
                position: "relative",
            }}
        >
            {/* Back link */}
            <Link
                href="/"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    marginBottom: 24,
                    transition: "color 0.15s ease",
                }}
            >
                <ArrowLeft size={16} />
                Back to Markets
            </Link>

            {/* Wallet button */}
            <div style={{ position: "absolute", top: 32, right: 40 }}>
                <WalletButton />
            </div>

            {/* Event header */}
            <div style={{ marginBottom: 32 }}>
                {event.seriesTicker && (
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--blue)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 8,
                        }}
                    >
                        {event.seriesTicker}
                    </div>
                )}
                <h1
                    style={{
                        fontSize: 32,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        margin: "0 0 8px",
                        lineHeight: 1.2,
                    }}
                >
                    {event.title}
                </h1>
                {event.subtitle && (
                    <p
                        style={{
                            fontSize: 16,
                            color: "var(--text-secondary)",
                            margin: "0 0 16px",
                            lineHeight: 1.5,
                        }}
                    >
                        {event.subtitle}
                    </p>
                )}

                {/* Event meta */}
                <div
                    style={{
                        display: "flex",
                        gap: 20,
                        fontSize: 13,
                        color: "var(--text-muted)",
                    }}
                >
                    <span
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <TrendingUp size={14} />
                        {event.markets?.length || 0} market
                        {(event.markets?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <Clock size={14} />
                        Ticker: {event.ticker}
                    </span>
                </div>
            </div>

            {/* Markets */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {event.markets?.map((market) => {
                    const accounts = Object.entries(market.accounts || {});

                    return (
                        <div
                            key={market.ticker}
                            className="glass-card"
                            style={{
                                padding: 24,
                            }}
                        >
                            {/* Market header */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 20,
                                }}
                            >
                                <div>
                                    <h3
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 600,
                                            margin: "0 0 4px",
                                        }}
                                    >
                                        {market.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: 13,
                                            color: "var(--text-muted)",
                                            margin: 0,
                                        }}
                                    >
                                        Ticker: {market.ticker}
                                    </p>
                                </div>
                                <span
                                    className={`badge ${getStatusBadge(market.status)}`}
                                >
                                    {market.status === "active" && (
                                        <span className="pulse-dot" />
                                    )}
                                    {getStatusLabel(market.status)}
                                </span>
                            </div>

                            {/* Outcome tokens */}
                            {accounts.map(([settlementMint, account]) => {
                                const acc = account as MarketAccount;

                                return (
                                    <div
                                        key={settlementMint}
                                        style={{
                                            background: "var(--bg-surface)",
                                            borderRadius: "var(--radius-md)",
                                            padding: 16,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "var(--text-muted)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                marginBottom: 12,
                                            }}
                                        >
                                            Settlement: {truncateAddress(settlementMint)}
                                        </div>

                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: 12,
                                            }}
                                        >
                                            {/* YES Token */}
                                            <div
                                                style={{
                                                    padding: 14,
                                                    borderRadius: "var(--radius-md)",
                                                    background: "var(--green-glow)",
                                                    border: "1px solid rgba(34, 197, 94, 0.15)",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: "var(--green)",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    ✅ YES Token
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--text-secondary)",
                                                        fontFamily: "monospace",
                                                        wordBreak: "break-all",
                                                    }}
                                                >
                                                    {acc.yesMint
                                                        ? truncateAddress(acc.yesMint)
                                                        : "Not minted"}
                                                </div>
                                                {market.status === "active" && acc.yesMint && (
                                                    <button
                                                        className="btn-yes"
                                                        style={{
                                                            marginTop: 10,
                                                            width: "100%",
                                                            padding: "10px",
                                                            borderRadius: "var(--radius-sm)",
                                                            border: "none",
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Buy YES
                                                    </button>
                                                )}
                                            </div>

                                            {/* NO Token */}
                                            <div
                                                style={{
                                                    padding: 14,
                                                    borderRadius: "var(--radius-md)",
                                                    background: "var(--red-glow)",
                                                    border: "1px solid rgba(239, 68, 68, 0.15)",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: "var(--red)",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    ❌ NO Token
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--text-secondary)",
                                                        fontFamily: "monospace",
                                                        wordBreak: "break-all",
                                                    }}
                                                >
                                                    {acc.noMint
                                                        ? truncateAddress(acc.noMint)
                                                        : "Not minted"}
                                                </div>
                                                {market.status === "active" && acc.noMint && (
                                                    <button
                                                        className="btn-no"
                                                        style={{
                                                            marginTop: 10,
                                                            width: "100%",
                                                            padding: "10px",
                                                            borderRadius: "var(--radius-sm)",
                                                            border: "none",
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Buy NO
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Result info for determined markets */}
                            {(market.status === "determined" ||
                                market.status === "finalized") &&
                                market.result && (
                                    <div
                                        style={{
                                            padding: 14,
                                            borderRadius: "var(--radius-md)",
                                            background:
                                                market.result === "yes"
                                                    ? "var(--green-glow)"
                                                    : "var(--red-glow)",
                                            border: `1px solid ${market.result === "yes"
                                                ? "rgba(34, 197, 94, 0.2)"
                                                : "rgba(239, 68, 68, 0.2)"
                                                }`,
                                            textAlign: "center",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color:
                                                market.result === "yes"
                                                    ? "var(--green)"
                                                    : "var(--red)",
                                        }}
                                    >
                                        Result:{" "}
                                        {market.result.toUpperCase()}
                                    </div>
                                )}

                            {/* Trading Panel */}
                            {market.status === "active" && accounts.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <TradePanel
                                        marketTitle={market.title}
                                        marketTicker={market.ticker}
                                        account={accounts[0][1] as MarketAccount}
                                        settlementMint={accounts[0][0]}
                                        marketStatus={market.status}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
