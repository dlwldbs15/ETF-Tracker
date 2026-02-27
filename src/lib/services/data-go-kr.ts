/**
 * Naver Finance 실시간 시세 API 클라이언트
 * (공공데이터포털 대신 사용 — ETF + 주식 모두 지원)
 *
 * 배당 정보:
 *   - 주식 → fetchStockDividend() (공공데이터포털 GetStockDividendInfoService)
 *   - ETF  → naver-scraper.ts scrapeDividendInfo() (Naver 스크래핑)
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

// ── 주식 배당 정보 (공공데이터포털) ──────────────────────────────────────────

const DIVIDEND_API_BASE =
  "https://apis.data.go.kr/1160100/service/GetStockDividendInfoService/getStockDividendInfo";

interface DividendApiItem {
  basDt:           string; // 기준일자 (YYYYMMDD)
  srtnCd:          string; // 단축코드
  thstrmDvdnAmt:   string; // 당기 주당배당금 (원)
  thstrmDvdnYldt:  string; // 당기 배당수익률 (예: "1.82" → 1.82%)
  dvdnRcd:         string; // 배당기록일
}

export interface DividendInfo {
  dividendYield:       number;
  dividendCycle:       string;
  lastDividendAmount:  number;
}

const DEFAULT_DIVIDEND: DividendInfo = {
  dividendYield: 0,
  dividendCycle: "미지급",
  lastDividendAmount: 0,
};

/**
 * 공공데이터포털 GetStockDividendInfoService에서 주식 배당 정보를 가져옵니다.
 * - 최근 2년치 조회 → 최신 레코드 기준 배당수익률·주당배당금 추출
 * - 연간 레코드 수로 배당 주기(연/분기) 추정
 * - 실패 시 DEFAULT_DIVIDEND 반환
 */
export async function fetchStockDividend(
  ticker: string
): Promise<DividendInfo> {
  const serviceKey = process.env.DATA_GO_KR_API_KEY;
  if (!serviceKey) return DEFAULT_DIVIDEND;

  const today = new Date();
  const twoYearsAgo = new Date(today.getFullYear() - 2, 0, 1);

  const params = new URLSearchParams({
    serviceKey,
    numOfRows: "10", // 분기배당 기준 2년치 최대 8건
    pageNo:    "1",
    resultType: "json",
    srtnCd:    ticker,
    beginBasDt: formatDate(twoYearsAgo),
    endBasDt:   formatDate(today),
  });

  try {
    const res = await fetch(`${DIVIDEND_API_BASE}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return DEFAULT_DIVIDEND;

    const json = await res.json();
    const body = json.response?.body;
    if (!body) return DEFAULT_DIVIDEND;

    const rawItems = body.items === "" ? [] : (body.items?.item ?? []);
    const items: DividendApiItem[] = Array.isArray(rawItems) ? rawItems : [rawItems];
    if (items.length === 0) return DEFAULT_DIVIDEND;

    // 최신 기준일 순 정렬
    items.sort((a, b) => b.basDt.localeCompare(a.basDt));
    const latest = items[0];

    const rawYield  = parseFloat(latest.thstrmDvdnYldt) || 0;
    const lastDividendAmount = parseInt(latest.thstrmDvdnAmt, 10) || 0;

    if (rawYield === 0 && lastDividendAmount === 0) return DEFAULT_DIVIDEND;

    // API 값이 소수점 표현(0.0182)이면 100을 곱해 퍼센트로 변환
    const dividendYield = rawYield < 1 && rawYield > 0 ? rawYield * 100 : rawYield;

    // 배당 주기 — 연간 레코드 수로 추정
    const thisYear = String(today.getFullYear());
    const lastYear = String(today.getFullYear() - 1);
    const maxPerYear = Math.max(
      items.filter((i) => i.basDt.startsWith(thisYear)).length,
      items.filter((i) => i.basDt.startsWith(lastYear)).length
    );
    const dividendCycle =
      maxPerYear >= 4 ? "분기배당" :
      maxPerYear >= 2 ? "반기배당" :
      "연배당";

    return { dividendYield, dividendCycle, lastDividendAmount };
  } catch {
    return DEFAULT_DIVIDEND;
  }
}
