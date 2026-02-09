"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Plus, Check } from "lucide-react";
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

interface EtfRankingTableProps {
  data: Etf[];
}

export function EtfRankingTable({ data }: EtfRankingTableProps) {
  const router = useRouter();
  const { addItem, hasTicker } = usePortfolio();

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
          <TableHead className="text-right text-muted-foreground">현재가</TableHead>
          <TableHead className="text-right text-muted-foreground">등락률</TableHead>
          <TableHead className="text-right text-muted-foreground">시가총액</TableHead>
          <TableHead className="text-right text-muted-foreground">거래량</TableHead>
          <TableHead className="text-right text-muted-foreground">총보수</TableHead>
          <TableHead className="text-muted-foreground">카테고리</TableHead>
          <TableHead className="w-16 text-center text-muted-foreground">담기</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((etf, index) => {
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
                  variant={inPortfolio ? "ghost" : "ghost"}
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
