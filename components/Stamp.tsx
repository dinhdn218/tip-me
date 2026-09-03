"use client";

import { cn } from "@/lib/utils";

/**
 * Con dấu trạng thái. Phân biệt bằng 3 tầng, không chỉ màu:
 * chữ (ĐÃ TRẢ ✓ / CHƯA TRẢ) · viền liền vs. gạch · màu settled vs. stamp.
 */
interface StampProps {
  paid: boolean;
  /** Admin tick được → render <button>; viewer → <div> (ẩn affordance, không disable) */
  onTick?: () => void;
  ariaLabel?: string;
  /** Vừa đổi trạng thái → chạy animation dập dấu */
  justStamped?: boolean;
  className?: string;
}

export default function Stamp({
  paid,
  onTick,
  ariaLabel,
  justStamped,
  className,
}: StampProps) {
  const text = paid ? "ĐÃ TRẢ ✓" : "CHƯA TRẢ";
  const shape = cn(
    "inline-grid place-items-center rounded-ctl font-mono text-[10px] tracking-[0.08em]",
    "px-2 py-1 -rotate-3 select-none",
    paid ? "stamp-paid" : "stamp-unpaid",
    justStamped && "anim-stamp",
    className,
  );

  if (onTick) {
    return (
      <button
        type="button"
        onClick={onTick}
        aria-label={ariaLabel}
        className={cn(shape, "min-w-[92px] min-h-[44px] cursor-pointer")}
      >
        {text}
      </button>
    );
  }

  return (
    <span className={cn(shape, "min-w-[92px] min-h-[32px]")}>{text}</span>
  );
}
