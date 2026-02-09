"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { EtfRankingTable } from "@/components/etf-ranking-table";
import { FilterChips } from "@/components/filter-chips";
import { useShell } from "@/components/layout/shell";
import { mockEtfs, providers } from "@/lib/mock-data";

export default function Home() {
  const { openSidebar } = useShell();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const filteredEtfs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockEtfs.filter((etf) => {
      const matchesSearch =
        query === "" ||
        etf.ticker.toLowerCase().includes(query) ||
        etf.name.toLowerCase().includes(query);

      const matchesProvider =
        selectedProvider === null || etf.provider === selectedProvider;

      return matchesSearch && matchesProvider;
    });
  }, [searchQuery, selectedProvider]);

  return (
    <>
      <Header
        title="대시보드"
        description="ETF 시장 현황을 한눈에 확인하세요"
        onMenuClick={openSidebar}
      />
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          <SummaryCard label="KOSPI" value="2,687.45" change="+1.23%" positive />
          <SummaryCard label="KOSDAQ" value="872.31" change="-0.45%" positive={false} />
          <SummaryCard label="S&P 500" value="5,234.18" change="+0.67%" positive />
        </div>

        {/* ETF Ranking Table */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-foreground">
              ETF 수익률 순위
            </h2>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="티커 또는 종목명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Filter Chips - scrollable on mobile */}
          <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:-mx-0 sm:px-0">
            <FilterChips
              options={providers}
              selected={selectedProvider}
              onSelect={setSelectedProvider}
            />
          </div>

          {/* Result Count */}
          <p className="mb-3 text-xs text-muted-foreground">
            총 {filteredEtfs.length}개 종목
          </p>

          {/* Table with horizontal scroll on mobile */}
          <div className="-mx-4 overflow-x-auto sm:-mx-5">
            <div className="min-w-[700px] px-4 sm:px-5">
              <EtfRankingTable data={filteredEtfs} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{value}</p>
      <p
        className={`mt-1 text-xs font-medium sm:text-sm ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
