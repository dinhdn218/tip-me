"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Wallet,
  Shield,
  Eye,
  LogOut,
  Moon,
  Sun,
  X,
  CheckCircle,
} from "lucide-react";
import { Activity } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ExportButton from "@/components/ExportButton";

interface TopBarProps {
  isAdmin: boolean;
  adminName: string;
  isConnected: boolean;
  activities: Activity[];
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNavigate: (tab: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const roundUpK = (n: number) => Math.ceil(n / 1000) * 1000;

export default function TopBar({
  isAdmin,
  adminName,
  isConnected,
  activities,
  onLogout,
  searchQuery,
  onSearchChange,
  onNavigate,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Per-person outstanding debt
  const debtMap = new Map<string, number>();
  activities.forEach((a) =>
    a.participants.forEach((p) => {
      if (!p.paid)
        debtMap.set(p.name, (debtMap.get(p.name) ?? 0) + a.amountPerPerson);
    }),
  );
  const debtors = Array.from(debtMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  const pendingCount = debtors.length;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-all duration-200 ${
        scrolled ? "glass-2 shadow-sm" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-2">
        {/* Brand */}
        <button
          onClick={() => onNavigate("overview")}
          className="flex items-center gap-2.5 shrink-0"
          aria-label="Trang chủ"
        >
          <span className="w-9 h-9 rounded-2xl bg-brand-gradient flex items-center justify-center ring-brand">
            <Wallet className="w-5 h-5 text-white" />
          </span>
          <span className="hidden sm:block text-left leading-none">
            <span className="block text-base font-extrabold text-brand-gradient">
              Chia Tiền
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              Quản lý chi tiêu nhóm
            </span>
          </span>
        </button>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          {searchOpen || searchQuery ? (
            <div className="relative w-44 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={() => !searchQuery && setSearchOpen(false)}
                placeholder="Tìm hoạt động, người..."
                className="pl-8 pr-7 h-9 rounded-full bg-card/80 backdrop-blur border-border/60 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-full bg-card/60 backdrop-blur"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="h-9 w-9 rounded-full bg-card/60 backdrop-blur"
          aria-label={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="relative h-9 w-9 inline-flex items-center justify-center rounded-full bg-card/60 backdrop-blur hover:bg-card transition-colors"
                aria-label="Thông báo công nợ"
              >
                <Bell className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-debt text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>
            }
          />
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-72"
          >
            <div className="px-2 py-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Công nợ chưa thu
              </span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold text-debt">
                  {pendingCount} người
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            {debtors.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-5 px-3 text-center">
                <CheckCircle className="w-7 h-7 text-credit" />
                <p className="text-xs text-muted-foreground">
                  Tất cả đã thanh toán! 🎉
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {debtors.slice(0, 8).map(({ name, amount }) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => onNavigate("summary")}
                    className="gap-2.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-debt-bg flex items-center justify-center text-debt text-xs font-bold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">
                      {name}
                    </span>
                    <span className="text-xs font-bold text-debt shrink-0">
                      {roundUpK(amount).toLocaleString("vi-VN")}đ
                    </span>
                  </DropdownMenuItem>
                ))}
                {debtors.length > 8 && (
                  <DropdownMenuItem
                    onClick={() => onNavigate("summary")}
                    className="justify-center text-xs text-muted-foreground cursor-pointer"
                  >
                    +{debtors.length - 8} người khác · Xem tất cả
                  </DropdownMenuItem>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export (sm+) */}
        <div className="hidden sm:block">
          <ExportButton activities={activities} />
        </div>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-brand-gradient text-white text-xs font-bold ring-brand shrink-0"
                aria-label="Tài khoản"
              >
                {isAdmin ? (
                  adminName?.charAt(0).toUpperCase() || "A"
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
          <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
            <DropdownMenuItem
              className="text-xs text-muted-foreground gap-2"
              disabled
            >
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              {isAdmin ? `Admin: ${adminName}` : "Chế độ xem"}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs" disabled>
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-credit" : "bg-destructive"}`}
              />
              {isConnected ? "Đã kết nối" : "Mất kết nối"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
