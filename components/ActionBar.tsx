"use client";

import { cn } from "@/lib/utils";

interface ActionBarProps {
  label: string;
  onClick: () => void;
  /** Đăng nhập quản trị dùng nút viền, không nền đặc */
  variant?: "primary" | "outline";
  /** Ở desktop nút nằm trong cột Sổ, không fixed */
  inline?: boolean;
}

export default function ActionBar({
  label,
  onClick,
  variant = "primary",
  inline = false,
}: ActionBarProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full min-h-[52px] rounded-ctl font-mono text-[13px] tracking-[0.1em]",
        "transition-opacity hover:opacity-90",
        variant === "primary"
          ? "bg-ink text-on-ink"
          : "bg-transparent border border-ink text-ink",
      )}
    >
      {label}
    </button>
  );

  if (inline) return button;

  return (
    <div className="flex-none border-t border-rule-strong bg-paper px-5 pt-2.5 pb-safe no-print">
      <div className="mx-auto w-full max-w-[560px]">{button}</div>
    </div>
  );
}
