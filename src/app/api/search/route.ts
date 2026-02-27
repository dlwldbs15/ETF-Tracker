import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockAssets } from "@/lib/mock-data";

interface SearchResult {
  ticker: string;
  name: string;
  marketType: string;
}

/** mockAssets에서 검색어를 필터링하여 fallback 결과 반환 */
function searchFallback(q: string): SearchResult[] {
  const lq = q.toLowerCase();
  return mockAssets
    .filter(
      (a) =>
        a.ticker.toLowerCase().includes(lq) ||
        a.name.toLowerCase().includes(lq)
    )
    .slice(0, 10)
    .map((a) => ({
      ticker: a.ticker,
      name: a.name,
      // mockAssets의 type은 "ETF" | "STOCK" — STOCK은 등록 종목이 전부 KOSPI 대형주
      marketType: a.type === "ETF" ? "ETF" : "KOSPI",
    }));
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // ── 1. DB 검색 시도 ───────────────────────────────────────────────────────
  try {
    const rows = await prisma.assetsMaster.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { ticker: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { ticker: "asc" },
      select: { ticker: true, name: true, marketType: true },
    });

    // DB에 데이터가 있으면 그대로 반환
    if (rows.length > 0) {
      return NextResponse.json({ results: rows });
    }

    // DB가 비어있거나 결과 없음 → fallback
    const fallback = searchFallback(q);
    return NextResponse.json({
      results: fallback,
      source: "fallback", // 디버깅용
    });
  } catch {
    // DATABASE_URL 미설정 또는 연결 실패 → fallback
    const fallback = searchFallback(q);
    return NextResponse.json({
      results: fallback,
      source: "fallback",
    });
  }
}
