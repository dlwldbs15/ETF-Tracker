import { Etf, EtfDetail, PricePoint, Holding } from "@/types/etf";

export const mockEtfs: Etf[] = [
  {
    ticker: "069500",
    name: "KODEX 200",
    provider: "삼성자산운용",
    price: 35420,
    changeRate: 1.23,
    marketCap: 5_8234_0000_0000,
    expenseRatio: 0.15,
    category: "국내주식",
    volume: 12_340_000,
    dividendYield: 1.82,
    dividendCycle: "분기배당",
    lastDividendAmount: 160,
  },
  {
    ticker: "133690",
    name: "TIGER 미국나스닥100",
    provider: "미래에셋자산운용",
    price: 98750,
    changeRate: 2.15,
    marketCap: 8_4521_0000_0000,
    expenseRatio: 0.07,
    category: "해외주식",
    volume: 8_920_000,
    dividendYield: 0.51,
    dividendCycle: "분기배당",
    lastDividendAmount: 125,
  },
  {
    ticker: "278530",
    name: "RISE 200",
    provider: "KB자산운용",
    price: 11230,
    changeRate: -0.87,
    marketCap: 1_2340_0000_0000,
    expenseRatio: 0.017,
    category: "국내주식",
    volume: 3_450_000,
    dividendYield: 1.95,
    dividendCycle: "분기배당",
    lastDividendAmount: 55,
  },
  {
    ticker: "371460",
    name: "TIGER 차이나전기차SOLACTIVE",
    provider: "미래에셋자산운용",
    price: 7890,
    changeRate: -2.34,
    marketCap: 9870_0000_0000,
    expenseRatio: 0.49,
    category: "해외주식",
    volume: 7_560_000,
    dividendYield: 0,
    dividendCycle: "미지급",
    lastDividendAmount: 0,
  },
  {
    ticker: "381180",
    name: "TIGER 미국S&P500",
    provider: "미래에셋자산운용",
    price: 17850,
    changeRate: 0.89,
    marketCap: 4_5600_0000_0000,
    expenseRatio: 0.07,
    category: "해외주식",
    volume: 6_540_000,
    dividendYield: 1.21,
    dividendCycle: "분기배당",
    lastDividendAmount: 54,
  },
  {
    ticker: "305720",
    name: "KODEX 2차전지산업",
    provider: "삼성자산운용",
    price: 8765,
    changeRate: -1.45,
    marketCap: 7560_0000_0000,
    expenseRatio: 0.45,
    category: "국내주식",
    volume: 5_430_000,
    dividendYield: 0,
    dividendCycle: "미지급",
    lastDividendAmount: 0,
  },
  {
    ticker: "379810",
    name: "KODEX 미국S&P500TR",
    provider: "삼성자산운용",
    price: 14560,
    changeRate: 1.02,
    marketCap: 3_2100_0000_0000,
    expenseRatio: 0.05,
    category: "해외주식",
    volume: 4_320_000,
    dividendYield: 0,
    dividendCycle: "미지급",
    lastDividendAmount: 0,
  },
  {
    ticker: "364690",
    name: "KODEX Fn반도체",
    provider: "삼성자산운용",
    price: 11890,
    changeRate: 3.21,
    marketCap: 1_8760_0000_0000,
    expenseRatio: 0.45,
    category: "국내주식",
    volume: 9_870_000,
    dividendYield: 0.35,
    dividendCycle: "연배당",
    lastDividendAmount: 42,
  },
  {
    ticker: "261240",
    name: "RISE 미국S&P500",
    provider: "KB자산운용",
    price: 18920,
    changeRate: 0.56,
    marketCap: 2_1300_0000_0000,
    expenseRatio: 0.021,
    category: "해외주식",
    volume: 2_340_000,
    dividendYield: 1.18,
    dividendCycle: "분기배당",
    lastDividendAmount: 56,
  },
  {
    ticker: "252670",
    name: "KODEX 200선물인버스2X",
    provider: "삼성자산운용",
    price: 2340,
    changeRate: -3.21,
    marketCap: 4_3210_0000_0000,
    expenseRatio: 0.64,
    category: "국내주식",
    volume: 18_760_000,
    dividendYield: 0,
    dividendCycle: "미지급",
    lastDividendAmount: 0,
  },
  {
    ticker: "102110",
    name: "TIGER 200",
    provider: "미래에셋자산운용",
    price: 35680,
    changeRate: 1.18,
    marketCap: 3_9800_0000_0000,
    expenseRatio: 0.05,
    category: "국내주식",
    volume: 4_560_000,
    dividendYield: 1.78,
    dividendCycle: "분기배당",
    lastDividendAmount: 158,
  },
  {
    ticker: "114800",
    name: "KODEX 인버스",
    provider: "삼성자산운용",
    price: 4120,
    changeRate: -1.52,
    marketCap: 2_8900_0000_0000,
    expenseRatio: 0.64,
    category: "국내주식",
    volume: 15_430_000,
    dividendYield: 0,
    dividendCycle: "미지급",
    lastDividendAmount: 0,
  },
  {
    ticker: "229200",
    name: "KODEX 코스닥150",
    provider: "삼성자산운용",
    price: 12340,
    changeRate: -0.32,
    marketCap: 8900_0000_0000,
    expenseRatio: 0.25,
    category: "국내주식",
    volume: 3_210_000,
    dividendYield: 0.42,
    dividendCycle: "연배당",
    lastDividendAmount: 52,
  },
  {
    ticker: "091160",
    name: "KODEX 반도체",
    provider: "삼성자산운용",
    price: 34500,
    changeRate: 2.87,
    marketCap: 1_5670_0000_0000,
    expenseRatio: 0.45,
    category: "국내주식",
    volume: 7_890_000,
    dividendYield: 0.28,
    dividendCycle: "연배당",
    lastDividendAmount: 97,
  },
  {
    ticker: "453810",
    name: "RISE 미국나스닥100",
    provider: "KB자산운용",
    price: 15670,
    changeRate: 1.95,
    marketCap: 6780_0000_0000,
    expenseRatio: 0.021,
    category: "해외주식",
    volume: 2_890_000,
    dividendYield: 0.48,
    dividendCycle: "분기배당",
    lastDividendAmount: 19,
  },
  {
    ticker: "458730",
    name: "TIGER 미국배당다우존스",
    provider: "미래에셋자산운용",
    price: 12850,
    changeRate: 0.64,
    marketCap: 3_1200_0000_0000,
    expenseRatio: 0.01,
    category: "해외주식",
    volume: 5_670_000,
    dividendYield: 3.52,
    dividendCycle: "월배당",
    lastDividendAmount: 38,
  },
  {
    ticker: "441800",
    name: "TIGER 미국배당+7%프리미엄다우존스",
    provider: "미래에셋자산운용",
    price: 11340,
    changeRate: 0.32,
    marketCap: 1_8500_0000_0000,
    expenseRatio: 0.39,
    category: "해외주식",
    volume: 4_120_000,
    dividendYield: 7.15,
    dividendCycle: "월배당",
    lastDividendAmount: 68,
  },
  {
    ticker: "446720",
    name: "KODEX 미국배당다우존스",
    provider: "삼성자산운용",
    price: 12420,
    changeRate: 0.58,
    marketCap: 1_2300_0000_0000,
    expenseRatio: 0.01,
    category: "해외주식",
    volume: 3_450_000,
    dividendYield: 3.48,
    dividendCycle: "월배당",
    lastDividendAmount: 36,
  },
  {
    ticker: "490600",
    name: "RISE 미국배당다우존스",
    provider: "KB자산운용",
    price: 10870,
    changeRate: 0.45,
    marketCap: 4560_0000_0000,
    expenseRatio: 0.01,
    category: "해외주식",
    volume: 1_890_000,
    dividendYield: 3.45,
    dividendCycle: "월배당",
    lastDividendAmount: 31,
  },
];

export const providers = Array.from(new Set(mockEtfs.map((e) => e.provider)));

// ─── ETF 상세 정보 ──────────────────────────────────────

const detailMap: Record<string, { benchmark: string; listingDate: string }> = {
  "069500": { benchmark: "KOSPI 200", listingDate: "2002-10-14" },
  "133690": { benchmark: "NASDAQ 100", listingDate: "2010-10-18" },
  "278530": { benchmark: "KOSPI 200", listingDate: "2017-08-29" },
  "371460": { benchmark: "Solactive China Electric Vehicle", listingDate: "2021-01-07" },
  "381180": { benchmark: "S&P 500", listingDate: "2021-04-09" },
  "305720": { benchmark: "FnGuide 2차전지산업 지수", listingDate: "2018-09-10" },
  "379810": { benchmark: "S&P 500 TR", listingDate: "2021-04-09" },
  "364690": { benchmark: "FnGuide 반도체 지수", listingDate: "2020-10-29" },
  "261240": { benchmark: "S&P 500", listingDate: "2016-08-12" },
  "252670": { benchmark: "KOSPI 200 선물인버스2X", listingDate: "2016-09-22" },
  "102110": { benchmark: "KOSPI 200", listingDate: "2005-10-17" },
  "114800": { benchmark: "KOSPI 200 인버스", listingDate: "2009-09-25" },
  "229200": { benchmark: "KOSDAQ 150", listingDate: "2015-10-05" },
  "091160": { benchmark: "KRX 반도체", listingDate: "2006-06-27" },
  "453810": { benchmark: "NASDAQ 100", listingDate: "2022-11-15" },
  "458730": { benchmark: "Dow Jones U.S. Dividend 100", listingDate: "2023-06-20" },
  "441800": { benchmark: "Dow Jones U.S. Dividend 100 7% Premium", listingDate: "2022-09-27" },
  "446720": { benchmark: "Dow Jones U.S. Dividend 100", listingDate: "2022-11-15" },
  "490600": { benchmark: "Dow Jones U.S. Dividend 100", listingDate: "2024-01-23" },
};

export function getEtfDetail(ticker: string): EtfDetail | null {
  const etf = mockEtfs.find((e) => e.ticker === ticker);
  if (!etf) return null;
  const detail = detailMap[ticker] ?? { benchmark: "-", listingDate: "2020-01-01" };
  return { ...etf, ...detail };
}

// ─── 가격 히스토리 생성 (최근 30일) ─────────────────────

export function generatePriceHistory(ticker: string): PricePoint[] {
  const etf = mockEtfs.find((e) => e.ticker === ticker);
  if (!etf) return [];

  const points: PricePoint[] = [];
  const basePrice = etf.price;
  // seed from ticker for consistent results
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i);
  }

  let price = basePrice * 0.95;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // deterministic pseudo-random walk
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const change = (rnd - 0.45) * basePrice * 0.02;
    price = Math.max(price + change, basePrice * 0.85);
    points.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      price: Math.round(price),
    });
  }

  return points;
}

// ─── 구성 종목(Holdings) ────────────────────────────────

const holdingsMap: Record<string, Holding[]> = {
  "069500": [
    { name: "삼성전자", ticker: "005930", weight: 29.8 },
    { name: "SK하이닉스", ticker: "000660", weight: 11.2 },
    { name: "현대차", ticker: "005380", weight: 4.1 },
    { name: "셀트리온", ticker: "068270", weight: 3.2 },
    { name: "KB금융", ticker: "105560", weight: 2.8 },
    { name: "신한지주", ticker: "055550", weight: 2.5 },
    { name: "POSCO홀딩스", ticker: "005490", weight: 2.3 },
    { name: "NAVER", ticker: "035420", weight: 2.1 },
    { name: "삼성바이오로직스", ticker: "207940", weight: 1.9 },
    { name: "LG화학", ticker: "051910", weight: 1.7 },
  ],
  "133690": [
    { name: "Apple", ticker: "AAPL", weight: 8.9 },
    { name: "Microsoft", ticker: "MSFT", weight: 8.1 },
    { name: "NVIDIA", ticker: "NVDA", weight: 7.6 },
    { name: "Amazon", ticker: "AMZN", weight: 5.2 },
    { name: "Broadcom", ticker: "AVGO", weight: 4.8 },
    { name: "Meta Platforms", ticker: "META", weight: 4.5 },
    { name: "Tesla", ticker: "TSLA", weight: 3.8 },
    { name: "Alphabet A", ticker: "GOOGL", weight: 3.2 },
    { name: "Costco", ticker: "COST", weight: 2.7 },
    { name: "Netflix", ticker: "NFLX", weight: 2.4 },
  ],
  "102110": [
    { name: "삼성전자", ticker: "005930", weight: 30.1 },
    { name: "SK하이닉스", ticker: "000660", weight: 11.5 },
    { name: "현대차", ticker: "005380", weight: 4.0 },
    { name: "셀트리온", ticker: "068270", weight: 3.3 },
    { name: "기아", ticker: "000270", weight: 2.7 },
    { name: "KB금융", ticker: "105560", weight: 2.6 },
    { name: "신한지주", ticker: "055550", weight: 2.4 },
    { name: "POSCO홀딩스", ticker: "005490", weight: 2.2 },
    { name: "NAVER", ticker: "035420", weight: 2.0 },
    { name: "삼성바이오로직스", ticker: "207940", weight: 1.8 },
  ],
  "305720": [
    { name: "LG에너지솔루션", ticker: "373220", weight: 22.5 },
    { name: "삼성SDI", ticker: "006400", weight: 18.3 },
    { name: "에코프로비엠", ticker: "247540", weight: 12.1 },
    { name: "포스코퓨처엠", ticker: "003670", weight: 9.8 },
    { name: "에코프로", ticker: "086520", weight: 7.4 },
    { name: "엘앤에프", ticker: "066970", weight: 5.2 },
    { name: "SK이노베이션", ticker: "096770", weight: 4.1 },
    { name: "코스모신소재", ticker: "005070", weight: 3.3 },
    { name: "천보", ticker: "278280", weight: 2.8 },
    { name: "나노신소재", ticker: "121600", weight: 2.1 },
  ],
  "364690": [
    { name: "삼성전자", ticker: "005930", weight: 25.4 },
    { name: "SK하이닉스", ticker: "000660", weight: 23.8 },
    { name: "한미반도체", ticker: "042700", weight: 8.2 },
    { name: "리노공업", ticker: "058470", weight: 5.6 },
    { name: "ISC", ticker: "095340", weight: 4.1 },
    { name: "주성엔지니어링", ticker: "036930", weight: 3.5 },
    { name: "테크윙", ticker: "089030", weight: 3.0 },
    { name: "하나마이크론", ticker: "067310", weight: 2.6 },
    { name: "DB하이텍", ticker: "000990", weight: 2.2 },
    { name: "넥스틴", ticker: "348210", weight: 1.9 },
  ],
  "091160": [
    { name: "삼성전자", ticker: "005930", weight: 27.2 },
    { name: "SK하이닉스", ticker: "000660", weight: 24.5 },
    { name: "한미반도체", ticker: "042700", weight: 7.9 },
    { name: "리노공업", ticker: "058470", weight: 5.3 },
    { name: "DB하이텍", ticker: "000990", weight: 4.8 },
    { name: "주성엔지니어링", ticker: "036930", weight: 3.7 },
    { name: "ISC", ticker: "095340", weight: 3.1 },
    { name: "테크윙", ticker: "089030", weight: 2.5 },
    { name: "하나마이크론", ticker: "067310", weight: 2.0 },
    { name: "넥스틴", ticker: "348210", weight: 1.6 },
  ],
};

const defaultHoldings: Holding[] = [
  { name: "삼성전자", ticker: "005930", weight: 15.2 },
  { name: "SK하이닉스", ticker: "000660", weight: 8.7 },
  { name: "LG에너지솔루션", ticker: "373220", weight: 5.3 },
  { name: "현대차", ticker: "005380", weight: 4.1 },
  { name: "셀트리온", ticker: "068270", weight: 3.5 },
  { name: "기아", ticker: "000270", weight: 2.9 },
  { name: "KB금융", ticker: "105560", weight: 2.6 },
  { name: "신한지주", ticker: "055550", weight: 2.3 },
  { name: "NAVER", ticker: "035420", weight: 2.0 },
  { name: "POSCO홀딩스", ticker: "005490", weight: 1.8 },
];

export function getHoldings(ticker: string): Holding[] {
  return holdingsMap[ticker] ?? defaultHoldings;
}
