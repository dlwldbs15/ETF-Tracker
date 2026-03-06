import { NextRequest, NextResponse } from "next/server";
import { scrapeDividendInfo } from "@/lib/services/naver-scraper";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const info = await scrapeDividendInfo(ticker);
  return NextResponse.json(info);
}
