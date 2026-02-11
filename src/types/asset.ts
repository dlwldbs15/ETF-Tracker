/** 자산 유형 구분자 */
export type AssetType = "ETF" | "STOCK";

/** 공통 필드 (ETF + 주식) */
export interface BaseAsset {
  id: string;
  ticker: string;
  name: string;
  currentPrice: number;
  changeRate: number;
  marketCap: number;
  dividendYield: number;
  volume: number;
  category: string;
  type: AssetType;
}

/** ETF 전용 */
export interface EtfAsset extends BaseAsset {
  type: "ETF";
  expenseRatio: number;
  issuer: string;
  nav: number;
  dividendCycle: string;
  lastDividendAmount: number;
}

/** 주식 전용 */
export interface StockAsset extends BaseAsset {
  type: "STOCK";
  per: number;
  pbr: number;
  sector: string;
}

/** 통합 자산 (Discriminated Union) */
export type Asset = EtfAsset | StockAsset;

/** ETF 상세 */
export interface EtfAssetDetail extends EtfAsset {
  benchmark: string;
  listingDate: string;
}

/** 주식 상세 */
export interface StockAssetDetail extends StockAsset {
  description: string;
  listingDate: string;
  employees: number;
  revenue: number;
  operatingProfit: number;
  netIncome: number;
}

/** 통합 상세 */
export type AssetDetail = EtfAssetDetail | StockAssetDetail;
