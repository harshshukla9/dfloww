import { NextRequest, NextResponse } from "next/server";
import { getMarketsBatch } from "@/lib/dflow-api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const mints: string[] = body.mints || [];

        if (mints.length === 0) {
            return NextResponse.json({ markets: [] });
        }

        const data = await getMarketsBatch(mints);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Markets batch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch markets batch" },
            { status: 500 }
        );
    }
}
