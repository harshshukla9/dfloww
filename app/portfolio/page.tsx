"use client";

import { WalletButton } from "../components/WalletButton";
import { PositionsList } from "../components/PositionsList";
import { Wallet } from "lucide-react";

export default function PortfolioPage() {
    return (
        <div
            style={{
                padding: "32px 40px",
                maxWidth: 900,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 32,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "var(--radius-md)",
                            background: "var(--blue-glow)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Wallet size={20} style={{ color: "var(--blue)" }} />
                    </div>
                    <div>
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                margin: 0,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Portfolio
                        </h1>
                        <p
                            style={{
                                fontSize: 14,
                                color: "var(--text-secondary)",
                                margin: 0,
                            }}
                        >
                            Your prediction market positions
                        </p>
                    </div>
                </div>
                <WalletButton />
            </div>

            {/* Positions */}
            <PositionsList />
        </div>
    );
}
