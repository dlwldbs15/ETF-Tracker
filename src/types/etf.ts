export type { EtfAsset as Etf, EtfAssetDetail as EtfDetail, Asset, AssetType } from "./asset";

export interface PricePoint {
  date: string;
  price: number;
}

export interface Holding {
  name: string;
  ticker: string;
  weight: number;
}

export interface PortfolioItem {
  ticker: string;
  quantity: number;
}
