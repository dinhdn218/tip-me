"use client";

import { cn } from "@/lib/utils";

interface AppHeaderProps {
  count: number;
  isAdmin: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenMenu: () => void;
  tab: "so" | "hd";
  onTab: (tab: "so" | "hd") => void;
}

export default function AppHeader({
  count,
  isAdmin,
  theme,
  onToggleTheme,
  onOpenMenu,
  tab,
  onTab,
}: AppHeaderProps) {
  const iconBtn =
    "w-10 h-10 grid place-items-center border border-rule rounded-ctl " +
    "text-ink-2 hover:border-ink transition-colors";

  const tabBtn = (key: "so" | "hd", label: string) => (
    <button
      type="button"
      onClick={() => onTab(key)}
      aria-current={tab === key ? "page" : undefined}
      className={cn(
        "py-3 text-center font-mono text-[12px] tracking-[0.14em] -mb-px min-h-11",
        tab === key
          ? "text-ink border-b-2 border-ink"
          : "text-ink-3 border-b border-transparent hover:text-ink-2",
      )}
    >
      {label}
    </button>
  );

  return (
    <header className="flex-none bg-paper">
      <div className="mx-auto w-full max-w-[560px] lg:max-w-none flex items-center justify-between px-5 pt-3.5 pb-3">
        <div>
          <div className="font-mono text-[13px] font-semibold tracking-[0.12em]">
            SỔ CHUNG
          </div>
          <div className="font-mono text-eyebrow text-ink-3 mt-[3px]">
            {count} khoản{isAdmin ? " · QUẢN TRỊ" : ""}
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Đổi giao diện sáng tối"
            className={iconBtn}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Mở sổ tay"
            className={cn(iconBtn, "text-base")}
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Segmented control — ẩn ở desktop, nơi hai cột hiện cùng lúc */}
      <div className="border-b border-rule-strong lg:hidden">
        <div className="mx-auto w-full max-w-[560px] grid grid-cols-2">
          {tabBtn("so", "SỔ")}
          {tabBtn("hd", "HOẠT ĐỘNG")}
        </div>
      </div>
      <div className="hidden lg:block border-b border-rule-strong" />
    </header>
  );
}
