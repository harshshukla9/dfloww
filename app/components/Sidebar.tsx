"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    TrendingUp,
    Wallet,
    Settings,
    Zap,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Markets", href: "/", icon: BarChart3 },
    { label: "Trending", href: "/?status=active", icon: TrendingUp },
    { label: "Portfolio", href: "/portfolio", icon: Wallet },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 240,
                height: "100vh",
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                zIndex: 50,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: "24px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid var(--border-subtle)",
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(135deg, var(--blue), var(--purple))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Zap size={20} color="white" />
                </div>
                <div>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        dkflow
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Prediction Markets
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "16px 12px" }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                >
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href === "/" && pathname === "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "10px 12px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive
                                        ? "var(--text-primary)"
                                        : "var(--text-secondary)",
                                    background: isActive
                                        ? "var(--blue-glow)"
                                        : "transparent",
                                    textDecoration: "none",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                <Icon
                                    size={18}
                                    style={{
                                        color: isActive
                                            ? "var(--blue)"
                                            : "var(--text-muted)",
                                    }}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div
                style={{
                    padding: "16px 20px",
                    borderTop: "1px solid var(--border-subtle)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: "var(--text-muted)",
                    }}
                >
                    <div className="pulse-dot" />
                    <span>Powered by dFlow</span>
                </div>
            </div>
        </aside>
    );
}
