/**
 * 네이버 증권 배당 정보 스크래퍼 (서버사이드 전용)
 */

export interface DividendInfo {
  dividendYield: number;
  dividendCycle: string;
  lastDividendAmount: number;
}

const DEFAULT_DIVIDEND: DividendInfo = {
  dividendYield: 0,
  dividendCycle: "미지급",
  lastDividendAmount: 0,
};

/**
 * 네이버 증권에서 배당 정보를 스크래핑합니다.
 * 실패 시 기본값을 반환합니다.
 */
export async function scrapeDividendInfo(
  ticker: string
): Promise<DividendInfo> {
  try {
    const url = `https://finance.naver.com/item/main.naver?code=${ticker}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) return DEFAULT_DIVIDEND;

    const html = await res.text();

    // 배당수익률: <em id="_dvr">0.88</em>
    const yieldMatch = html.match(/<em id="_dvr">([\d.]+)<\/em>/);
    const dividendYield = yieldMatch ? parseFloat(yieldMatch[1]) : 0;

    // 주당배당금: "주당배당금(원)</strong></th>" 다음 <td> 내 텍스트 노드
    const dpsMatch = html.match(
      /주당배당금[^<]*<\/strong><\/th>[\s\S]{0,400}?<td[^>]*>\s*\n?\s*([\d,]+)\s*\n/
    );
    const lastDividendAmount = dpsMatch
      ? parseInt(dpsMatch[1].replace(/,/g, ""), 10)
      : 0;

    // 배당주기 추정: 네이버에서 직접 제공하지 않으므로 기본 "연배당"
    const dividendCycle = dividendYield > 0 ? "연배당" : "미지급";

    return { dividendYield, dividendCycle, lastDividendAmount };
  } catch {
    return DEFAULT_DIVIDEND;
  }
}
