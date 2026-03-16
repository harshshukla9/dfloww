"use client";

import { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface PriceChartProps {
    /** Current YES price (0-1 scale, e.g. 0.30 = 30¢) */
    yesPrice: number;
    /** Market open timestamp (unix seconds) */
    openTime?: number;
    /** Market close timestamp (unix seconds) */
    closeTime?: number;
    /** Market title for tooltip */
    title?: string;
}

type TimeRange = "1D" | "1W" | "1M" | "ALL";

/**
 * Generate simulated price history based on current price.
 * Uses a random walk anchored to the current price for realistic visuals.
 * When real historical data is available, swap this out.
 */
function generatePriceHistory(
    currentPrice: number,
    openTime: number,
    closeTime: number,
    range: TimeRange
) {
    const now = Date.now() / 1000;
    const points: { time: number; yes: number; no: number; label: string }[] = [];

    // Determine time range
    let startTime: number;
    let interval: number;
    let count: number;

    switch (range) {
        case "1D":
            startTime = now - 86400;
            count = 48;
            interval = 86400 / count;
            break;
        case "1W":
            startTime = now - 7 * 86400;
            count = 56;
            interval = (7 * 86400) / count;
            break;
        case "1M":
            startTime = now - 30 * 86400;
            count = 60;
            interval = (30 * 86400) / count;
            break;
        case "ALL":
        default:
            startTime = Math.max(openTime, now - 90 * 86400);
            count = 60;
            interval = (now - startTime) / count;
            break;
    }

    // Seeded random walk — start price and walk toward current
    const startPrice = Math.max(0.02, Math.min(0.98, currentPrice + (Math.random() - 0.5) * 0.3));
    const drift = (currentPrice - startPrice) / count;

    let price = startPrice;
    // Use a deterministic seed based on current price for consistent renders
    let seed = Math.round(currentPrice * 10000);

    for (let i = 0; i <= count; i++) {
        const t = startTime + i * interval;

        // Simple pseudo-random with seed
        seed = (seed * 16807 + 0) % 2147483647;
        const r = (seed / 2147483647) - 0.5;

        // Random walk with drift toward current price
        const volatility = 0.015;
        price = price + drift + r * volatility;
        price = Math.max(0.01, Math.min(0.99, price));

        // Snap final point to actual current price
        if (i === count) price = currentPrice;

        const date = new Date(t * 1000);
        let label: string;
        if (range === "1D") {
            label = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else {
            label = date.toLocaleDateString([], { month: "short", day: "numeric" });
        }

        points.push({
            time: t,
            yes: Math.round(price * 100),
            no: Math.round((1 - price) * 100),
            label,
        });
    }

    return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
        >
            <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
            <div style={{ display: "flex", gap: 16 }}>
                <div>
                    <span style={{ color: "var(--green)", fontWeight: 700 }}>
                        Yes {payload[0]?.value}¢
                    </span>
                </div>
                <div>
                    <span style={{ color: "var(--red)", fontWeight: 700 }}>
                        No {payload[1]?.value}¢
                    </span>
                </div>
            </div>
        </div>
    );
};

export function PriceChart({ yesPrice, openTime, closeTime, title }: PriceChartProps) {
    const [range, setRange] = useState<TimeRange>("ALL");
    const now = Date.now() / 1000;

    const data = useMemo(
        () =>
            generatePriceHistory(
                yesPrice,
                openTime || now - 30 * 86400,
                closeTime || now + 30 * 86400,
                range
            ),
        [yesPrice, openTime, closeTime, range]
    );

    const ranges: TimeRange[] = ["1D", "1W", "1M", "ALL"];

    return (
        <div
            style={{
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
            }}
        >
            {/* Chart header */}
            <div
                style={{
                    padding: "16px 20px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                        Price History
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>
                            {Math.round(yesPrice * 100)}¢
                        </span>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            Yes
                        </span>
                        <span
                            style={{
                                fontSize: 20,
                                fontWeight: 600,
                                color: "var(--red)",
                                marginLeft: 8,
                            }}
                        >
                            {Math.round((1 - yesPrice) * 100)}¢
                        </span>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            No
                        </span>
                    </div>
                </div>

                {/* Time range selector */}
                <div
                    style={{
                        display: "flex",
                        gap: 2,
                        background: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                        padding: 3,
                    }}
                >
                    {ranges.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                fontSize: 12,
                                fontWeight: range === r ? 600 : 400,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                background: range === r ? "var(--bg-elevated)" : "transparent",
                                color: range === r ? "var(--text-primary)" : "var(--text-muted)",
                            }}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div style={{ padding: "0 8px 8px", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="yesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="noGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.04)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#6b6b82" }}
                            interval="preserveStartEnd"
                            minTickGap={40}
                        />
                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#6b6b82" }}
                            tickFormatter={(v) => `${v}¢`}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="yes"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#yesGradient)"
                            animationDuration={800}
                        />
                        <Area
                            type="monotone"
                            dataKey="no"
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            fill="url(#noGradient)"
                            animationDuration={800}
                            strokeDasharray="4 3"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
