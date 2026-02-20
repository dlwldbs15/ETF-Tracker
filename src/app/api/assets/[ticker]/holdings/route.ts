import { NextRequest, NextResponse } from "next/server";
import { getHoldings } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  // 구성종목 데이터는 공공데이터포털 API에서 제공하지 않음 → 정적 데이터 사용
  const holdings = getHoldings(params.ticker);
  return NextResponse.json(holdings);
}
