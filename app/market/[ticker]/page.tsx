import { getEvents } from "@/lib/dflow-api";
import { MarketDetailClient } from "./MarketDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ ticker: string }>;
}

export default async function MarketDetailPage({ params }: PageProps) {
    const { ticker } = await params;
    const decodedTicker = decodeURIComponent(ticker);

    // Try fetching across all statuses to find the event
    let event = null;
    try {
        // First try all events (no status filter)
        const data = await getEvents({
            withNestedMarkets: true,
            limit: 50,
        });
        event = data.events?.find(
            (e) => e.ticker === decodedTicker || e.ticker === ticker
        );

        // If not found, try specific statuses one by one
        if (!event) {
            for (const status of ["active", "determined", "finalized", "closed"]) {
                try {
                    const res = await getEvents({
                        withNestedMarkets: true,
                        status,
                        limit: 50,
                    });
                    event = res.events?.find(
                        (e) => e.ticker === decodedTicker || e.ticker === ticker
                    );
                    if (event) break;
                } catch {
                    // This status query failed, try next
                    continue;
                }
            }
        }
    } catch (error) {
        console.error("Failed to fetch event:", error);
    }

    if (!event) {
        return (
            <div
                style={{
                    padding: "80px 40px",
                    textAlign: "center",
                }}
            >
                <h2
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 8,
                    }}
                >
                    Market not found
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                    The market &quot;{decodedTicker}&quot; could not be found.
                </p>
                <Link
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 14,
                        color: "var(--blue)",
                        textDecoration: "none",
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Markets
                </Link>
            </div>
        );
    }

    return <MarketDetailClient event={event} />;
}
