import { NextRequest, NextResponse } from "next/server";
import { requestOrder, getOrderStatus } from "@/lib/dflow-api";

/** GET /api/order?inputMint=...&outputMint=...&amount=...&userPublicKey=... */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const inputMint = searchParams.get("inputMint");
        const outputMint = searchParams.get("outputMint");
        const amount = searchParams.get("amount");
        const userPublicKey = searchParams.get("userPublicKey");

        if (!inputMint || !outputMint || !amount || !userPublicKey) {
            return NextResponse.json(
                { error: "Missing required params: inputMint, outputMint, amount, userPublicKey" },
                { status: 400 }
            );
        }

        // Check if this is an order-status request
        const signature = searchParams.get("signature");
        if (signature) {
            const status = await getOrderStatus(signature);
            return NextResponse.json(status);
        }

        const data = await requestOrder({
            inputMint,
            outputMint,
            amount,
            userPublicKey,
            slippageBps: searchParams.get("slippageBps") || undefined,
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Order API error:", error);

        // Surface the actual dFlow error message to the client
        const message = error.message || "Failed to process order";
        const status = message.includes("403") ? 403 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
