// ============================================================
// dFlow API Client — Server-Side Only
// ============================================================

import type {
    EventsResponse,
    EventsQueryParams,
    TagsByCategories,
    SeriesResponse,
    DFlowMarket,
    MarketsResponse,
} from "@/types/dflow";

const METADATA_URL =
    process.env.DFLOW_METADATA_URL ||
    "https://dev-prediction-markets-api.dflow.net";
const TRADE_URL =
    process.env.DFLOW_TRADE_URL || "https://dev-quote-api.dflow.net";
const API_KEY = process.env.DFLOW_API_KEY || "";

// ── Helpers ──────────────────────────────────────────────────

function metadataHeaders(): HeadersInit {
    return { "Content-Type": "application/json" };
}

function tradeHeaders(): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (API_KEY) h["x-api-key"] = API_KEY;
    return h;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        next: { revalidate: 30 }, // ISR: revalidate every 30s
    });
    if (!res.ok) {
        const text = await res.text();
        let errMsg = `dFlow API error ${res.status}`;
        try {
            const errJson = JSON.parse(text);
            errMsg = errJson.msg || errJson.message || errJson.error || errMsg;
        } catch {
            if (text) errMsg += `: ${text.slice(0, 200)}`;
        }
        throw new Error(errMsg);
    }
    return res.json() as Promise<T>;
}

/** Uncached fetch for trade/order endpoints (each request is unique) */
async function fetchTradeJSON<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        cache: "no-store",
    });
    if (!res.ok) {
        // Try to parse dFlow error JSON (format: {msg, code})
        const text = await res.text();
        let errMsg = `dFlow Trade API error ${res.status}`;
        try {
            const errJson = JSON.parse(text);
            errMsg = errJson.msg || errJson.message || errJson.error || errMsg;
        } catch {
            errMsg = text || errMsg;
        }
        throw new Error(errMsg);
    }
    return res.json() as Promise<T>;
}

// ── Metadata API ─────────────────────────────────────────────

/** Fetch events with optional nested markets */
export async function getEvents(
    params: EventsQueryParams = {}
): Promise<EventsResponse> {
    const q = new URLSearchParams();
    if (params.withNestedMarkets !== false) q.set("withNestedMarkets", "true");
    if (params.status) q.set("status", params.status);
    if (params.seriesTickers) q.set("seriesTickers", params.seriesTickers);
    if (params.limit) q.set("limit", params.limit.toString());
    if (params.category) q.set("category", params.category);
    if (params.tags) q.set("tags", params.tags);

    return fetchJSON<EventsResponse>(
        `${METADATA_URL}/api/v1/events?${q.toString()}`,
        { headers: metadataHeaders() }
    );
}

/** Get all categories and their tags */
export async function getTagsByCategories(): Promise<TagsByCategories> {
    return fetchJSON<TagsByCategories>(
        `${METADATA_URL}/api/v1/tags_by_categories`,
        { headers: metadataHeaders() }
    );
}

/** Get series (optionally filtered by category/tags) */
export async function getSeries(params?: {
    category?: string;
    tags?: string;
}): Promise<SeriesResponse> {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.tags) q.set("tags", params.tags);
    const qs = q.toString();

    return fetchJSON<SeriesResponse>(
        `${METADATA_URL}/api/v1/series${qs ? `?${qs}` : ""}`,
        { headers: metadataHeaders() }
    );
}

/** Get a single market by any of its outcome mints */
export async function getMarketByMint(mint: string): Promise<DFlowMarket> {
    return fetchJSON<DFlowMarket>(
        `${METADATA_URL}/api/v1/market/by-mint/${mint}`,
        { headers: metadataHeaders() }
    );
}

/** Batch-fetch markets by mint addresses */
export async function getMarketsBatch(
    mints: string[]
): Promise<MarketsResponse> {
    return fetchJSON<MarketsResponse>(`${METADATA_URL}/api/v1/markets/batch`, {
        method: "POST",
        headers: metadataHeaders(),
        body: JSON.stringify({ mints }),
    });
}

/** Get markets by status */
export async function getMarkets(params?: {
    status?: string;
    limit?: number;
}): Promise<MarketsResponse> {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.limit) q.set("limit", params.limit.toString());
    const qs = q.toString();

    return fetchJSON<MarketsResponse>(
        `${METADATA_URL}/api/v1/markets${qs ? `?${qs}` : ""}`,
        { headers: metadataHeaders() }
    );
}

/** Filter addresses to find which are outcome mints */
export async function filterOutcomeMints(
    addresses: string[]
): Promise<string[]> {
    const data = await fetchJSON<{ outcomeMints: string[] }>(
        `${METADATA_URL}/api/v1/filter_outcome_mints`,
        {
            method: "POST",
            headers: metadataHeaders(),
            body: JSON.stringify({ addresses }),
        }
    );
    return data.outcomeMints ?? [];
}

// ── Trade API ────────────────────────────────────────────────

/** Request a trade order (returns serialized transaction) */
export async function requestOrder(params: {
    inputMint: string;
    outputMint: string;
    amount: string;
    userPublicKey: string;
    slippageBps?: string;
}) {
    const q = new URLSearchParams({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        userPublicKey: params.userPublicKey,
    });
    if (params.slippageBps) q.set("slippageBps", params.slippageBps);

    return fetchTradeJSON<{ transaction: string }>(
        `${TRADE_URL}/order?${q.toString()}`,
        { headers: tradeHeaders() }
    );
}

/** Check order fill status */
export async function getOrderStatus(signature: string) {
    return fetchTradeJSON<{ status: string; fills?: unknown[] }>(
        `${TRADE_URL}/order-status?signature=${signature}`,
        { headers: tradeHeaders() }
    );
}
