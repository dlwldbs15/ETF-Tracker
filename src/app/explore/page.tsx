"use client";

import { Header } from "@/components/layout/header";
import { useShell } from "@/components/layout/shell";

export default function ExplorePage() {
  const { openSidebar } = useShell();

  return (
    <>
      <Header title="ETF 탐색" description="다양한 ETF를 검색하고 비교하세요" onMenuClick={openSidebar} />
      <div className="p-4 sm:p-6">
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">ETF 탐색 기능이 곧 추가됩니다</p>
        </div>
      </div>
    </>
  );
}
