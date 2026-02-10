"use client";

import { cn } from "@/lib/utils";

interface FilterChipsProps {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  variant?: "filled" | "outline";
}

export function FilterChips({ options, selected, onSelect, variant = "filled" }: FilterChipsProps) {
  const activeClass =
    variant === "outline"
      ? "border-amber-400 bg-amber-400/10 text-amber-400"
      : "bg-primary text-primary-foreground";

  const inactiveClass =
    variant === "outline"
      ? "border-border bg-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      : "bg-secondary text-muted-foreground hover:text-foreground";

  const baseClass =
    variant === "outline"
      ? "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
      : "rounded-full px-3 py-1.5 text-xs font-medium transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(baseClass, selected === null ? activeClass : inactiveClass)}
      >
        전체
      </button>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(selected === option ? null : option)}
          className={cn(baseClass, selected === option ? activeClass : inactiveClass)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
