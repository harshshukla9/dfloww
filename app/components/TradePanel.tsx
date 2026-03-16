"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import type { MarketAccount } from "@/types/dflow";
import {
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    CheckCircle,
    XCircle,
    Wallet,
} from "lucide-react";

interface TradePanelProps {
    marketTitle: string;
    marketTicker: string;
    account: MarketAccount;
    settlementMint: string;
    marketStatus: string;
}

type Side = "yes" | "no";
type TradeState = "idle" | "loading" | "confirming" | "success" | "error";

export function TradePanel({
    marketTitle,
    marketTicker,
    account,
    settlementMint,
    marketStatus,
}: TradePanelProps) {
    const { connected, publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [side, setSide] = useState<Side>("yes");
    const [amount, setAmount] = useState("");
    const [tradeState, setTradeState] = useState<TradeState>("idle");
    const [txSignature, setTxSignature] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isActive = marketStatus === "active";
    const outputMint = side === "yes" ? account.yesMint : account.noMint;

    async function handleTrade() {
        if (!connected || !publicKey || !signTransaction || !amount) return;

        try {
            setTradeState("loading");
            setErrorMsg(null);

            // dFlow markets settle in the settlement token (USDC/CASH), not SOL
            // Amount in the settlement token's smallest denomination
            const rawAmount = Math.floor(parseFloat(amount) * 1e6); // USDC = 6 decimals
            if (isNaN(rawAmount) || rawAmount <= 0) {
                throw new Error("Invalid amount");
            }

            // 1. Request order from our API
            const params = new URLSearchParams({
                inputMint: settlementMint,
                outputMint,
                amount: rawAmount.toString(),
                userPublicKey: publicKey.toBase58(),
            });

            const orderRes = await fetch(`/api/order?${params.toString()}`);
            if (!orderRes.ok) {
                const errText = await orderRes.text();
                let errMsg = "Failed to get order";
                try {
                    const errJson = JSON.parse(errText);
                    errMsg = errJson.error || errJson.message || errMsg;
                } catch {
                    errMsg = errText || errMsg;
                }
                throw new Error(errMsg);
            }

            const orderData = await orderRes.json();

            if (!orderData.transaction) {
                throw new Error("No transaction returned from dFlow");
            }

            // 2. Deserialize and sign
            setTradeState("confirming");
            const txBuffer = Buffer.from(orderData.transaction, "base64");
            const tx = VersionedTransaction.deserialize(txBuffer);
            const signedTx = await signTransaction(tx);

            // 3. Send transaction (skipPreflight avoids 403 on public RPC)
            const signature = await connection.sendTransaction(signedTx, {
                skipPreflight: true,
                maxRetries: 3,
            });
            setTxSignature(signature);
            setTradeState("success");

            // 4. Confirm in background
            connection
                .confirmTransaction(signature, "confirmed")
                .catch((err) => console.warn("Confirmation polling error:", err));
        } catch (err: any) {
            console.error("Trade error:", err);
            let message = err.message || "Trade failed";

            // Make RPC errors more user-friendly
            if (message.includes("403") || message.includes("Access forbidden")) {
                message =
                    "RPC blocked this request. Set a private Solana RPC URL in .env.local (NEXT_PUBLIC_SOLANA_RPC_URL). Get one free at helius.dev";
            }

            setErrorMsg(message);
            setTradeState("error");
        }
    }

    if (!isActive) {
        return (
            <div
                style={{
                    padding: 20,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 14,
                }}
            >
                Trading is closed for this market.
            </div>
        );
    }

    return (
        <div
            style={{
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                }}
            >
                <h4
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: 0,
                    }}
                >
                    Trade
                </h4>
                <p
                    style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        margin: "4px 0 0",
                    }}
                >
                    {marketTitle}
                </p>
            </div>

            {/* Side selector */}
            <div
                style={{
                    padding: "16px 20px",
                    display: "flex",
                    gap: 8,
                }}
            >
                <button
                    onClick={() => setSide("yes")}
                    style={{
                        flex: 1,
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s ease",
                        background:
                            side === "yes" ? "var(--green)" : "var(--green-glow)",
                        color: side === "yes" ? "white" : "var(--green)",
                        boxShadow:
                            side === "yes"
                                ? "var(--shadow-glow-green)"
                                : "none",
                    }}
                >
                    <ArrowUpRight size={18} />
                    YES
                </button>
                <button
                    onClick={() => setSide("no")}
                    style={{
                        flex: 1,
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s ease",
                        background:
                            side === "no" ? "var(--red)" : "var(--red-glow)",
                        color: side === "no" ? "white" : "var(--red)",
                        boxShadow:
                            side === "no" ? "var(--shadow-glow-red)" : "none",
                    }}
                >
                    <ArrowDownRight size={18} />
                    NO
                </button>
            </div>

            {/* Amount input */}
            <div style={{ padding: "0 20px 16px" }}>
                <label
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        display: "block",
                        marginBottom: 8,
                    }}
                >
                    Amount (USDC)
                </label>
                <div style={{ position: "relative" }}>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                            width: "100%",
                            padding: "14px 60px 14px 16px",
                            fontSize: 18,
                            fontWeight: 600,
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--text-primary)",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                    <span
                        style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: 14,
                            color: "var(--text-muted)",
                            fontWeight: 500,
                        }}
                    >
                        USDC
                    </span>
                </div>

                {/* Quick amount buttons */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 8,
                    }}
                >
                    {["0.1", "0.5", "1", "5"].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            style={{
                                flex: 1,
                                padding: "8px",
                                fontSize: 12,
                                fontWeight: 500,
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-sm)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            {val} USDC
                        </button>
                    ))}
                </div>
            </div>

            {/* Trade info */}
            <div
                style={{
                    padding: "0 20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "var(--text-muted)",
                    }}
                >
                    <span>Outcome</span>
                    <span
                        style={{
                            color: side === "yes" ? "var(--green)" : "var(--red)",
                            fontWeight: 600,
                        }}
                    >
                        {side.toUpperCase()}
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "var(--text-muted)",
                    }}
                >
                    <span>Output mint</span>
                    <span
                        style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: "var(--text-secondary)",
                        }}
                    >
                        {outputMint?.slice(0, 8)}...
                    </span>
                </div>
            </div>

            {/* Execute button */}
            <div style={{ padding: "0 20px 20px" }}>
                {!connected ? (
                    <div
                        style={{
                            padding: 14,
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            fontSize: 14,
                            color: "var(--text-muted)",
                        }}
                    >
                        <Wallet size={16} />
                        Connect wallet to trade
                    </div>
                ) : (
                    <button
                        onClick={handleTrade}
                        disabled={
                            tradeState === "loading" ||
                            tradeState === "confirming" ||
                            !amount
                        }
                        style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            fontSize: 15,
                            fontWeight: 700,
                            cursor:
                                tradeState === "loading" || tradeState === "confirming"
                                    ? "wait"
                                    : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all 0.2s ease",
                            background:
                                side === "yes"
                                    ? "var(--green)"
                                    : "var(--red)",
                            color: "white",
                            opacity:
                                tradeState === "loading" ||
                                    tradeState === "confirming" ||
                                    !amount
                                    ? 0.6
                                    : 1,
                        }}
                    >
                        {tradeState === "loading" && (
                            <>
                                <Loader2
                                    size={18}
                                    style={{ animation: "spin 1s linear infinite" }}
                                />
                                Preparing trade...
                            </>
                        )}
                        {tradeState === "confirming" && (
                            <>
                                <Loader2
                                    size={18}
                                    style={{ animation: "spin 1s linear infinite" }}
                                />
                                Confirm in wallet...
                            </>
                        )}
                        {tradeState === "idle" && (
                            <>
                                Buy {side.toUpperCase()} — {amount || "0"} USDC
                            </>
                        )}
                        {tradeState === "success" && (
                            <>
                                <CheckCircle size={18} />
                                Trade submitted!
                            </>
                        )}
                        {tradeState === "error" && (
                            <>
                                <XCircle size={18} />
                                Try again
                            </>
                        )}
                    </button>
                )}

                {/* Success / Error messages */}
                {tradeState === "success" && txSignature && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--green-glow)",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                            fontSize: 12,
                            color: "var(--green)",
                            textAlign: "center",
                        }}
                    >
                        <a
                            href={`https://solscan.io/tx/${txSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "var(--green-bright)",
                                textDecoration: "underline",
                            }}
                        >
                            View on Solscan →
                        </a>
                    </div>
                )}

                {tradeState === "error" && errorMsg && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--red-glow)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            fontSize: 12,
                            color: "var(--red)",
                            textAlign: "center",
                        }}
                    >
                        {errorMsg}
                    </div>
                )}
            </div>
        </div>
    );
}
