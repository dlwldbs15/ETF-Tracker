"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset, EtfAsset } from "@/types/asset";

async function fetchAssets(type: string): Promise<Asset[]> {
  const res = await fetch(`/api/assets?type=${type}`);
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

export function useAssets(type: "ETF" | "STOCK" | "ALL" = "ALL") {
  return useQuery({
    queryKey: ["assets", type],
    queryFn: () => fetchAssets(type),
  });
}

export function useEtfs() {
  const query = useAssets("ETF");
  return {
    ...query,
    data: (query.data ?? []) as EtfAsset[],
  };
}

export function useStocks() {
  const query = useAssets("STOCK");
  return query;
}

export function useIssuers() {
  const { data: etfs = [] } = useEtfs();
  return useMemo(
    () => Array.from(new Set(etfs.map((e) => e.issuer))),
    [etfs]
  );
}
