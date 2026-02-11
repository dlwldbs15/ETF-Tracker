import type { EtfAsset, StockAsset, Asset, EtfAssetDetail, StockAssetDetail, AssetDetail } from "@/types/asset";
import type { PricePoint, Holding } from "@/types/etf";

// ─── ETF 목 데이터 ──────────────────────────────────────────

export const mockEtfs: EtfAsset[] = [
  {
    id: "etf-069500",
    type: "ETF",
    ticker: "069500",
    name: "KODEX 200",
    issuer: "삼성자산운용",
    currentPrice: 35420,
    nav: 35450,
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
    id: "etf-133690",
    type: "ETF",
    ticker: "133690",
    name: "TIGER 미국나스닥100",
    issuer: "미래에셋자산운용",
    currentPrice: 98750,
    nav: 98820,
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
    id: "etf-278530",
    type: "ETF",
    ticker: "278530",
    name: "RISE 200",
    issuer: "KB자산운용",
    currentPrice: 11230,
    nav: 11245,
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
    id: "etf-371460",
    type: "ETF",
    ticker: "371460",
    name: "TIGER 차이나전기차SOLACTIVE",
    issuer: "미래에셋자산운용",
    currentPrice: 7890,
    nav: 7910,
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
    id: "etf-381180",
    type: "ETF",
    ticker: "381180",
    name: "TIGER 미국S&P500",
    issuer: "미래에셋자산운용",
    currentPrice: 17850,
    nav: 17870,
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
    id: "etf-305720",
    type: "ETF",
    ticker: "305720",
    name: "KODEX 2차전지산업",
    issuer: "삼성자산운용",
    currentPrice: 8765,
    nav: 8780,
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
    id: "etf-379810",
    type: "ETF",
    ticker: "379810",
    name: "KODEX 미국S&P500TR",
    issuer: "삼성자산운용",
    currentPrice: 14560,
    nav: 14580,
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
    id: "etf-364690",
    type: "ETF",
    ticker: "364690",
    name: "KODEX Fn반도체",
    issuer: "삼성자산운용",
    currentPrice: 11890,
    nav: 11910,
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
    id: "etf-261240",
    type: "ETF",
    ticker: "261240",
    name: "RISE 미국S&P500",
    issuer: "KB자산운용",
    currentPrice: 18920,
    nav: 18940,
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
    id: "etf-252670",
    type: "ETF",
    ticker: "252670",
    name: "KODEX 200선물인버스2X",
    issuer: "삼성자산운용",
    currentPrice: 2340,
    nav: 2345,
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
    id: "etf-102110",
    type: "ETF",
    ticker: "102110",
    name: "TIGER 200",
    issuer: "미래에셋자산운용",
    currentPrice: 35680,
    nav: 35710,
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
    id: "etf-114800",
    type: "ETF",
    ticker: "114800",
    name: "KODEX 인버스",
    issuer: "삼성자산운용",
    currentPrice: 4120,
    nav: 4125,
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
    id: "etf-229200",
    type: "ETF",
    ticker: "229200",
    name: "KODEX 코스닥150",
    issuer: "삼성자산운용",
    currentPrice: 12340,
    nav: 12360,
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
    id: "etf-091160",
    type: "ETF",
    ticker: "091160",
    name: "KODEX 반도체",
    issuer: "삼성자산운용",
    currentPrice: 34500,
    nav: 34530,
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
    id: "etf-453810",
    type: "ETF",
    ticker: "453810",
    name: "RISE 미국나스닥100",
    issuer: "KB자산운용",
    currentPrice: 15670,
    nav: 15690,
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
    id: "etf-458730",
    type: "ETF",
    ticker: "458730",
    name: "TIGER 미국배당다우존스",
    issuer: "미래에셋자산운용",
    currentPrice: 12850,
    nav: 12870,
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
    id: "etf-441800",
    type: "ETF",
    ticker: "441800",
    name: "TIGER 미국배당+7%프리미엄다우존스",
    issuer: "미래에셋자산운용",
    currentPrice: 11340,
    nav: 11360,
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
    id: "etf-446720",
    type: "ETF",
    ticker: "446720",
    name: "KODEX 미국배당다우존스",
    issuer: "삼성자산운용",
    currentPrice: 12420,
    nav: 12440,
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
    id: "etf-490600",
    type: "ETF",
    ticker: "490600",
    name: "RISE 미국배당다우존스",
    issuer: "KB자산운용",
    currentPrice: 10870,
    nav: 10890,
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

// ─── 주식 목 데이터 ─────────────────────────────────────────

export const mockStocks: StockAsset[] = [
  {
    id: "stock-005930",
    type: "STOCK",
    ticker: "005930",
    name: "삼성전자",
    currentPrice: 72400,
    changeRate: 1.54,
    marketCap: 432_1200_0000_0000,
    volume: 15_230_000,
    category: "전자/반도체",
    dividendYield: 2.07,
    sector: "반도체",
    per: 13.2,
    pbr: 1.15,
  },
  {
    id: "stock-000660",
    type: "STOCK",
    ticker: "000660",
    name: "SK하이닉스",
    currentPrice: 178500,
    changeRate: 2.87,
    marketCap: 129_8700_0000_0000,
    volume: 4_560_000,
    category: "전자/반도체",
    dividendYield: 0.67,
    sector: "반도체",
    per: 8.5,
    pbr: 1.82,
  },
  {
    id: "stock-005380",
    type: "STOCK",
    ticker: "005380",
    name: "현대차",
    currentPrice: 245000,
    changeRate: -0.41,
    marketCap: 52_3400_0000_0000,
    volume: 1_890_000,
    category: "자동차",
    dividendYield: 3.27,
    sector: "자동차",
    per: 5.8,
    pbr: 0.62,
  },
  {
    id: "stock-035420",
    type: "STOCK",
    ticker: "035420",
    name: "NAVER",
    currentPrice: 215000,
    changeRate: 0.94,
    marketCap: 35_2100_0000_0000,
    volume: 1_230_000,
    category: "IT/플랫폼",
    dividendYield: 0.42,
    sector: "인터넷",
    per: 24.3,
    pbr: 1.45,
  },
  {
    id: "stock-068270",
    type: "STOCK",
    ticker: "068270",
    name: "셀트리온",
    currentPrice: 198000,
    changeRate: -1.25,
    marketCap: 28_1400_0000_0000,
    volume: 2_340_000,
    category: "바이오",
    dividendYield: 0.25,
    sector: "바이오",
    per: 38.7,
    pbr: 3.21,
  },
];

// ─── 통합 자산 배열 ──────────────────────────────────────────

export const mockAssets: Asset[] = [...mockEtfs, ...mockStocks];

export const issuers = Array.from(new Set(mockEtfs.map((e) => e.issuer)));
/** @deprecated providers 대신 issuers 사용 */
export const providers = issuers;

// ─── ETF 상세 정보 ──────────────────────────────────────────

const etfDetailMap: Record<string, { benchmark: string; listingDate: string }> = {
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

export function getEtfDetail(ticker: string): EtfAssetDetail | null {
  const etf = mockEtfs.find((e) => e.ticker === ticker);
  if (!etf) return null;
  const detail = etfDetailMap[ticker] ?? { benchmark: "-", listingDate: "2020-01-01" };
  return { ...etf, ...detail };
}

// ─── 주식 상세 정보 ──────────────────────────────────────────

const stockDetailMap: Record<string, { description: string; listingDate: string; employees: number; revenue: number; operatingProfit: number; netIncome: number }> = {
  "005930": { description: "반도체, 스마트폰, 디스플레이 등을 제조하는 글로벌 전자기업", listingDate: "1975-06-11", employees: 267937, revenue: 258_9400_0000_0000, operatingProfit: 6_5700_0000_0000, netIncome: 15_4800_0000_0000 },
  "000660": { description: "DRAM, NAND Flash 등 메모리 반도체를 제조하는 기업", listingDate: "1996-12-26", employees: 35000, revenue: 66_1900_0000_0000, operatingProfit: 28_8800_0000_0000, netIncome: 19_5700_0000_0000 },
  "005380": { description: "승용차, 상용차 및 자동차 부품을 제조·판매하는 자동차 기업", listingDate: "1974-06-28", employees: 75000, revenue: 162_6600_0000_0000, operatingProfit: 14_8700_0000_0000, netIncome: 12_2700_0000_0000 },
  "035420": { description: "검색, 커머스, 핀테크, 콘텐츠 등 인터넷 플랫폼 기업", listingDate: "2002-10-29", employees: 4500, revenue: 9_6700_0000_0000, operatingProfit: 1_5800_0000_0000, netIncome: 1_0500_0000_0000 },
  "068270": { description: "바이오시밀러 및 항체 의약품을 개발·생산하는 바이오 기업", listingDate: "2018-11-08", employees: 8500, revenue: 3_5200_0000_0000, operatingProfit: 5800_0000_0000, netIncome: 4200_0000_0000 },
};

export function getStockDetail(ticker: string): StockAssetDetail | null {
  const stock = mockStocks.find((s) => s.ticker === ticker);
  if (!stock) return null;
  const detail = stockDetailMap[ticker] ?? {
    description: "-",
    listingDate: "2000-01-01",
    employees: 0,
    revenue: 0,
    operatingProfit: 0,
    netIncome: 0,
  };
  return { ...stock, ...detail };
}

// ─── 통합 상세 조회 ──────────────────────────────────────────

export function getAssetDetail(ticker: string): AssetDetail | null {
  return getEtfDetail(ticker) ?? getStockDetail(ticker);
}

// ─── 가격 히스토리 생성 (최근 30일) ─────────────────────────

export function generatePriceHistory(ticker: string): PricePoint[] {
  const asset = mockAssets.find((a) => a.ticker === ticker);
  if (!asset) return [];

  const points: PricePoint[] = [];
  const basePrice = asset.currentPrice;
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i);
  }

  let price = basePrice * 0.95;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
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

// ─── 구성 종목(Holdings) ────────────────────────────────────

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
