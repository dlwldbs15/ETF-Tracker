import { NextRequest, NextResponse } from "next/server";
import { fetchPriceHistory } from "@/lib/services/data-go-kr";
import { normalizePriceHistory } from "@/lib/services/asset-normalizer";
import { generatePriceHistory } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;

  try {
    const rawHistory = await fetchPriceHistory(ticker, 30);

    if (rawHistory.length === 0) throw new Error("No price history");

    const points = normalizePriceHistory(rawHistory);
    return NextResponse.json(points);
  } catch (error) {
    console.error(
      `GET /api/assets/${ticker}/price-history failed, using mock:`,
      error
    );

    const fallback = generatePriceHistory(ticker);
    return NextResponse.json(fallback, {
      headers: { "X-Data-Source": "mock" },
    });
  }
}
