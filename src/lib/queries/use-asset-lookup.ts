"use client";

import { useMemo } from "react";
import { useAssets } from "./use-assets";
import type { Asset } from "@/types/asset";

/**
 * 전체 자산 데이터를 Map으로 반환하여 ticker로 O(1) 조회를 지원합니다.
 * portfolio-context 등에서 동기적 ticker 조회에 사용합니다.
 */
export function useAssetMap() {
  const { data: assets, isLoading, error } = useAssets("ALL");

  const assetMap = useMemo(() => {
    const map = new Map<string, Asset>();
    if (assets) {
      for (const asset of assets) {
        map.set(asset.ticker, asset);
      }
    }
    return map;
  }, [assets]);

  return { assetMap, isLoading, error };
}
