"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookmarkPlus,
  BookmarkCheck,
  PlusCircle,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortfolio } from "@/context/portfolio-context";

interface SearchResult {
  ticker: string;
  name: string;
  marketType: string;
}

function MarketBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    ETF: "bg-blue-500/15 text-blue-400",
    KOSPI: "bg-emerald-500/15 text-emerald-400",
    KOSDAQ: "bg-violet-500/15 text-violet-400",
  };
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
        styles[type] ?? "bg-secondary text-muted-foreground"
      )}
    >
      {type}
    </span>
  );
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const { addItem, hasTicker, addToWatchlist, isWatched } = usePortfolio();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 열릴 때 input 포커스 + 상태 초기화
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
      setResults([]);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // 검색 실행 (debounced)
  const search = useCallback((q: string) => {
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((data: { results: SearchResult[] }) => setResults(data.results ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const handleNavigate = (ticker: string) => {
    router.push(`/etf/${ticker}`);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-16 z-50 w-full max-w-lg -translate-x-1/2 px-4">
        <div
          className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="종목명 또는 티커 검색 (예: 삼성전자, 005930)"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            )}
            {!loading && query && (
              <button
                onClick={handleClear}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Result list */}
          {!loading && results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r) => {
                const inPortfolio = hasTicker(r.ticker);
                const watched = isWatched(r.ticker);
                return (
                  <li
                    key={r.ticker}
                    onClick={() => handleNavigate(r.ticker)}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/50"
                  >
                    <MarketBadge type={r.marketType} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {r.ticker}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 관심 종목 */}
                      <button
                        title={watched ? "관심 종목에서 제거" : "관심 종목 추가"}
                        onClick={() => addToWatchlist(r.ticker)}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-background",
                          watched
                            ? "text-amber-400"
                            : "text-muted-foreground hover:text-amber-400"
                        )}
                      >
                        {watched ? (
                          <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                          <BookmarkPlus className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* 포트폴리오 */}
                      <button
                        title={inPortfolio ? "포트폴리오에 있음" : "포트폴리오에 추가"}
                        onClick={() => {
                          if (!inPortfolio) addItem(r.ticker);
                        }}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-background",
                          inPortfolio
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        {inPortfolio ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <PlusCircle className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* No results */}
          {!loading && results.length === 0 && query.length >= 1 && (
            <p className="px-4 py-4 text-center text-xs text-muted-foreground">
              &apos;{query}&apos;에 해당하는 종목이 없습니다
            </p>
          )}

          {/* Empty hint */}
          {!loading && query.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                KOSPI · KOSDAQ · ETF 전 종목 검색
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">
                검색 결과 클릭 시 상세 페이지로 이동 ·
                <BookmarkPlus className="mx-0.5 mb-0.5 inline h-3 w-3" /> 관심 종목 ·
                <PlusCircle className="mx-0.5 mb-0.5 inline h-3 w-3" /> 포트폴리오
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
