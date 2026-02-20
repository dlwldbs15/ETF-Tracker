"use client";

import { useQuery } from "@tanstack/react-query";
import type { AssetDetail } from "@/types/asset";
import type { PricePoint, Holding } from "@/types/etf";

async function fetchAssetDetail(ticker: string): Promise<AssetDetail> {
  const res = await fetch(`/api/assets/${ticker}`);
  if (!res.ok) throw new Error("Failed to fetch asset detail");
  return res.json();
}

async function fetchPriceHistory(ticker: string): Promise<PricePoint[]> {
  const res = await fetch(`/api/assets/${ticker}/price-history`);
  if (!res.ok) throw new Error("Failed to fetch price history");
  return res.json();
}

async function fetchHoldings(ticker: string): Promise<Holding[]> {
  const res = await fetch(`/api/assets/${ticker}/holdings`);
  if (!res.ok) throw new Error("Failed to fetch holdings");
  return res.json();
}

export function useAssetDetail(ticker: string) {
  return useQuery({
    queryKey: ["asset-detail", ticker],
    queryFn: () => fetchAssetDetail(ticker),
    enabled: !!ticker,
  });
}

export function usePriceHistory(ticker: string) {
  return useQuery({
    queryKey: ["price-history", ticker],
    queryFn: () => fetchPriceHistory(ticker),
    enabled: !!ticker,
  });
}

export function useHoldings(ticker: string) {
  return useQuery({
    queryKey: ["holdings", ticker],
    queryFn: () => fetchHoldings(ticker),
    enabled: !!ticker,
  });
}
