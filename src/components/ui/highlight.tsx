import { memo } from "react";

interface HighlightProps {
  text: string;
  query: string;
}

/**
 * 검색어와 일치하는 텍스트 부분을 강조 표시.
 * query가 비어 있으면 text를 그대로 렌더링한다.
 */
export const Highlight = memo(function Highlight({ text, query }: HighlightProps) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  // 정규표현식 특수문자 이스케이프
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) return <>{text}</>;

  const lower = trimmed.toLowerCase();

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <span key={i} className="font-bold text-primary">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
});
