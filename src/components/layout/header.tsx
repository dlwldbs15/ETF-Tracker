"use client";

import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShell } from "@/components/layout/shell";

interface HeaderProps {
  title: string;
  description?: string;
  onMenuClick: () => void;
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  const { openSearch } = useShell();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-muted-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold text-foreground sm:text-lg">{title}</h1>
          {description && (
            <p className="hidden text-sm text-muted-foreground sm:block">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={openSearch}
          className="text-muted-foreground hover:text-foreground"
          title="종목 검색 (전체)"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
