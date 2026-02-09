"use client";

import { cn } from "@/lib/utils";

interface FilterChipsProps {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          selected === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        )}
      >
        전체
      </button>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(selected === option ? null : option)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            selected === option
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
