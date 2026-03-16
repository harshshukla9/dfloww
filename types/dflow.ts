// ============================================================
// dFlow Prediction Markets — TypeScript Types
// ============================================================

/** Settlement account within a market (one per settlement mint) */
export interface MarketAccount {
  yesMint: string;
  noMint: string;
  redemptionStatus?: "open" | "closed" | string;
  scalarOutcomePct?: number | null;
}

/** A single tradeable market within an event */
export interface DFlowMarket {
  ticker: string;
  eventTicker?: string;
  title: string;
  subtitle?: string;
  yesSubTitle?: string;
  noSubTitle?: string;
  marketType?: string;
  status: "inactive" | "active" | "closed" | "determined" | "finalized";
  result?: "yes" | "no" | "";
  isInitialized?: boolean;
  settlementMint?: string;
  accounts: Record<string, MarketAccount>;
  /** Pricing — cent values as strings like "0.30" = 30¢ */
  yesBid?: string | null;
  yesAsk?: string | null;
  noBid?: string | null;
  noAsk?: string | null;
  /** Volume & open interest */
  volume?: number;
  volume24hFp?: string;
  openInterest?: number;
  openInterestFp?: string;
  volumeFp?: string;
  /** Timing */
  openTime?: number;
  closeTime?: number;
  expirationTime?: number;
}

/** An event containing one or more markets */
export interface DFlowEvent {
  ticker: string;
  title: string;
  subtitle?: string;
  description?: string;
  seriesTicker?: string;
  category?: string;
  tags?: string[];
  markets?: DFlowMarket[];
  mutuallyExclusive?: boolean;
  endDate?: string;
  image?: string;
  imageUrl?: string;
  /** Volume in cents */
  volume?: number;
  volume24h?: number;
  openInterest?: number;
  liquidity?: number;
  volumeFp?: string;
  volume24hFp?: string;
  openInterestFp?: string;
}

/** A series grouping related events (e.g. "Bitcoin Price") */
export interface DFlowSeries {
  ticker: string;
  title?: string;
  category?: string;
  tags?: string[];
}

/** Tags grouped by category */
export interface TagsByCategories {
  tagsByCategories: Record<string, string[]>;
}

/** User position derived from wallet token accounts */
export interface DFlowPosition {
  mint: string;
  balance: number;
  decimals: number;
  position: "YES" | "NO" | "UNKNOWN";
  market: DFlowMarket | null;
  eventTitle?: string;
}

/** Response from /order endpoint */
export interface OrderResponse {
  transaction: string; // base64-encoded VersionedTransaction
  [key: string]: unknown;
}

/** Response from /order-status endpoint */
export interface OrderStatusResponse {
  status: string;
  fills?: unknown[];
  [key: string]: unknown;
}

/** Events API response */
export interface EventsResponse {
  events: DFlowEvent[];
  nextCursor?: string;
}

/** Markets API response */
export interface MarketsResponse {
  markets: DFlowMarket[];
}

/** Series API response */
export interface SeriesResponse {
  series: DFlowSeries[];
}

/** Query params for fetching events */
export interface EventsQueryParams {
  withNestedMarkets?: boolean;
  status?: string;
  seriesTickers?: string;
  limit?: number;
  category?: string;
  tags?: string;
}
