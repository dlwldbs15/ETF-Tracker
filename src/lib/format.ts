const krwFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("ko-KR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 원화 포맷 (예: ₩12,300) */
export function formatKRW(value: number): string {
  return krwFormatter.format(value);
}

/** 시가총액 축약 포맷 (예: 5.8조, 9,870억) */
export function formatMarketCap(value: number): string {
  if (value >= 1_0000_0000_0000) {
    return `${(value / 1_0000_0000_0000).toFixed(1)}조`;
  }
  if (value >= 1_0000_0000) {
    return `${compactFormatter.format(value / 1_0000_0000)}억`;
  }
  return formatKRW(value);
}

/** 거래량 축약 포맷 (예: 1,234만) */
export function formatVolume(value: number): string {
  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
  }
  return value.toLocaleString("ko-KR");
}

/** 등락률 포맷 (예: +1.23%) */
export function formatChangeRate(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** 보수율 포맷 (예: 0.15%) */
export function formatExpenseRatio(value: number): string {
  return `${value.toFixed(value < 0.1 ? 3 : 2)}%`;
}
