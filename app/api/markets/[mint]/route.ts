import { NextRequest, NextResponse } from "next/server";
import { getMarketByMint } from "@/lib/dflow-api";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ mint: string }> }
) {
    try {
        const { mint } = await params;
        const data = await getMarketByMint(mint);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Market detail error:", error);
        return NextResponse.json(
            { error: "Failed to fetch market" },
            { status: 500 }
        );
    }
}
