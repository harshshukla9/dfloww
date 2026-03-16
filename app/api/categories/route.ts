import { NextResponse } from "next/server";
import { getTagsByCategories } from "@/lib/dflow-api";

export async function GET() {
    try {
        const data = await getTagsByCategories();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Categories API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
