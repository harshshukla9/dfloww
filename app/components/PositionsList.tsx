"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
    Wallet,
    Loader2,
    TrendingUp,
    TrendingDown,
    ExternalLink,
} from "lucide-react";

interface Position {
    mint: string;
    balance: number;
    decimals: number;
    side: "YES" | "NO" | "UNKNOWN";
    marketTitle: string;
    marketTicker: string;
    marketStatus: string;
}

export function PositionsList() {
    const { connected, publicKey } = useWallet();
    const { connection } = useConnection();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!connected || !publicKey) {
            setPositions([]);
            return;
        }

        async function fetchPositions() {
            try {
                setLoading(true);
                setError(null);

                // 1. Get all Token-2022 accounts
                const tokenAccounts =
                    await connection.getParsedTokenAccountsByOwner(publicKey!, {
                        programId: TOKEN_2022_PROGRAM_ID,
                    });

                const userTokens = tokenAccounts.value
                    .map(({ account }) => {
                        const info = account.data.parsed.info;
                        return {
                            mint: info.mint as string,
                            balance: info.tokenAmount.uiAmount as number,
                            decimals: info.tokenAmount.decimals as number,
                        };
                    })
                    .filter((t) => t.balance > 0);

                if (userTokens.length === 0) {
                    setPositions([]);
                    return;
                }

                // 2. Filter for outcome mints
                const allMints = userTokens.map((t) => t.mint);
                const filterRes = await fetch("/api/filter-mints", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ addresses: allMints }),
                });

                if (!filterRes.ok) {
                    // Fallback: show all tokens without market data
                    setPositions(
                        userTokens.map((t) => ({
                            ...t,
                            side: "UNKNOWN" as const,
                            marketTitle: "Unknown",
                            marketTicker: "",
                            marketStatus: "",
                        }))
                    );
                    return;
                }

                const filterData = await filterRes.json();
                const outcomeMints: string[] = filterData.outcomeMints || [];

                if (outcomeMints.length === 0) {
                    setPositions([]);
                    return;
                }

                // 3. Batch fetch market details
                const batchRes = await fetch("/api/markets-batch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mints: outcomeMints }),
                });

                const batchData = batchRes.ok ? await batchRes.json() : { markets: [] };
                const markets = batchData.markets || [];

                // Build a mint → market map
                const marketsByMint = new Map<string, any>();
                markets.forEach((market: any) => {
                    Object.values(market.accounts || {}).forEach((acc: any) => {
                        if (acc.yesMint) marketsByMint.set(acc.yesMint, market);
                        if (acc.noMint) marketsByMint.set(acc.noMint, market);
                    });
                });

                // 4. Build position rows
                const outcomeTokens = userTokens.filter((t) =>
                    outcomeMints.includes(t.mint)
                );

                const positionRows: Position[] = outcomeTokens.map((token) => {
                    const market = marketsByMint.get(token.mint);
                    if (!market) {
                        return {
                            ...token,
                            side: "UNKNOWN",
                            marketTitle: "Unknown market",
                            marketTicker: "",
                            marketStatus: "",
                        };
                    }

                    const accounts = Object.values(market.accounts || {});
                    const isYes = accounts.some(
                        (a: any) => a.yesMint === token.mint
                    );
                    const isNo = accounts.some(
                        (a: any) => a.noMint === token.mint
                    );

                    return {
                        mint: token.mint,
                        balance: token.balance,
                        decimals: token.decimals,
                        side: isYes ? "YES" : isNo ? "NO" : "UNKNOWN",
                        marketTitle: market.title || "Unknown",
                        marketTicker: market.ticker || "",
                        marketStatus: market.status || "",
                    };
                });

                setPositions(positionRows);
            } catch (err: any) {
                console.error("Error fetching positions:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPositions();
    }, [connected, publicKey, connection]);

    if (!connected) {
        return (
            <div
                style={{
                    padding: "60px 20px",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "var(--radius-lg)",
                        background: "var(--bg-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}
                >
                    <Wallet size={24} style={{ color: "var(--text-muted)" }} />
                </div>
                <h3
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "0 0 6px",
                    }}
                >
                    Connect your wallet
                </h3>
                <p
                    style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        margin: 0,
                    }}
                >
                    Connect a Solana wallet to view your positions.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    color: "var(--text-muted)",
                    fontSize: 14,
                }}
            >
                <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                />
                Loading positions...
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div
                style={{
                    padding: "60px 20px",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "var(--radius-lg)",
                        background: "var(--bg-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}
                >
                    <TrendingUp
                        size={24}
                        style={{ color: "var(--text-muted)" }}
                    />
                </div>
                <h3
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "0 0 6px",
                    }}
                >
                    No positions yet
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                    Buy YES or NO tokens in markets to see your positions here.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {positions.map((pos, i) => (
                <div
                    key={`${pos.mint}-${i}`}
                    className="glass-card fade-in"
                    style={{
                        padding: 16,
                        animationDelay: `${i * 0.05}s`,
                        opacity: 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 4,
                                }}
                            >
                                {pos.side === "YES" ? (
                                    <TrendingUp
                                        size={14}
                                        style={{ color: "var(--green)" }}
                                    />
                                ) : (
                                    <TrendingDown
                                        size={14}
                                        style={{ color: "var(--red)" }}
                                    />
                                )}
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {pos.marketTitle}
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "var(--text-muted)",
                                    fontFamily: "monospace",
                                }}
                            >
                                {pos.mint.slice(0, 8)}...{pos.mint.slice(-4)}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color:
                                        pos.side === "YES"
                                            ? "var(--green)"
                                            : "var(--red)",
                                }}
                            >
                                {pos.balance.toLocaleString()}
                            </div>
                            <div
                                className={`badge ${pos.side === "YES"
                                        ? "badge-active"
                                        : "badge-closed"
                                    }`}
                                style={{ marginTop: 4 }}
                            >
                                {pos.side}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
