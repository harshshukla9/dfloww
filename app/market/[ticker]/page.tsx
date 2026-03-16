import { getEvents } from "@/lib/dflow-api";
import { MarketDetailClient } from "./MarketDetailClient";

interface PageProps {
    params: Promise<{ ticker: string }>;
}

export default async function MarketDetailPage({ params }: PageProps) {
    const { ticker } = await params;

    // Fetch all events and find the one matching this ticker
    let event = null;
    try {
        const data = await getEvents({
            withNestedMarkets: true,
            limit: 200,
        });
        event = data.events?.find(
            (e) => e.ticker === ticker || e.ticker === decodeURIComponent(ticker)
        );
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
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    The market &quot;{decodeURIComponent(ticker)}&quot; could not be found.
                </p>
            </div>
        );
    }

    return <MarketDetailClient event={event} />;
}
