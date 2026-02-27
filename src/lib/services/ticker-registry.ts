/**
 * 정적 메타데이터 레지스트리
 * 공공데이터포털 API에서 제공하지 않는 필드(운용사, 보수율, 섹터 등)의 source of truth
 */

/** ETF 정적 메타데이터 */
export interface EtfMeta {
  type: "ETF";
  issuer: string;
  expenseRatio: number;
  nav: number;
  category: string;
  dividendCycle: string;
  lastDividendAmount: number;
  benchmark: string;
  listingDate: string;
}

/** 주식 정적 메타데이터 */
export interface StockMeta {
  type: "STOCK";
  sector: string;
  category: string;
  dividendCycle: string;
  per: number;
  pbr: number;
  description: string;
  listingDate: string;
  employees: number;
  revenue: number;
  operatingProfit: number;
  netIncome: number;
}

export const ETF_REGISTRY: Record<string, EtfMeta> = {
  "069500": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.15, nav: 35450, category: "국내주식", dividendCycle: "분기배당", lastDividendAmount: 160, benchmark: "KOSPI 200", listingDate: "2002-10-14" },
  "133690": { type: "ETF", issuer: "미래에셋자산운용", expenseRatio: 0.07, nav: 98820, category: "해외주식", dividendCycle: "분기배당", lastDividendAmount: 125, benchmark: "NASDAQ 100", listingDate: "2010-10-18" },
  "278530": { type: "ETF", issuer: "KB자산운용", expenseRatio: 0.017, nav: 11245, category: "국내주식", dividendCycle: "분기배당", lastDividendAmount: 55, benchmark: "KOSPI 200", listingDate: "2017-08-29" },
  "371460": { type: "ETF", issuer: "미래에셋자산운용", expenseRatio: 0.49, nav: 7910, category: "해외주식", dividendCycle: "미지급", lastDividendAmount: 0, benchmark: "Solactive China Electric Vehicle", listingDate: "2021-01-07" },
  "381180": { type: "ETF", issuer: "미래에셋자산운용", expenseRatio: 0.07, nav: 17870, category: "해외주식", dividendCycle: "분기배당", lastDividendAmount: 54, benchmark: "S&P 500", listingDate: "2021-04-09" },
  "305720": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.45, nav: 8780, category: "국내주식", dividendCycle: "미지급", lastDividendAmount: 0, benchmark: "FnGuide 2차전지산업 지수", listingDate: "2018-09-10" },
  "379810": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.05, nav: 14580, category: "해외주식", dividendCycle: "미지급", lastDividendAmount: 0, benchmark: "S&P 500 TR", listingDate: "2021-04-09" },
  "364690": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.45, nav: 11910, category: "국내주식", dividendCycle: "연배당", lastDividendAmount: 42, benchmark: "FnGuide 반도체 지수", listingDate: "2020-10-29" },
  "261240": { type: "ETF", issuer: "KB자산운용", expenseRatio: 0.021, nav: 18940, category: "해외주식", dividendCycle: "분기배당", lastDividendAmount: 56, benchmark: "S&P 500", listingDate: "2016-08-12" },
  "252670": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.64, nav: 2345, category: "국내주식", dividendCycle: "미지급", lastDividendAmount: 0, benchmark: "KOSPI 200 선물인버스2X", listingDate: "2016-09-22" },
  "102110": { type: "ETF", issuer: "미래에셋자산운용", expenseRatio: 0.05, nav: 35710, category: "국내주식", dividendCycle: "분기배당", lastDividendAmount: 158, benchmark: "KOSPI 200", listingDate: "2005-10-17" },
  "114800": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.64, nav: 4125, category: "국내주식", dividendCycle: "미지급", lastDividendAmount: 0, benchmark: "KOSPI 200 인버스", listingDate: "2009-09-25" },
  "229200": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.25, nav: 12360, category: "국내주식", dividendCycle: "연배당", lastDividendAmount: 52, benchmark: "KOSDAQ 150", listingDate: "2015-10-05" },
  "091160": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.45, nav: 34530, category: "국내주식", dividendCycle: "연배당", lastDividendAmount: 97, benchmark: "KRX 반도체", listingDate: "2006-06-27" },
  "453810": { type: "ETF", issuer: "KB자산운용", expenseRatio: 0.021, nav: 15690, category: "해외주식", dividendCycle: "분기배당", lastDividendAmount: 19, benchmark: "NASDAQ 100", listingDate: "2022-11-15" },
  "458730": { type: "ETF", issuer: "미래에셋자산운용", expenseRatio: 0.01, nav: 12870, category: "해외주식", dividendCycle: "월배당", lastDividendAmount: 38, benchmark: "Dow Jones U.S. Dividend 100", listingDate: "2023-06-20" },
  "441800": { type: "ETF", issuer: "미래에셋자산운용", expenseRatio: 0.39, nav: 11360, category: "해외주식", dividendCycle: "월배당", lastDividendAmount: 68, benchmark: "Dow Jones U.S. Dividend 100 7% Premium", listingDate: "2022-09-27" },
  "446720": { type: "ETF", issuer: "삼성자산운용", expenseRatio: 0.01, nav: 12440, category: "해외주식", dividendCycle: "월배당", lastDividendAmount: 36, benchmark: "Dow Jones U.S. Dividend 100", listingDate: "2022-11-15" },
  "490600": { type: "ETF", issuer: "KB자산운용", expenseRatio: 0.01, nav: 10890, category: "해외주식", dividendCycle: "월배당", lastDividendAmount: 31, benchmark: "Dow Jones U.S. Dividend 100", listingDate: "2024-01-23" },
};

export const STOCK_REGISTRY: Record<string, StockMeta> = {
  "005930": { type: "STOCK", sector: "반도체", category: "전자/반도체", dividendCycle: "분기배당", per: 13.2, pbr: 1.15, description: "반도체, 스마트폰, 디스플레이 등을 제조하는 글로벌 전자기업", listingDate: "1975-06-11", employees: 267937, revenue: 258_9400_0000_0000, operatingProfit: 6_5700_0000_0000, netIncome: 15_4800_0000_0000 },
  "000660": { type: "STOCK", sector: "반도체", category: "전자/반도체", dividendCycle: "연배당",  per: 8.5, pbr: 1.82, description: "DRAM, NAND Flash 등 메모리 반도체를 제조하는 기업", listingDate: "1996-12-26", employees: 35000, revenue: 66_1900_0000_0000, operatingProfit: 28_8800_0000_0000, netIncome: 19_5700_0000_0000 },
  "005380": { type: "STOCK", sector: "자동차", category: "자동차", dividendCycle: "분기배당",  per: 5.8, pbr: 0.62, description: "승용차, 상용차 및 자동차 부품을 제조·판매하는 자동차 기업", listingDate: "1974-06-28", employees: 75000, revenue: 162_6600_0000_0000, operatingProfit: 14_8700_0000_0000, netIncome: 12_2700_0000_0000 },
  "035420": { type: "STOCK", sector: "인터넷", category: "IT/플랫폼", dividendCycle: "연배당",  per: 24.3, pbr: 1.45, description: "검색, 커머스, 핀테크, 콘텐츠 등 인터넷 플랫폼 기업", listingDate: "2002-10-29", employees: 4500, revenue: 9_6700_0000_0000, operatingProfit: 1_5800_0000_0000, netIncome: 1_0500_0000_0000 },
  "068270": { type: "STOCK", sector: "바이오", category: "바이오", dividendCycle: "연배당",  per: 38.7, pbr: 3.21, description: "바이오시밀러 및 항체 의약품을 개발·생산하는 바이오 기업", listingDate: "2018-11-08", employees: 8500, revenue: 3_5200_0000_0000, operatingProfit: 5800_0000_0000, netIncome: 4200_0000_0000 },
};

/** 등록된 모든 티커 목록 */
export const ALL_TICKERS = [
  ...Object.keys(ETF_REGISTRY),
  ...Object.keys(STOCK_REGISTRY),
];

export function getTickerMeta(ticker: string): EtfMeta | StockMeta | null {
  return ETF_REGISTRY[ticker] ?? STOCK_REGISTRY[ticker] ?? null;
}

export function isEtfTicker(ticker: string): boolean {
  return ticker in ETF_REGISTRY;
}
