"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";

export function WalletButton() {
    const { connected, publicKey } = useWallet();

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}
        >
            <WalletMultiButton
                style={{
                    background: connected
                        ? "var(--green-glow)"
                        : "linear-gradient(135deg, var(--blue), var(--purple))",
                    border: connected
                        ? "1px solid rgba(34, 197, 94, 0.25)"
                        : "none",
                    borderRadius: "var(--radius-md)",
                    height: 40,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    padding: "0 16px",
                    color: connected ? "var(--green)" : "white",
                }}
            />
        </div>
    );
}
