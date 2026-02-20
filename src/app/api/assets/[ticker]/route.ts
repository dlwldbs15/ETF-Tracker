import { NextRequest, NextResponse } from "next/server";
import { fetchStockPrice } from "@/lib/services/data-go-kr";
import { scrapeDividendInfo } from "@/lib/services/naver-scraper";
import { normalizeAssetDetail } from "@/lib/services/asset-normalizer";
import { getTickerMeta } from "@/lib/services/ticker-registry";
import { getAssetDetail } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;
  const meta = getTickerMeta(ticker);

  if (!meta) {
    return NextResponse.json(
      { error: "Unknown ticker" },
      { status: 404 }
    );
  }

  try {
    const [rawPrice, dividendInfo] = await Promise.all([
      fetchStockPrice(ticker),
      scrapeDividendInfo(ticker),
    ]);

    if (!rawPrice) throw new Error("No price data returned");

    const detail = normalizeAssetDetail(rawPrice, ticker, dividendInfo);
    if (!detail) throw new Error("Normalization failed");

    return NextResponse.json(detail);
  } catch (error) {
    console.error(`GET /api/assets/${ticker} failed, using mock:`, error);

    const fallback = getAssetDetail(ticker);
    if (!fallback) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fallback, {
      headers: { "X-Data-Source": "mock" },
    });
  }
}
