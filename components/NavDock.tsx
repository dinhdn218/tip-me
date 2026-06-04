"use client";

import { Home as HomeIcon, List, BarChart3, QrCode, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavDockProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  onQuickAdd: () => void;
  activitiesCount: number;
  pendingCount: number;
}

export default function NavDock({
  activeTab,
  onNavigate,
  isAdmin,
  onQuickAdd,
  activitiesCount,
  pendingCount,
}: NavDockProps) {
  const items = [
    { tab: "overview", icon: HomeIcon, label: "Tổng quan", badge: 0 },
    { tab: "list", icon: List, label: "Danh sách", badge: activitiesCount },
    { tab: "summary", icon: BarChart3, label: "Công nợ", badge: pendingCount },
    { tab: "qr", icon: QrCode, label: "QR", badge: 0 },
  ];

  // Split items around the central FAB (2 left, 2 right)
  const left = items.slice(0, 2);
  const right = items.slice(2);

  const renderItem = ({
    tab,
    icon: Icon,
    label,
    badge,
  }: (typeof items)[number]) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => onNavigate(tab)}
        aria-label={label}
        className={cn(
          "relative flex items-center gap-1.5 h-11 rounded-full font-semibold text-sm transition-all duration-300",
          isActive
            ? "bg-brand-gradient text-white px-4 shadow-md"
            : "text-muted-foreground hover:text-foreground px-3",
        )}
      >
        <span className="relative">
          <Icon className="w-5 h-5 shrink-0" />
          {!isActive && badge > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 px-1 bg-debt text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </span>
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-300",
            isActive ? "max-w-[90px] opacity-100" : "max-w-0 opacity-0",
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pb-safe">
      <div className="dock flex items-center gap-0.5 p-1.5 rounded-full">
        {left.map(renderItem)}

        {/* Central quick-add FAB (admin only) */}
        {isAdmin && (
          <button
            onClick={onQuickAdd}
            aria-label="Thêm nhanh chi phí"
            className="mx-1 w-12 h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-lg ring-brand shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {right.map(renderItem)}
      </div>
    </nav>
  );
}
