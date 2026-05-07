"use client";

import { useState } from "react";
import { Activity, DebtSummary as DebtSummaryType, CATEGORY_ICONS } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity as ActivityIcon,
  CheckCircle,
  Clock,
  Check,
  X,
  Calendar,
  Receipt,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface DebtSummaryProps {
  activities: Activity[];
  onMarkAllPaid?: (personName: string) => void;
  isAdmin?: boolean;
}

export default function DebtSummary({
  activities,
  onMarkAllPaid,
  isAdmin,
}: DebtSummaryProps) {
  const [confirmMarkPaid, setConfirmMarkPaid] = useState<{
    show: boolean;
    name: string;
    amount: number;
  }>({
    show: false,
    name: "",
    amount: 0,
  });

  const handleMarkAllPaidClick = (name: string, amount: number) => {
    setConfirmMarkPaid({ show: true, name, amount });
  };

  const confirmMarkAllPaid = () => {
    if (onMarkAllPaid) {
      onMarkAllPaid(confirmMarkPaid.name);
    }
    setConfirmMarkPaid({ show: false, name: "", amount: 0 });
  };

  const cancelMarkPaid = () => {
    setConfirmMarkPaid({ show: false, name: "", amount: 0 });
  };

  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const getPersonActivities = (name: string) => {
    return activities
      .filter((a) => a.participants.some((p) => p.name === name))
      .map((a) => {
        const participant = a.participants.find((p) => p.name === name)!;
        return {
          activity: a,
          share: participant.shareAmount ?? a.amountPerPerson,
          paid: participant.paid,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.activity.date).getTime() -
          new Date(a.activity.date).getTime(),
      );
  };

  const calculateDebts = (): DebtSummaryType[] => {
    const debts = new Map<string, { total: number; paid: number }>();

    activities.forEach((activity) => {
      activity.participants.forEach((participant) => {
        const share = participant.shareAmount ?? activity.amountPerPerson;
        const current = debts.get(participant.name) || { total: 0, paid: 0 };
        debts.set(participant.name, {
          total: current.total + share,
          paid: current.paid + (participant.paid ? share : 0),
        });
      });
    });

    return Array.from(debts.entries())
      .map(([name, { total, paid }]) => ({
        name,
        totalDebt: total,
        paidAmount: paid,
        remainingDebt: total - paid,
      }))
      .sort((a, b) => b.remainingDebt - a.remainingDebt);
  };

  const debts = calculateDebts();
  const totalDebt = debts.reduce((sum, d) => sum + d.totalDebt, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalRemaining = debts.reduce((sum, d) => sum + d.remainingDebt, 0);

  // Round up to nearest thousand for display (only if not already a multiple of 1000)
  const roundUpK = (n: number) => Math.ceil(Math.round(n) / 1000) * 1000;

  const selectedPersonActivities = selectedPerson
    ? getPersonActivities(selectedPerson)
    : [];
  const selectedPersonDebt = selectedPerson
    ? debts.find((d) => d.name === selectedPerson) ?? null
    : null;

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
          <ActivityIcon className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            Chưa có dữ liệu để tổng hợp
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Thêm hoạt động để xem báo cáo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Tổng chi phí",
            value: totalDebt,
            icon: TrendingUp,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/50",
          },
          {
            label: "Đã thu",
            value: totalPaid,
            icon: CheckCircle,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/50",
          },
          {
            label: "Còn nợ",
            value: totalRemaining,
            icon: Clock,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-950/50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/60 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div
                className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-sm sm:text-base font-bold text-foreground break-all">
                {roundUpK(value).toLocaleString("vi-VN")}đ
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Debts */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Chi tiết từng người
        </h3>
        <div className="space-y-3">
          {debts.map((debt) => {
            const pct = (debt.paidAmount / debt.totalDebt) * 100;
            const isPaid = debt.remainingDebt === 0;
            return (
              <Card
                key={debt.name}
                className={`border-border/60 shadow-sm ${isPaid ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/50" : ""}`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                        {debt.name.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-semibold text-foreground truncate">
                        {debt.name}
                      </h4>
                    </div>
                    <Badge
                      variant={isPaid ? "default" : "secondary"}
                      className={`shrink-0 ${isPaid ? "bg-emerald-600 hover:bg-emerald-600" : "text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/20"}`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Xong
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Nợ
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/40 rounded-lg">
                      <span className="text-muted-foreground">
                        Tổng phải trả
                      </span>
                      <span className="font-semibold text-foreground">
                        {roundUpK(debt.totalDebt).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                      <span className="text-muted-foreground">Đã trả</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {roundUpK(debt.paidAmount).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                      <span className="font-medium text-foreground">
                        Còn nợ
                      </span>
                      <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                        {roundUpK(debt.remainingDebt).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tiến độ</span>
                      <span className="font-medium">{pct.toFixed(1)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full gap-1.5 text-xs h-8"
                    onClick={() => setSelectedPerson(debt.name)}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Xem hoạt động đã tham gia
                  </Button>

                  {isAdmin && debt.remainingDebt > 0 && (
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold"
                      onClick={() =>
                        handleMarkAllPaidClick(debt.name, debt.remainingDebt)
                      }
                    >
                      <Check className="w-3.5 h-3.5" />
                      Thanh toán ngay —{" "}
                      {roundUpK(debt.remainingDebt).toLocaleString("vi-VN")}đ
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Thống kê
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Số người tham gia",
                value: debts.length,
                color: "text-primary",
              },
              {
                label: "Số hoạt động",
                value: activities.length,
                color: "text-primary",
              },
              {
                label: "Đã thanh toán đủ",
                value: debts.filter((d) => d.remainingDebt === 0).length,
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Còn nợ",
                value: debts.filter((d) => d.remainingDebt > 0).length,
                color: "text-orange-600 dark:text-orange-400",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Person Activity Detail Modal */}
      {selectedPerson && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  {selectedPerson.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-foreground">
                    {selectedPerson}
                  </h3>
                  <p className="text-xs text-primary-foreground/70">
                    {selectedPersonActivities.length} hoạt động đã tham gia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Stats */}
            {selectedPersonDebt && (
              <div className="grid grid-cols-3 gap-px bg-border border-b border-border">
                <div className="bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    Tổng nợ
                  </p>
                  <p className="font-bold text-sm text-foreground">
                    {roundUpK(selectedPersonDebt.totalDebt).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    Đã trả
                  </p>
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {roundUpK(selectedPersonDebt.paidAmount).toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    Còn nợ
                  </p>
                  <p className="font-bold text-sm text-orange-600 dark:text-orange-400">
                    {roundUpK(selectedPersonDebt.remainingDebt).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            )}

            {/* Activity list */}
            <div className="overflow-y-auto max-h-[calc(90vh-220px)]">
              <div className="p-3 space-y-2">
                {selectedPersonActivities.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    Không có hoạt động nào
                  </p>
                ) : (
                  selectedPersonActivities.map(({ activity, share, paid }) => (
                    <div
                      key={activity.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        paid
                          ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/50"
                          : "bg-muted/40 border-border"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                          paid
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-muted"
                        }`}
                      >
                        {activity.category
                          ? CATEGORY_ICONS[activity.category]
                          : activity.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(activity.date).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-bold text-sm ${
                            paid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }`}
                        >
                          {roundUpK(share).toLocaleString("vi-VN")}đ
                        </p>
                        <span
                          className={`text-[10px] font-semibold ${
                            paid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-orange-500"
                          }`}
                        >
                          {paid ? "✓ Đã trả" : "Chưa trả"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Mark Paid Dialog */}
      {confirmMarkPaid.show && (
        <ConfirmDialog
          title="Xác nhận đã thanh toán"
          message={`Bạn xác nhận "${confirmMarkPaid.name}" đã thanh toán hết số tiền ${roundUpK(confirmMarkPaid.amount).toLocaleString("vi-VN")}đ? Tất cả các khoản nợ của người này sẽ được đánh dấu là đã thanh toán.`}
          onConfirm={confirmMarkAllPaid}
          onCancel={cancelMarkPaid}
          confirmText="Xác nhận"
          cancelText="Hủy"
          type="success"
        />
      )}
    </div>
  );
}
