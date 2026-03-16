import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/dflow-api";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const data = await getEvents({
            status: searchParams.get("status") || "active",
            seriesTickers: searchParams.get("seriesTickers") || undefined,
            limit: Number(searchParams.get("limit")) || 200,
            withNestedMarkets: true,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Markets API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch markets" },
            { status: 500 }
        );
    }
}
