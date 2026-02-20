/**
 * Naver Finance 실시간 시세 API 클라이언트
 * (공공데이터포털 대신 사용 — ETF + 주식 모두 지원)
 */

const POLLING_BASE =
  "https://polling.finance.naver.com/api/realtime/domestic/stock";

export interface RawStockPrice {
  /** 종목코드 */
  srtnCd: string;
  /** 종목명 */
  itmsNm: string;
  /** 종가 (문자열) */
  clpr: string;
  /** 등락률 (문자열) */
  fltRt: string;
  /** 거래량 (문자열) */
  trqu: string;
  /** 시가총액 (문자열, 원 단위) — 제공하지 않으면 "0" */
  mrktTotAmt: string;
}

/** Naver polling API 원시 응답 */
interface NaverPollingItem {
  itemCode: string;
  stockName: string;
  closePriceRaw: string;
  fluctuationsRatioRaw: string;
  accumulatedTradingVolumeRaw: string;
}

/** 단일 종목 최신 시세 조회 */
export async function fetchStockPrice(
  ticker: string
): Promise<RawStockPrice | null> {
  const res = await fetch(`${POLLING_BASE}/${ticker}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return null;

  const json = await res.json();
  const data: NaverPollingItem | undefined = json?.datas?.[0];
  if (!data) return null;

  return {
    srtnCd: data.itemCode,
    itmsNm: data.stockName,
    clpr: data.closePriceRaw,
    fltRt: data.fluctuationsRatioRaw,
    trqu: data.accumulatedTradingVolumeRaw,
    mrktTotAmt: "0", // polling API에는 시가총액 없음 → normalizer에서 메타 사용
  };
}

/** 복수 종목 배치 조회 (동시 6개 제한) */
export async function fetchAllStockPrices(
  tickers: string[]
): Promise<Map<string, RawStockPrice>> {
  const result = new Map<string, RawStockPrice>();
  const concurrency = 6;

  for (let i = 0; i < tickers.length; i += concurrency) {
    const batch = tickers.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map((t) => fetchStockPrice(t))
    );

    for (let j = 0; j < batch.length; j++) {
      const s = settled[j];
      if (s.status === "fulfilled" && s.value) {
        result.set(batch[j], s.value);
      }
    }
  }

  return result;
}

/** 종목 가격 히스토리 조회 — Naver Finance 차트 API */
export async function fetchPriceHistory(
  ticker: string,
  days: number = 30
): Promise<RawStockPrice[]> {
  // 시작일: days * 1.5일 전 (주말/공휴일 감안)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.ceil(days * 1.5));
  const startStr = formatDate(startDate);

  const endDate = new Date();
  const endStr = formatDate(endDate);

  const url = `https://api.finance.naver.com/siseJson.naver?symbol=${ticker}&requestType=1&startTime=${startStr}&endTime=${endStr}&timeframe=day`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) return [];

  const text = await res.text();

  // 응답: [["날짜","시가","고가","저가","종가","거래량","외국인소진율"], ["20260210", 79300, ...], ...]
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("[\"2")); // 날짜로 시작하는 데이터 행만

  const result: RawStockPrice[] = [];
  for (const line of lines) {
    const match = line.match(/"(\d{8})"/);
    if (!match) continue;

    const parts = line.replace(/[\[\]"]/g, "").split(",").map((s) => s.trim());
    if (parts.length < 6) continue;

    result.push({
      srtnCd: ticker,
      itmsNm: "",
      clpr: parts[4],  // 종가
      fltRt: "0",
      trqu: parts[5],  // 거래량
      mrktTotAmt: "0",
    });
  }

  return result.slice(-days);
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
