"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Activity, CATEGORY_ICONS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  ChevronRight,
  BarChart3,
  Wallet,
  Zap,
  Trophy,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const counter = useRef({ n: 0 });

  useGSAP(
    () => {
      counter.current.n = 0;
      gsap.to(counter.current, {
        n: value,
        duration: 1.4,
        ease: "power3.out",
        onUpdate() {
          if (el.current)
            el.current.textContent = Math.round(
              counter.current.n,
            ).toLocaleString("vi-VN");
        },
      });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={el} className={className}>
      0
    </span>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface OverviewProps {
  activities: Activity[];
  isAdmin?: boolean;
  onNavigate?: (tab: string) => void;
  onQuickAdd?: () => void;
}

export default function Overview({
  activities,
  isAdmin = false,
  onNavigate,
  onQuickAdd,
}: OverviewProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Computed ────────────────────────────────────────────────────────────────
  const totalSpent = activities.reduce((s, a) => s + a.totalAmount, 0);
  const totalPaid = activities.reduce(
    (s, a) =>
      s +
      a.participants
        .filter((p) => p.paid)
        .reduce(
          (sum, p) => sum + (p.shareAmount ?? a.amountPerPerson),
          0,
        ),
    0,
  );
  const totalUnpaid = totalSpent - totalPaid;
  const progressPct = totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0;

  // Circle SVG: r=16 → circumference ≈ 100.5
  const R = 16;
  const C = 2 * Math.PI * R;

  const roundUpK = (n: number) => Math.ceil(Math.round(n) / 1000) * 1000;

  // Per-person debt map
  const personMap = new Map<string, { paid: number; total: number }>();
  activities.forEach((a) =>
    a.participants.forEach((p) => {
      const share = p.shareAmount ?? a.amountPerPerson;
      const c = personMap.get(p.name) ?? { paid: 0, total: 0 };
      personMap.set(p.name, {
        total: c.total + share,
        paid: c.paid + (p.paid ? share : 0),
      });
    }),
  );
  const persons = Array.from(personMap.entries()).sort(
    (a, b) => b[1].total - b[1].paid - (a[1].total - a[1].paid),
  );
  // Top 5 debtors (most owed, unpaid first)
  const topDebtors = persons
    .filter(([, v]) => v.total - v.paid > 0)
    .slice(0, 5);
  const paidPersons = persons.filter(([, v]) => v.paid >= v.total).length;

  const recentActivities = activities.slice(0, 4);

  // ── GSAP stagger reveal ─────────────────────────────────────────────────────
  useGSAP(
    () => {
      gsap.from(".bento-card", {
        y: 22,
        opacity: 0,
        duration: 0.55,
        stagger: { amount: 0.35 },
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    },
    { scope: gridRef },
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <Wallet className="w-9 h-9 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Chưa có hoạt động nào
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Thêm hoạt động đầu tiên để bắt đầu theo dõi chi phí nhóm
        </p>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={onQuickAdd} className="gap-2">
              <Zap className="w-4 h-4" /> Thêm nhanh
            </Button>
            <Button
              onClick={() => onNavigate?.("add")}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm hoạt động
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div ref={gridRef} className="grid grid-cols-12 gap-3 sm:gap-4">
      {/* ── Hero Balance ──────────────────────────────────────────────────── */}
      <Card className="bento-card col-span-12 lg:col-span-8 bg-primary text-primary-foreground border-0 overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-20 -bottom-6 w-36 h-36 rounded-full bg-white/[0.06] blur-2xl" />
        </div>

        <CardContent className="p-5 sm:p-7 relative">
          <div className="flex items-start justify-between mb-3">
            <p className="text-primary-foreground/65 text-[11px] font-semibold uppercase tracking-widest">
              Tổng chi phí nhóm
            </p>
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-display text-4xl sm:text-5xl italic font-normal tracking-tight leading-none">
              <AnimatedNumber value={totalSpent} />
            </span>
            <span className="text-primary-foreground/70 text-lg font-medium">
              đ
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div>
              <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wide mb-0.5">
                Hoạt động
              </p>
              <p className="font-bold text-base">{activities.length}</p>
            </div>
            <Separator orientation="vertical" className="h-7 bg-white/20" />
            <div>
              <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wide mb-0.5">
                Thành viên
              </p>
              <p className="font-bold text-base">{personMap.size}</p>
            </div>
            <Separator orientation="vertical" className="h-7 bg-white/20" />
            <div>
              <p className="text-primary-foreground/50 text-[10px] uppercase tracking-wide mb-0.5">
                Thu được
              </p>
              <p className="font-bold text-base">{Math.round(progressPct)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Collection Progress ───────────────────────────────────────────── */}
      <Card className="bento-card col-span-12 lg:col-span-4">
        <CardContent className="p-5 flex flex-col gap-4 h-full justify-between">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Tiến độ thu hồi
          </p>

          <div className="flex items-center gap-4">
            {/* SVG circle progress */}
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r={R}
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={R}
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  stroke="var(--credit)"
                  strokeDasharray={`${(progressPct / 100) * C} ${C}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                {Math.round(progressPct)}%
              </span>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground">
                {paidPersons}/{personMap.size} đã thanh toán
              </p>
              <p className="text-xs text-muted-foreground">
                {personMap.size - paidPersons} người còn nợ
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs mt-1.5 gap-1.5"
                onClick={() => onNavigate?.("summary")}
              >
                <BarChart3 className="w-3 h-3" /> Công nợ
              </Button>
            </div>
          </div>

          {/* Split bar */}
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
              <span>Đã thu</span>
              <span>Còn nợ</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full rounded-l-full transition-all duration-1000"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: "var(--credit)",
                }}
              />
              <div
                className="h-full flex-1 rounded-r-full"
                style={{ backgroundColor: "oklch(0.91 0.04 25)" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Credit Card ───────────────────────────────────────────────────── */}
      <Card
        className="bento-card col-span-6 lg:col-span-4 border-0"
        style={{ backgroundColor: "var(--credit-bg)" }}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle
              className="w-3.5 h-3.5"
              style={{ color: "var(--credit)" }}
            />
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--credit-foreground)" }}
            >
              Đã thu
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-display text-2xl sm:text-3xl italic"
              style={{ color: "var(--credit)" }}
            >
              <AnimatedNumber value={totalPaid} />
            </span>
            <span className="text-sm" style={{ color: "var(--credit)" }}>
              đ
            </span>
          </div>
          <div className="mt-3 h-1 rounded-full overflow-hidden bg-black/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPct}%`,
                backgroundColor: "var(--credit)",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Debt Card ─────────────────────────────────────────────────────── */}
      <Card
        className="bento-card col-span-6 lg:col-span-4 border-0"
        style={{ backgroundColor: "var(--debt-bg)" }}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--debt)" }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--debt-foreground)" }}
            >
              Còn nợ
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-display text-2xl sm:text-3xl italic"
              style={{ color: "var(--debt)" }}
            >
              <AnimatedNumber value={totalUnpaid} />
            </span>
            <span className="text-sm" style={{ color: "var(--debt)" }}>
              đ
            </span>
          </div>
          <div className="mt-3 h-1 rounded-full overflow-hidden bg-black/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${100 - progressPct}%`,
                backgroundColor: "var(--debt)",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Participants / Debt Ranking ────────────────────────────────── */}
      <Card className="bento-card col-span-12 lg:col-span-4">
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Xếp hạng nợ
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {topDebtors.length === 0 ? (
            <div className="flex flex-col items-center py-4 gap-1.5">
              <span className="text-2xl">🎉</span>
              <p className="text-xs text-muted-foreground text-center">
                Tất cả đã thanh toán!
              </p>
            </div>
          ) : (
            topDebtors.map(([name, { paid, total }], index) => {
              const owed = total - paid;
              const pct = total > 0 ? (paid / total) * 100 : 100;
              const medal =
                index === 0
                  ? { icon: "🥇", label: "#1", color: "#B8860B" }
                  : index === 1
                    ? { icon: "🥈", label: "#2", color: "#9E9E9E" }
                    : index === 2
                      ? { icon: "🥉", label: "#3", color: "#8B5E3C" }
                      : {
                          icon: null,
                          label: `#${index + 1}`,
                          color: "var(--muted-foreground)",
                        };
              return (
                <div key={name} className="flex items-center gap-2.5 group">
                  {/* Rank badge */}
                  <div className="w-7 h-7 shrink-0 flex items-center justify-center text-base leading-none">
                    {medal.icon ? (
                      <span role="img" aria-label={`Hạng ${index + 1}`}>
                        {medal.icon}
                      </span>
                    ) : (
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: medal.color }}
                      >
                        {medal.label}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {name}
                      </p>
                      <span
                        className="text-[10px] font-bold ml-1 shrink-0"
                        style={{ color: "var(--debt)" }}
                      >
                        -{roundUpK(owed).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "var(--debt)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {persons.length - topDebtors.length > 0 && (
            <p className="text-[11px] text-muted-foreground pt-1">
              +{persons.length - topDebtors.length} người khác · {paidPersons}{" "}
              đã thanh toán
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Activities ─────────────────────────────────────────────── */}
      <Card className="bento-card col-span-12">
        <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Hoạt động gần đây
          </CardTitle>
          {activities.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("list")}
              className="text-xs gap-1 h-7 text-muted-foreground hover:text-foreground"
            >
              Tất cả <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="divide-y divide-border">
            {recentActivities.map((act) => {
              const paidCount = act.participants.filter((p) => p.paid).length;
              const allPaid = paidCount === act.participants.length;
              const date = new Date(act.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              });
              return (
                <div
                  key={act.id}
                  className="flex items-center gap-3 py-3 -mx-5 px-5 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                    style={{
                      backgroundColor: allPaid
                        ? "var(--credit-bg)"
                        : "var(--debt-bg)",
                      color: allPaid ? "var(--credit)" : "var(--debt)",
                    }}
                  >
                    {act.category
                      ? CATEGORY_ICONS[act.category]
                      : act.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {act.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {act.participants.length} người · {date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm text-foreground">
                      {act.totalAmount.toLocaleString("vi-VN")}đ
                    </p>
                    <p
                      className="text-[11px] font-medium"
                      style={{
                        color: allPaid ? "var(--credit)" : "var(--debt)",
                      }}
                    >
                      {paidCount}/{act.participants.length} đã trả
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-3">
              <Button onClick={onQuickAdd} size="sm" className="flex-1 gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Thêm nhanh
              </Button>
              <Button
                onClick={() => onNavigate?.("list")}
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Chi tiết
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
