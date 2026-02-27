/**
 * 외부 API 원시 데이터를 내부 Asset 타입으로 정규화
 */

import type { EtfAsset, StockAsset, Asset, EtfAssetDetail, StockAssetDetail, AssetDetail } from "@/types/asset";
import type { PricePoint } from "@/types/etf";
import { ETF_REGISTRY, STOCK_REGISTRY, type EtfMeta, type StockMeta } from "./ticker-registry";
import type { RawStockPrice, DividendInfo } from "./data-go-kr";
import { mockAssets } from "@/lib/mock-data";

/** mock-data에서 시가총액 fallback 조회 */
function getMockMarketCap(ticker: string): number {
  return mockAssets.find((a) => a.ticker === ticker)?.marketCap ?? 0;
}

/** 원시 가격 데이터 + 메타 → Asset */
export function normalizeAsset(
  raw: RawStockPrice,
  ticker: string,
  dividendOverride?: Partial<DividendInfo>
): Asset | null {
  const etfMeta = ETF_REGISTRY[ticker];
  const stockMeta = STOCK_REGISTRY[ticker];

  if (!etfMeta && !stockMeta) return null;

  const currentPrice = parseInt(raw.clpr, 10);
  const changeRate = parseFloat(raw.fltRt);
  const rawMarketCap = parseInt(raw.mrktTotAmt, 10);
  const marketCap = rawMarketCap > 0 ? rawMarketCap : getMockMarketCap(ticker);
  const volume = parseInt(raw.trqu, 10);
  const name = raw.itmsNm || mockAssets.find((a) => a.ticker === ticker)?.name || ticker;

  if (etfMeta) {
    // Naver 스크래퍼가 dividendYield를 제공하면 사용, 없으면 레지스트리 기반 추정
    const scrapedYield = dividendOverride?.dividendYield ?? 0;
    const estimatedYield = etfMeta.lastDividendAmount > 0
      ? (etfMeta.lastDividendAmount * (etfMeta.dividendCycle === "월배당" ? 12 : etfMeta.dividendCycle === "분기배당" ? 4 : 1)) / currentPrice * 100
      : 0;
    const dividendYield = scrapedYield > 0 ? scrapedYield : estimatedYield;

    const asset: EtfAsset = {
      id: `etf-${ticker}`,
      type: "ETF",
      ticker,
      name,
      currentPrice,
      changeRate,
      marketCap,
      volume,
      category: etfMeta.category,
      expenseRatio: etfMeta.expenseRatio,
      issuer: etfMeta.issuer,
      nav: etfMeta.nav,
      dividendYield,
      // Naver는 월/분기 구분 불가 → 레지스트리 dividendCycle 항상 사용
      dividendCycle: etfMeta.dividendCycle,
      lastDividendAmount: dividendOverride?.lastDividendAmount ?? etfMeta.lastDividendAmount,
    };
    return asset;
  }

  const meta = stockMeta as StockMeta;
  const dividendYield = dividendOverride?.dividendYield ?? 0;
  // Naver는 주식 배당 주기를 구분하지 못하므로 레지스트리 값 항상 사용
  const dividendCycle = meta.dividendCycle;

  const asset: StockAsset = {
    id: `stock-${ticker}`,
    type: "STOCK",
    ticker,
    name,
    currentPrice,
    changeRate,
    marketCap,
    volume,
    category: meta.category,
    dividendYield,
    dividendCycle,
    lastDividendAmount: dividendOverride?.lastDividendAmount ?? 0,
    per: meta.per,
    pbr: meta.pbr,
    sector: meta.sector,
  };
  return asset;
}

/** 원시 가격 데이터 + 메타 → AssetDetail */
export function normalizeAssetDetail(
  raw: RawStockPrice,
  ticker: string,
  dividendOverride?: Partial<DividendInfo>
): AssetDetail | null {
  const base = normalizeAsset(raw, ticker, dividendOverride);
  if (!base) return null;

  if (base.type === "ETF") {
    const etfMeta = ETF_REGISTRY[ticker] as EtfMeta;
    const detail: EtfAssetDetail = {
      ...base,
      benchmark: etfMeta.benchmark,
      listingDate: etfMeta.listingDate,
    };
    return detail;
  }

  const stockMeta = STOCK_REGISTRY[ticker] as StockMeta;
  const detail: StockAssetDetail = {
    ...base,
    description: stockMeta.description,
    listingDate: stockMeta.listingDate,
    employees: stockMeta.employees,
    revenue: stockMeta.revenue,
    operatingProfit: stockMeta.operatingProfit,
    netIncome: stockMeta.netIncome,
  };
  return detail;
}

/** 원시 가격 히스토리 → PricePoint[] */
export function normalizePriceHistory(rawItems: RawStockPrice[]): PricePoint[] {
  // 날짜 정보가 없으므로 오늘부터 역산하여 날짜 생성
  const today = new Date();
  return rawItems.map((item, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (rawItems.length - 1 - idx));
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      price: parseInt(item.clpr, 10),
    };
  });
}
