export interface Etf {
  ticker: string;
  name: string;
  provider: string;
  price: number;
  changeRate: number;
  marketCap: number;
  expenseRatio: number;
  category: string;
  volume: number;
  dividendYield: number;
  dividendCycle: string;
  lastDividendAmount: number;
}

export interface EtfDetail extends Etf {
  benchmark: string;
  listingDate: string;
}

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
