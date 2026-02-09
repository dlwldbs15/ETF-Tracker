"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { PortfolioItem } from "@/types/etf";
import { mockEtfs, generatePriceHistory } from "@/lib/mock-data";

interface PortfolioContextValue {
  items: PortfolioItem[];
  addItem: (ticker: string) => void;
  removeItem: (ticker: string) => void;
  updateWeight: (ticker: string, weight: number) => void;
  hasTicker: (ticker: string) => boolean;
  totalWeight: number;
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
      return [...prev, { ticker, weight: 0 }];
    });
  }, []);

  const removeItem = useCallback((ticker: string) => {
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }, []);

  const updateWeight = useCallback((ticker: string, weight: number) => {
    setItems((prev) =>
      prev.map((i) => (i.ticker === ticker ? { ...i, weight } : i))
    );
  }, []);

  const hasTicker = useCallback(
    (ticker: string) => items.some((i) => i.ticker === ticker),
    [items]
  );

  const totalWeight = useMemo(
    () => items.reduce((sum, i) => sum + i.weight, 0),
    [items]
  );

  const estimatedReturn = useMemo(() => {
    if (items.length === 0 || totalWeight === 0) {
      return { rate1w: 0, rate1m: 0, weightedExpense: 0 };
    }

    let rate1w = 0;
    let rate1m = 0;
    let weightedExpense = 0;

    for (const item of items) {
      if (item.weight <= 0) continue;

      const etf = mockEtfs.find((e) => e.ticker === item.ticker);
      if (!etf) continue;

      const history = generatePriceHistory(item.ticker);
      if (history.length < 2) continue;

      const pct = item.weight / totalWeight;
      const lastPrice = history[history.length - 1].price;
      const weekAgoPrice = history[Math.max(history.length - 7, 0)].price;
      const firstPrice = history[0].price;

      rate1w += ((lastPrice - weekAgoPrice) / weekAgoPrice) * 100 * pct;
      rate1m += ((lastPrice - firstPrice) / firstPrice) * 100 * pct;
      weightedExpense += etf.expenseRatio * pct;
    }

    return { rate1w, rate1m, weightedExpense };
  }, [items, totalWeight]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateWeight,
      hasTicker,
      totalWeight,
      estimatedReturn,
    }),
    [items, addItem, removeItem, updateWeight, hasTicker, totalWeight, estimatedReturn]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
