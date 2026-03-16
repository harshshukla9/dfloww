import { NextRequest, NextResponse } from "next/server";
import { filterOutcomeMints } from "@/lib/dflow-api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const addresses: string[] = body.addresses || [];

        if (addresses.length === 0) {
            return NextResponse.json({ outcomeMints: [] });
        }

        const outcomeMints = await filterOutcomeMints(addresses);
        return NextResponse.json({ outcomeMints });
    } catch (error) {
        console.error("Filter mints error:", error);
        return NextResponse.json(
            { error: "Failed to filter mints" },
            { status: 500 }
        );
    }
}
