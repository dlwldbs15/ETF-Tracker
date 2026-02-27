/**
 * scripts/sync-all-assets.ts
 *
 * 공공데이터포털 GetStockSecuritiesInfoService/getStockPriceInfo API를 이용해
 * 국내 상장 전 종목(KOSPI + KOSDAQ)을 pages 단위로 수집하고
 * assets_master 테이블에 Upsert 합니다.
 *
 * 실행:
 *   npx tsx scripts/sync-all-assets.ts
 *
 * 필요 환경변수 (.env.local 또는 .env):
 *   DATA_GO_KR_API_KEY=<공공데이터포털 인증키>
 *   DATABASE_URL=<PostgreSQL 연결 문자열>
 */

import { PrismaClient } from "@prisma/client";

// ── 환경 변수 로드 (Next.js 없이 실행하므로 직접 파싱) ──────────────────────
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv(): void {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
    console.log(`[env] Loaded: ${file}`);
    break; // .env.local 발견 시 .env는 건너뜀
  }
}

loadEnv();

// ── 상수 ──────────────────────────────────────────────────────────────────────

const API_BASE =
  "https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo";

const NUM_OF_ROWS = 1000;          // 페이지당 행 수
const PAGE_DELAY_MS = 1000;        // 페이지 간 딜레이 (ms)

/** 공공데이터포털 mrktCtg → assets_master marketType 매핑 */
const MARKET_TYPE_MAP: Record<string, string> = {
  KOSPI:  "KOSPI",
  KOSDAQ: "KOSDAQ",
  KONEX:  "KOSDAQ", // KONEX는 KOSDAQ 계열로 통합
};

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface ApiItem {
  basDt:   string; // 기준일자 (YYYYMMDD)
  srtnCd:  string; // 단축코드 (ticker)
  isinCd:  string; // ISIN 코드
  itmsNm:  string; // 종목명
  mrktCtg: string; // 시장구분 (KOSPI | KOSDAQ | KONEX)
  corpNm:  string; // 법인명
}

interface ApiResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      totalCount: number;
      pageNo:     number;
      numOfRows:  number;
      items: { item: ApiItem[] } | "";
    };
  };
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Date → YYYYMMDD */
function toYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** 가장 최근 영업일 (오늘 또는 직전 평일) */
function getRecentTradingDate(): string {
  const d = new Date();
  if (d.getDay() === 0) d.setDate(d.getDate() - 2);
  if (d.getDay() === 6) d.setDate(d.getDate() - 1);
  return toYYYYMMDD(d);
}

/** YYYYMMDD 기준 N 영업일 전 날짜 반환 */
function prevTradingDate(from: string, n: number): string {
  const d = new Date(
    parseInt(from.slice(0, 4)),
    parseInt(from.slice(4, 6)) - 1,
    parseInt(from.slice(6, 8))
  );
  let skipped = 0;
  while (skipped < n) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) skipped++;
  }
  return toYYYYMMDD(d);
}

/**
 * ETF 여부 추정
 * - 한국 ETF 운용사 브랜드 키워드로 판별
 * - 완벽하지 않으나 getStockPriceInfo 에는 ETF가 섞여있음
 */
function detectMarketType(item: ApiItem): string {
  const ETF_KEYWORDS = [
    "KODEX", "TIGER", "KBSTAR", "HANARO", "RISE", "SOL",
    "TIMEFOLIO", "FOCUS", "SMART", "ACE", "KOSEF", "파워",
  ];
  const nameUpper = item.itmsNm.toUpperCase();
  if (ETF_KEYWORDS.some((kw) => nameUpper.includes(kw))) {
    return "ETF";
  }
  return MARKET_TYPE_MAP[item.mrktCtg] ?? item.mrktCtg;
}

// ── API 호출 ──────────────────────────────────────────────────────────────────

async function fetchPage(
  serviceKey: string,
  pageNo: number,
  endDt: string,
  beginDt: string
): Promise<{ items: ApiItem[]; totalCount: number }> {
  const params = new URLSearchParams({
    serviceKey,
    numOfRows: String(NUM_OF_ROWS),
    pageNo: String(pageNo),
    resultType: "json",
    beginBasDt: beginDt,
    endBasDt: endDt,
  });

  const url = `${API_BASE}?${params.toString()}`;
  console.log(`  → GET page=${pageNo} (${beginDt}~${endDt})`);

  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as ApiResponse;
  const body = json.response?.body;

  if (!body) {
    throw new Error(`API 응답 오류: ${JSON.stringify(json.response?.header)}`);
  }

  // 결과가 없으면 items가 빈 문자열로 내려옴
  const rawItems = body.items === "" ? [] : body.items.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return { items, totalCount: body.totalCount ?? 0 };
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const serviceKey = process.env.DATA_GO_KR_API_KEY;
  if (!serviceKey) {
    console.error("[error] DATA_GO_KR_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // ── 1단계: 전체 페이지 수집 (최근 30일 범위로 조회 후 최신 basDt만 사용) ────
    const endDt   = getRecentTradingDate();
    const beginDt = prevTradingDate(endDt, 30); // 30 영업일 전
    console.log(`\n[sync-all-assets] 조회 범위: ${beginDt} ~ ${endDt}`);
    console.log("─".repeat(50));

    const rawItems: ApiItem[] = [];
    let pageNo = 1;
    let totalCount = 0;

    do {
      const { items, totalCount: total } = await fetchPage(serviceKey, pageNo, endDt, beginDt);

      if (pageNo === 1) {
        totalCount = total;
        console.log(`     총 ${totalCount.toLocaleString()}개 행 / ${Math.ceil(totalCount / NUM_OF_ROWS)}페이지 예상`);
      }

      rawItems.push(...items);
      console.log(`     수집 누계: ${rawItems.length.toLocaleString()}개`);

      if (rawItems.length >= totalCount || items.length < NUM_OF_ROWS) break;
      pageNo++;
      await sleep(PAGE_DELAY_MS);
    } while (true);

    if (rawItems.length === 0) {
      console.error("\n[error] 데이터를 가져오지 못했습니다. API 키 또는 네트워크를 확인하세요.");
      return;
    }

    // 가장 최근 기준일(basDt)의 데이터만 사용
    const latestDt = rawItems.reduce((max, r) => (r.basDt > max ? r.basDt : max), "");
    const allItems = rawItems.filter((r) => r.basDt === latestDt);
    console.log(`\n     최신 기준일: ${latestDt} / 종목 수: ${allItems.length.toLocaleString()}개`);

    // ── 2단계: Upsert ────────────────────────────────────────

    console.log(`\n[upsert] ${allItems.length.toLocaleString()}개 종목을 DB에 반영 중...`);

    const BATCH = 500; // Prisma 트랜잭션 배치 크기
    let upserted = 0;

    for (let i = 0; i < allItems.length; i += BATCH) {
      const batch = allItems.slice(i, i + BATCH);

      await prisma.$transaction(
        batch.map((item) =>
          prisma.assetsMaster.upsert({
            where: { ticker: item.srtnCd },
            create: {
              ticker:     item.srtnCd,
              name:       item.itmsNm,
              marketType: detectMarketType(item),
              category:   null,
            },
            update: {
              name:        item.itmsNm,
              marketType:  detectMarketType(item),
              lastUpdated: new Date(),
            },
          })
        )
      );

      upserted += batch.length;
      process.stdout.write(`\r     진행: ${upserted.toLocaleString()} / ${allItems.length.toLocaleString()}`);
    }

    // ── 3단계: 결과 요약 ─────────────────────────────────────

    const summary = await prisma.assetsMaster.groupBy({
      by: ["marketType"],
      _count: { ticker: true },
      orderBy: { marketType: "asc" },
    });

    console.log("\n\n[완료] assets_master 현황:");
    console.log("─".repeat(30));
    for (const row of summary) {
      console.log(`  ${row.marketType.padEnd(8)} ${row._count.ticker.toLocaleString()}개`);
    }
    const total = summary.reduce((s: number, r: { _count: { ticker: number } }) => s + r._count.ticker, 0);
    console.log(`${"  합계".padEnd(10)} ${total.toLocaleString()}개`);
    console.log("─".repeat(30));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
