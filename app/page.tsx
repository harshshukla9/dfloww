"use client";

import { useEffect, useState, useMemo } from "react";
import type { DFlowEvent } from "@/types/dflow";
import { MarketCard, MarketCardSkeleton } from "./components/MarketCard";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { Activity, TrendingUp, Zap, CheckCircle } from "lucide-react";

const STATUS_TABS = [
  { key: "active", label: "Live", icon: Activity, color: "var(--green)" },
  { key: "settled", label: "Settled", icon: CheckCircle, color: "var(--blue)" },
  { key: "", label: "All", icon: TrendingUp, color: "var(--text-secondary)" },
] as const;

export default function MarketsPage() {
  const [events, setEvents] = useState<DFlowEvent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  // Fetch events — re-fetches when status filter changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Build query — "settled" maps to finalized+determined
        let statusParam = statusFilter;
        if (statusFilter === "settled") statusParam = "finalized";

        const url = statusParam
          ? `/api/markets?status=${statusParam}&limit=200`
          : `/api/markets?limit=200`;

        const [marketsRes, categoriesRes] = await Promise.all([
          fetch(url),
          fetch("/api/categories"),
        ]);

        if (!marketsRes.ok) throw new Error("Failed to fetch markets");

        const marketsData = await marketsRes.json();
        let fetchedEvents: DFlowEvent[] = marketsData.events || [];

        // For "settled", also fetch determined markets and merge
        if (statusFilter === "settled") {
          const detRes = await fetch("/api/markets?status=determined&limit=200");
          if (detRes.ok) {
            const detData = await detRes.json();
            fetchedEvents = [...fetchedEvents, ...(detData.events || [])];
          }
        }

        setEvents(fetchedEvents);

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          const cats = Object.keys(catData.tagsByCategories || {});
          setCategories(cats);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [statusFilter]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.subtitle?.toLowerCase().includes(q) ||
          e.ticker?.toLowerCase().includes(q) ||
          e.seriesTicker?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (e) =>
          e.category === selectedCategory ||
          e.tags?.includes(selectedCategory) ||
          e.seriesTicker?.toUpperCase().includes(selectedCategory.toUpperCase())
      );
    }

    return filtered;
  }, [events, search, selectedCategory]);

  const activeTab = STATUS_TABS.find((t) => t.key === statusFilter)!;

  return (
    <div
      style={{
        padding: "32px 40px",
        maxWidth: 1200,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--green-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity
              size={20}
              style={{ color: "var(--green)" }}
            />
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
              Markets
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              Trade on real-world events
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 20,
            marginBottom: 20,
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            padding: 4,
            width: "fit-content",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                <Icon size={14} style={{ color: isActive ? tab.color : "var(--text-dim)" }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <Zap size={14} style={{ color: activeTab.color }} />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {events.length}
            </span>
            {activeTab.label.toLowerCase()} events
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <TrendingUp size={14} style={{ color: "var(--blue)" }} />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {events.reduce(
                (sum, e) => sum + (e.markets?.length || 0),
                0
              )}
            </span>
            markets
          </div>
        </div>

        {/* Search + Category Filter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <SearchBar value={search} onChange={setSearch} />
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: 20,
            borderRadius: "var(--radius-md)",
            background: "var(--red-glow)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "var(--red)",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <MarketCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Markets grid */}
      {!loading && filteredEvents.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
          }}
        >
          {filteredEvents.map((event, i) => (
            <MarketCard key={event.ticker} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredEvents.length === 0 && !error && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Activity
              size={28}
              style={{ color: "var(--text-muted)" }}
            />
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: "0 0 8px",
            }}
          >
            No markets found
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            {search
              ? `No results for "${search}"`
              : "Try adjusting your filters"}
          </p>
        </div>
      )}
    </div>
  );
}
