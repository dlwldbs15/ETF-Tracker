import { NextRequest, NextResponse } from "next/server";
import { getHoldings } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const holdings = getHoldings(ticker);
  return NextResponse.json(holdings);
}
