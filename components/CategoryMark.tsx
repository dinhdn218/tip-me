"use client";

import { ActivityCategory, CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Chữ ký danh mục — ô vuông 1px với 2 ký tự mono.
 * Thay emoji: không phụ thuộc font emoji của OS, hiển thị y hệt trên mọi máy.
 */
export const CATEGORY_MARKS: Record<ActivityCategory, string> = {
  dining: "ĂU",
  travel: "DL",
  bills: "HĐ",
  entertainment: "GT",
  groceries: "MS",
  other: "KH",
};

export function markOf(category?: ActivityCategory): string {
  return CATEGORY_MARKS[(category ?? "other") as ActivityCategory];
}

export function labelOf(category?: ActivityCategory): string {
  return CATEGORY_LABELS[(category ?? "other") as ActivityCategory];
}

interface CategoryMarkProps {
  category?: ActivityCategory;
  /** 28px mặc định; 30px cho dòng biên lai, 32px cho header sheet */
  size?: 28 | 30 | 32;
  className?: string;
}

export default function CategoryMark({
  category,
  size = 28,
  className,
}: CategoryMarkProps) {
  return (
    <span
      title={labelOf(category)}
      className={cn(
        "grid place-items-center shrink-0 border border-rule-strong rounded-ctl",
        "font-mono font-semibold text-ink",
        size === 32 ? "text-[11px]" : "text-[10px]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {markOf(category)}
    </span>
  );
}
