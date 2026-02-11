"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Briefcase, CalendarDays, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/explore", label: "종목 탐색", icon: Search },
  { href: "/portfolio", label: "내 포트폴리오", icon: Briefcase },
  { href: "/dividend-calendar", label: "배당 캘린더", icon: CalendarDays },
];

/** Desktop sidebar — lg 이상에서만 표시 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-60 flex-col border-r border-border bg-[hsl(var(--sidebar))] lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--sidebar-active))]" />
          <span className="text-lg font-bold text-foreground">InvestBoard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--sidebar-active))/0.1] text-[hsl(var(--sidebar-active))]"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">InvestBoard v1.0</p>
      </div>
    </aside>
  );
}

/** Mobile drawer — 왼쪽에서 슬라이드 인 */
interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-border bg-[hsl(var(--sidebar))] transition-transform duration-200 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--sidebar-active))]" />
            <span className="text-lg font-bold text-foreground">InvestBoard</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--sidebar-active))/0.1] text-[hsl(var(--sidebar-active))]"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">InvestBoard v1.0</p>
        </div>
      </aside>
    </>
  );
}
