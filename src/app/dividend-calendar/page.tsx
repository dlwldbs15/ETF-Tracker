"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { CalendarDays, Coins, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { useShell } from "@/components/layout/shell";
import { usePortfolio } from "@/context/portfolio-context";
import { mockEtfs } from "@/lib/mock-data";
import { formatKRW } from "@/lib/format";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

/** 배당 주기에 따라 배당이 발생하는 월(0-indexed) 목록을 반환 */
function getDividendMonths(cycle: string): number[] {
  switch (cycle) {
    case "월배당":
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case "분기배당":
      return [2, 5, 8, 11]; // 3, 6, 9, 12월
    case "연배당":
      return [11]; // 12월
    default:
      return [];
  }
}

interface MonthlyData {
  month: string;
  amount: number;
  monthIndex: number;
}

interface DividendEtfEntry {
  ticker: string;
  name: string;
  amount: number;
}

export default function DividendCalendarPage() {
  const { openSidebar } = useShell();
  const { items } = usePortfolio();

  const currentMonth = new Date().getMonth(); // 0-indexed

  // 포트폴리오에 담긴 ETF 중 배당이 있는 것만
  const portfolioEtfs = useMemo(() => {
    return items
      .map((item) => {
        const etf = mockEtfs.find((e) => e.ticker === item.ticker);
        if (!etf || etf.dividendCycle === "미지급" || etf.dividendYield === 0) return null;
        return { ...etf, quantity: item.quantity };
      })
      .filter(Boolean) as (typeof mockEtfs[number] & { quantity: number })[];
  }, [items]);

  // 월별 배당금 합산
  const monthlyData: MonthlyData[] = useMemo(() => {
    const totals = new Array(12).fill(0);

    for (const etf of portfolioEtfs) {
      const months = getDividendMonths(etf.dividendCycle);
      if (months.length === 0) continue;

      const investAmount = etf.price * etf.quantity;
      const annualDividend = investAmount * (etf.dividendYield / 100);
      const perPayment = annualDividend / months.length;

      for (const m of months) {
        totals[m] += perPayment;
      }
    }

    return totals.map((amount, i) => ({
      month: MONTH_LABELS[i],
      amount: Math.round(amount),
      monthIndex: i,
    }));
  }, [portfolioEtfs]);

  // 연간 총 배당금, 월평균
  const annualTotal = useMemo(
    () => monthlyData.reduce((sum, d) => sum + d.amount, 0),
    [monthlyData]
  );
  const monthlyAverage = Math.round(annualTotal / 12);

  // 이번 달 배당 ETF 목록
  const thisMonthEtfs: DividendEtfEntry[] = useMemo(() => {
    return portfolioEtfs
      .filter((etf) => {
        const months = getDividendMonths(etf.dividendCycle);
        return months.includes(currentMonth);
      })
      .map((etf) => {
        const months = getDividendMonths(etf.dividendCycle);
        const investAmount = etf.price * etf.quantity;
        const annualDividend = investAmount * (etf.dividendYield / 100);
        const perPayment = annualDividend / months.length;
        return {
          ticker: etf.ticker,
          name: etf.name,
          amount: Math.round(perPayment),
        };
      })
      .filter((e) => e.amount > 0);
  }, [portfolioEtfs, currentMonth]);

  const hasPortfolio = items.length > 0;
  const hasDividendEtfs = portfolioEtfs.length > 0;

  return (
    <>
      <Header
        title="배당 캘린더"
        description="포트폴리오 월별 예상 배당금을 확인하세요"
        onMenuClick={openSidebar}
      />
      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-medium">연간 총 배당금</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatKRW(annualTotal)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">월평균 배당금</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatKRW(monthlyAverage)}
            </p>
          </div>
        </div>

        {/* 바 차트 */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            월별 예상 배당금
          </h2>
          {!hasPortfolio ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              포트폴리오에 ETF를 담아주세요
            </div>
          ) : !hasDividendEtfs ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              배당이 있는 ETF가 포트폴리오에 없습니다
            </div>
          ) : (
            <div className="h-[240px] w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(217 33% 17%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                    axisLine={{ stroke: "hsl(217 33% 17%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 10000
                        ? `${Math.round(v / 10000)}만`
                        : v.toLocaleString("ko-KR")
                    }
                    width={52}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(217 33% 17% / 0.3)" }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {monthlyData.map((entry) => (
                      <Cell
                        key={entry.month}
                        fill={
                          entry.monthIndex === currentMonth
                            ? "hsl(45 93% 58%)"  // amber - 이번 달 강조
                            : entry.amount > 0
                              ? "hsl(160 60% 45%)" // emerald
                              : "hsl(217 33% 20%)" // muted
                        }
                        fillOpacity={entry.monthIndex === currentMonth ? 1 : 0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 이번 달 배당 ETF */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-foreground">
              {MONTH_LABELS[currentMonth]} 배당 예정
            </h2>
          </div>

          {thisMonthEtfs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {!hasPortfolio
                ? "포트폴리오에 ETF를 담아주세요"
                : "이번 달 배당 예정인 ETF가 없습니다"}
            </p>
          ) : (
            <div className="space-y-2">
              {thisMonthEtfs.map((etf) => (
                <div
                  key={etf.ticker}
                  className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{etf.name}</p>
                    <p className="text-xs text-muted-foreground">{etf.ticker}</p>
                  </div>
                  <p className="text-sm font-semibold text-amber-400">
                    {formatKRW(etf.amount)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-medium text-muted-foreground">이번 달 합계</span>
                <span className="text-sm font-bold text-foreground">
                  {formatKRW(monthlyData[currentMonth].amount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">
        {formatKRW(payload[0].value)}
      </p>
    </div>
  );
}
