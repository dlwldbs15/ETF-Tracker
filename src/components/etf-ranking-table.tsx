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
import { Etf } from "@/types/etf";
import { usePortfolio } from "@/context/portfolio-context";
import {
  formatKRW,
  formatChangeRate,
  formatVolume,
  formatMarketCap,
  formatExpenseRatio,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "price" | "changeRate" | "marketCap" | "volume" | "expenseRatio" | "dividendYield";
type SortDir = "asc" | "desc";

interface EtfRankingTableProps {
  data: Etf[];
}

export function EtfRankingTable({ data }: EtfRankingTableProps) {
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
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
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
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="w-12 text-muted-foreground">순위</TableHead>
          <TableHead className="text-muted-foreground">종목명</TableHead>
          <TableHead className="text-muted-foreground">티커</TableHead>
          <SortableHead label="현재가" sortKey="price" currentKey={sortKey} dir={sortDir} onSort={handleSort} align="right" />
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
                {etf.name}
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {etf.ticker}
              </TableCell>
              <TableCell className="text-right font-mono text-foreground">
                {formatKRW(etf.price)}
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
                {formatExpenseRatio(etf.expenseRatio)}
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
