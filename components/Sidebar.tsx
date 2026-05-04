"use client";

import {
  Home as HomeIcon,
  Plus,
  List,
  BarChart3,
  QrCode,
  LogOut,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  adminName: string;
  activitiesCount: number;
  pendingCount: number;
  onLogout: () => void;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

export default function Sidebar({
  activeTab,
  onNavigate,
  isAdmin,
  adminName,
  activitiesCount,
  pendingCount,
  onLogout,
  collapsed,
  onCollapse,
}: SidebarProps) {
  const navItems = [
    { tab: "overview", icon: HomeIcon, label: "Tổng quan" },
    ...(isAdmin
      ? [
          {
            tab: "add",
            icon: Plus,
            label: "Thêm mới",
            badge: undefined as number | undefined,
          },
        ]
      : []),
    { tab: "list", icon: List, label: "Hoạt động", badge: activitiesCount },
    {
      tab: "summary",
      icon: BarChart3,
      label: "Công nợ",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { tab: "qr", icon: QrCode, label: "QR Code" },
  ];

  return (
    <TooltipProvider delay={200}>
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border sidebar-transition overflow-hidden",
          collapsed ? "w-[60px]" : "w-56",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-14 shrink-0 border-b border-sidebar-border px-3",
            collapsed ? "justify-center" : "gap-2.5",
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-sidebar-primary rounded-lg shrink-0">
            <BarChart3 className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-sidebar-foreground leading-none truncate">
                Chia Tiền
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">
                Nhóm
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-3 space-y-0.5",
            collapsed ? "px-1" : "px-2",
          )}
        >
          {navItems.map(({ tab, icon: Icon, label, badge }) => {
            const isActive = activeTab === tab;
            const button = (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg font-medium text-sm transition-colors w-full",
                  collapsed ? "h-9 justify-center px-0" : "px-3 py-2",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
                aria-label={label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1 text-left">{label}</span>
                )}
                {!collapsed && badge !== undefined && badge > 0 && (
                  <Badge
                    variant={isActive ? "outline" : "secondary"}
                    className={cn(
                      "text-[10px] px-1.5 h-4",
                      isActive &&
                        "border-sidebar-primary-foreground/50 text-sidebar-primary-foreground",
                    )}
                  >
                    {badge}
                  </Badge>
                )}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={tab}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => onNavigate(tab)}
                        className={cn(
                          "flex items-center justify-center h-9 w-full rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                        aria-label={label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    }
                  />
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-2"
                  >
                    {label}
                    {badge !== undefined && badge > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 h-4"
                      >
                        {badge}
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* Footer */}
        <div className={cn("pb-3 shrink-0", collapsed ? "px-1" : "px-2")}>
          <Separator className="mb-3 bg-sidebar-border" />

          {/* User info */}
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <div className="w-6 h-6 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                {isAdmin ? (
                  <Shield className="w-3 h-3 text-sidebar-primary" />
                ) : (
                  <Eye className="w-3 h-3 text-sidebar-foreground/50" />
                )}
              </div>
              <span className="text-xs font-medium text-sidebar-foreground/80 truncate">
                {isAdmin ? adminName : "Chế độ xem"}
              </span>
            </div>
          )}

          {/* Logout */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    aria-label="Đăng xuất"
                    className="w-full h-9 hover:text-destructive hover:bg-destructive/10 justify-center px-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                }
              />
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full h-9 justify-start gap-2.5 px-3 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Đăng xuất</span>
            </Button>
          )}

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapse(!collapsed)}
            className="w-full h-8 mt-1 justify-center px-0 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
