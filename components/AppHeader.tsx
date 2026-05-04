"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Zap, Shield, Eye, LogOut } from "lucide-react";
import { Activity } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ExportButton from "@/components/ExportButton";

interface AppHeaderProps {
  isAdmin: boolean;
  adminName: string;
  isConnected: boolean;
  activities: Activity[];
  onLogout: () => void;
  onQuickAdd: () => void;
  sidebarCollapsed: boolean;
}

export default function AppHeader({
  isAdmin,
  adminName,
  isConnected,
  activities,
  onLogout,
  onQuickAdd,
  sidebarCollapsed,
}: AppHeaderProps) {
  const pendingCount = activities.reduce(
    (n, a) => n + a.participants.filter((p) => !p.paid).length,
    0,
  );

  const leftOffset = sidebarCollapsed ? 60 : 224;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass fixed top-0 right-0 z-30 h-14 flex items-center px-4 gap-3 transition-shadow duration-200${scrolled ? " shadow-md" : ""}`}
      style={{ left: leftOffset }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm..."
          className="pl-8 h-8 rounded-full bg-muted/60 border-transparent focus:border-border text-sm"
          readOnly
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Connection dot */}
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? "bg-emerald-500" : "bg-destructive"}`}
          title={isConnected ? "Online" : "Offline"}
        />

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </Button>

        {/* Quick-add — admin only, md+ */}
        {isAdmin && (
          <Button
            size="sm"
            onClick={onQuickAdd}
            className="hidden md:flex gap-1.5 h-8 text-xs font-semibold"
          >
            <Zap className="w-3.5 h-3.5" /> Thêm nhanh
          </Button>
        )}

        {/* Export */}
        <div className="hidden md:block">
          <ExportButton activities={activities} />
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-accent transition-colors text-xs font-semibold">
                {isAdmin ? (
                  <Shield className="w-3 h-3 text-primary" />
                ) : (
                  <Eye className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="hidden sm:inline">
                  {isAdmin ? adminName : "Xem"}
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
            <DropdownMenuItem
              className="text-xs text-muted-foreground"
              disabled
            >
              {isAdmin ? `Admin: ${adminName}` : "Chế độ xem"}
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
