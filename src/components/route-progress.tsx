"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 라우트 변경 시 화면 상단에 얇은 진행 바를 보여줍니다.
 * - pathname이 바뀌면 즉시 0→70% 빠르게 채우고
 * - 렌더링 완료 후 100%로 마무리, 잠시 후 숨깁니다.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // 새 경로 도착 → 0→80% 빠르게
    clear();
    setVisible(true);
    setProgress(0);

    timerRef.current = setTimeout(() => setProgress(80), 10);

    // 렌더링 여유 후 100% 완성 → 페이드아웃
    timerRef.current = setTimeout(() => {
      setProgress(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 400);

    return clear;
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-[9999] h-[2px] w-full">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
