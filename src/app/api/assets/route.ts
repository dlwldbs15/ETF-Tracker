import { NextRequest, NextResponse } from "next/server";
import { ALL_TICKERS } from "@/lib/services/ticker-registry";
import { fetchAllStockPrices } from "@/lib/services/data-go-kr";
import { normalizeAsset } from "@/lib/services/asset-normalizer";
import { mockAssets } from "@/lib/mock-data";
import type { Asset } from "@/types/asset";

// 서버사이드 인메모리 캐시 (5분 TTL)
let cachedAssets: Asset[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const typeParam = request.nextUrl.searchParams.get("type") ?? "ALL";

  try {
    const now = Date.now();

    // 캐시 확인
    if (!cachedAssets || now - cacheTimestamp > CACHE_TTL) {
      const priceMap = await fetchAllStockPrices(ALL_TICKERS);

      const assets: Asset[] = [];
      for (const ticker of ALL_TICKERS) {
        const raw = priceMap.get(ticker);
        if (raw) {
          const asset = normalizeAsset(raw, ticker);
          if (asset) {
            assets.push(asset);
            continue;
          }
        }
        // API에서 못 가져온 종목은 mock fallback
        const fallback = mockAssets.find((a) => a.ticker === ticker);
        if (fallback) assets.push(fallback);
      }

      cachedAssets = assets;
      cacheTimestamp = now;
    }

    let result = cachedAssets;
    if (typeParam === "ETF") {
      result = cachedAssets.filter((a) => a.type === "ETF");
    } else if (typeParam === "STOCK") {
      result = cachedAssets.filter((a) => a.type === "STOCK");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/assets failed, using mock fallback:", error);

    let fallback = mockAssets;
    if (typeParam === "ETF") {
      fallback = mockAssets.filter((a) => a.type === "ETF") as typeof mockAssets;
    } else if (typeParam === "STOCK") {
      fallback = mockAssets.filter((a) => a.type === "STOCK") as typeof mockAssets;
    }

    return NextResponse.json(fallback, {
      headers: { "X-Data-Source": "mock" },
    });
  }
}
