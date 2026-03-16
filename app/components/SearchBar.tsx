"use client";

import { Search, X } from "lucide-react";
import { useState, useRef } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChange,
    placeholder = "Search markets...",
}: SearchBarProps) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                maxWidth: 480,
            }}
        >
            <Search
                size={16}
                style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: focused ? "var(--blue)" : "var(--text-muted)",
                    transition: "color 0.2s ease",
                    pointerEvents: "none",
                }}
            />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    padding: "12px 40px 12px 40px",
                    fontSize: 14,
                    background: "var(--bg-surface)",
                    border: `1px solid ${focused ? "var(--border-accent)" : "var(--border-subtle)"}`,
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxShadow: focused ? "var(--shadow-glow-blue)" : "none",
                }}
            />
            {value && (
                <button
                    onClick={() => {
                        onChange("");
                        inputRef.current?.focus();
                    }}
                    style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "var(--bg-elevated)",
                        border: "none",
                        borderRadius: "var(--radius-full)",
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                    }}
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}
