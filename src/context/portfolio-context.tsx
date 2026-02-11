"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { PortfolioItem } from "@/types/etf";
import { mockAssets, generatePriceHistory } from "@/lib/mock-data";

interface PortfolioContextValue {
  items: PortfolioItem[];
  addItem: (ticker: string) => void;
  removeItem: (ticker: string) => void;
  updateQuantity: (ticker: string, quantity: number) => void;
  hasTicker: (ticker: string) => boolean;
  /** 각 종목별 평가금액 (ticker → amount) */
  getAmount: (ticker: string) => number;
  /** 각 종목별 비중 % (ticker → weight) */
  getWeight: (ticker: string) => number;
  /** 총 투자금액 */
  totalAmount: number;
  estimatedReturn: { rate1w: number; rate1m: number; weightedExpense: number };
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  const addItem = useCallback((ticker: string) => {
    setItems((prev) => {
      if (prev.some((i) => i.ticker === ticker)) return prev;
      return [...prev, { ticker, quantity: 0 }];
    });
  }, []);

  const removeItem = useCallback((ticker: string) => {
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }, []);

  const updateQuantity = useCallback((ticker: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.ticker === ticker ? { ...i, quantity } : i))
    );
  }, []);

  const hasTicker = useCallback(
    (ticker: string) => items.some((i) => i.ticker === ticker),
    [items]
  );

  // 종목별 평가금액 맵
  const amountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const asset = mockAssets.find((a) => a.ticker === item.ticker);
      if (!asset) continue;
      map.set(item.ticker, asset.currentPrice * item.quantity);
    }
    return map;
  }, [items]);

  const totalAmount = useMemo(
    () => Array.from(amountMap.values()).reduce((sum, v) => sum + v, 0),
    [amountMap]
  );

  const getAmount = useCallback(
    (ticker: string) => amountMap.get(ticker) ?? 0,
    [amountMap]
  );

  const getWeight = useCallback(
    (ticker: string) => {
      if (totalAmount === 0) return 0;
      return ((amountMap.get(ticker) ?? 0) / totalAmount) * 100;
    },
    [amountMap, totalAmount]
  );

  const estimatedReturn = useMemo(() => {
    if (items.length === 0 || totalAmount === 0) {
      return { rate1w: 0, rate1m: 0, weightedExpense: 0 };
    }

    let rate1w = 0;
    let rate1m = 0;
    let weightedExpense = 0;

    for (const item of items) {
      const amount = amountMap.get(item.ticker) ?? 0;
      if (amount <= 0) continue;

      const asset = mockAssets.find((a) => a.ticker === item.ticker);
      if (!asset) continue;

      const history = generatePriceHistory(item.ticker);
      if (history.length < 2) continue;

      const pct = amount / totalAmount;
      const lastPrice = history[history.length - 1].price;
      const weekAgoPrice = history[Math.max(history.length - 7, 0)].price;
      const firstPrice = history[0].price;

      rate1w += ((lastPrice - weekAgoPrice) / weekAgoPrice) * 100 * pct;
      rate1m += ((lastPrice - firstPrice) / firstPrice) * 100 * pct;
      weightedExpense += (asset.type === "ETF" ? asset.expenseRatio : 0) * pct;
    }

    return { rate1w, rate1m, weightedExpense };
  }, [items, amountMap, totalAmount]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      hasTicker,
      getAmount,
      getWeight,
      totalAmount,
      estimatedReturn,
    }),
    [items, addItem, removeItem, updateQuantity, hasTicker, getAmount, getWeight, totalAmount, estimatedReturn]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
