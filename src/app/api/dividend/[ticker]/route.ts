import { NextRequest, NextResponse } from "next/server";
import { scrapeDividendInfo } from "@/lib/services/naver-scraper";

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const info = await scrapeDividendInfo(params.ticker);
  return NextResponse.json(info);
}
