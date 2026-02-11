"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Plus, Check, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Asset } from "@/types/asset";
import { usePortfolio } from "@/context/portfolio-context";
import {
  formatKRW,
  formatChangeRate,
  formatVolume,
  formatMarketCap,
  formatExpenseRatio,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Highlight } from "@/components/ui/highlight";

type SortKey = "currentPrice" | "changeRate" | "marketCap" | "volume" | "expenseRatio" | "dividendYield";
type SortDir = "asc" | "desc";

function getSortValue(asset: Asset, key: SortKey): number {
  if (key === "expenseRatio") {
    return asset.type === "ETF" ? asset.expenseRatio : 0;
  }
  return asset[key];
}

interface EtfRankingTableProps {
  data: Asset[];
  searchQuery?: string;
}

export function EtfRankingTable({ data, searchQuery = "" }: EtfRankingTableProps) {
  const router = useRouter();
  const { addItem, hasTicker } = usePortfolio();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        검색 결과가 없습니다
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card List (< md) */}
      <div className="space-y-2 md:hidden">
        {sorted.map((etf, index) => {
          const inPortfolio = hasTicker(etf.ticker);
          const isPositive = etf.changeRate >= 0;
          return (
            <div
              key={etf.ticker}
              onClick={() => router.push(`/etf/${etf.ticker}`)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors active:bg-secondary/50"
            >
              {/* Rank */}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    <Highlight text={etf.name} query={searchQuery} />
                  </p>
                  <span className={cn(
                    "shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold",
                    etf.type === "ETF"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  )}>
                    {etf.type === "ETF" ? "ETF" : "주식"}
                  </span>
                  {etf.dividendYield > 0 && (
                    <span className="shrink-0 text-[10px] font-medium text-amber-400">
                      {etf.dividendYield.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    <Highlight text={etf.ticker} query={searchQuery} />
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                    {etf.category}
                  </Badge>
                </div>
              </div>

              {/* Price + Change */}
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-medium text-foreground">
                  {formatKRW(etf.currentPrice)}
                </p>
                <p
                  className={cn(
                    "flex items-center justify-end gap-0.5 text-xs font-medium",
                    isPositive ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {formatChangeRate(etf.changeRate)}
                </p>
              </div>

              {/* Add button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 shrink-0",
                  inPortfolio ? "text-primary" : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!inPortfolio) addItem(etf.ticker);
                }}
              >
                {inPortfolio ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Desktop: Table (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12 text-muted-foreground">순위</TableHead>
              <TableHead className="text-muted-foreground">종목명</TableHead>
              <TableHead className="text-muted-foreground">티커</TableHead>
              <SortableHead label="현재가" sortKey="currentPrice" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="등락률" sortKey="changeRate" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="배당률" sortKey="dividendYield" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="시가총액" sortKey="marketCap" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="거래량" sortKey="volume" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="총보수" sortKey="expenseRatio" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <TableHead className="text-muted-foreground">카테고리</TableHead>
              <TableHead className="w-16 text-center text-muted-foreground">담기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((etf, index) => {
              const inPortfolio = hasTicker(etf.ticker);
              return (
                <TableRow
                  key={etf.ticker}
                  onClick={() => router.push(`/etf/${etf.ticker}`)}
                  className="border-border cursor-pointer transition-colors hover:bg-secondary/50"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Highlight text={etf.name} query={searchQuery} />
                      <span className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        etf.type === "ETF"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      )}>
                        {etf.type === "ETF" ? "ETF" : "주식"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    <Highlight text={etf.ticker} query={searchQuery} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatKRW(etf.currentPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        etf.changeRate >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {etf.changeRate >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {formatChangeRate(etf.changeRate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {etf.dividendYield > 0 ? (
                      <span className="font-mono text-sm text-amber-400">
                        {etf.dividendYield.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatMarketCap(etf.marketCap)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatVolume(etf.volume)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {etf.type === "ETF" ? formatExpenseRatio(etf.expenseRatio) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {etf.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={
                        inPortfolio
                          ? "h-7 w-7 text-primary"
                          : "h-7 w-7 text-muted-foreground hover:text-primary"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!inPortfolio) addItem(etf.ticker);
                      }}
                    >
                      {inPortfolio ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function SortableHead({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = currentKey === sortKey;

  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none transition-colors hover:text-foreground",
        align === "right" && "text-right",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {label}
        <span className="inline-flex flex-col">
          <ChevronUp
            className={cn(
              "h-3 w-3 -mb-1",
              isActive && dir === "asc" ? "text-foreground" : "text-muted-foreground/30"
            )}
          />
          <ChevronDown
            className={cn(
              "h-3 w-3",
              isActive && dir === "desc" ? "text-foreground" : "text-muted-foreground/30"
            )}
          />
        </span>
      </span>
    </TableHead>
  );
}
