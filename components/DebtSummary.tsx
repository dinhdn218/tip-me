"use client";

import { useState } from "react";
import { Activity, DebtSummary as DebtSummaryType } from "@/types";
import {
  TrendingUp,
  Users,
  Activity as ActivityIcon,
  CheckCircle,
  Clock,
  Check,
  ChevronRight,
  Calendar,
  ListChecks,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { shareOf } from "@/lib/utils";

interface DebtSummaryProps {
  activities: Activity[];
  onMarkAllPaid?: (personName: string) => void;
  onUpdate?: (activity: Activity) => void;
  isAdmin?: boolean;
}

export default function DebtSummary({
  activities,
  onMarkAllPaid,
  onUpdate,
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
  const [dialogName, setDialogName] = useState<string | null>(null);

  // Activities a given person participated in (most recent first)
  const activitiesOf = (name: string) =>
    activities
      .filter((a) => a.participants.some((p) => p.name === name))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Toggle one person's paid status on a single activity
  const togglePaidOn = (activity: Activity, name: string) => {
    if (!onUpdate) return;
    onUpdate({
      ...activity,
      participants: activity.participants.map((p) =>
        p.name === name ? { ...p, paid: !p.paid } : p,
      ),
    });
  };

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

  const calculateDebts = (): DebtSummaryType[] => {
    const debts = new Map<string, { total: number; paid: number }>();

    activities.forEach((activity) => {
      activity.participants.forEach((participant) => {
        const current = debts.get(participant.name) || { total: 0, paid: 0 };
        const share = shareOf(activity, participant);
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

  // Round up to nearest thousand for display
  const roundUpK = (n: number) => Math.ceil(n / 1000) * 1000;

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
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Đã thu",
            value: totalPaid,
            icon: CheckCircle,
            color: "text-credit",
            bg: "bg-credit-bg",
          },
          {
            label: "Còn nợ",
            value: totalRemaining,
            icon: Clock,
            color: "text-debt",
            bg: "bg-debt-bg",
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
                className={`border-border/60 shadow-sm ${isPaid ? "bg-credit-bg/40 border-credit/30" : ""}`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-brand-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {debt.name.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-semibold text-foreground truncate">
                        {debt.name}
                      </h4>
                    </div>
                    <Badge
                      variant={isPaid ? "default" : "secondary"}
                      className={`shrink-0 ${isPaid ? "bg-credit hover:bg-credit text-white border-0" : "text-debt border-debt/30 bg-debt-bg"}`}
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
                    <div className="flex justify-between items-center py-1.5 px-3 bg-credit-bg rounded-lg">
                      <span className="text-muted-foreground">Đã trả</span>
                      <span className="font-semibold text-credit">
                        {roundUpK(debt.paidAmount).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-debt-bg rounded-lg border border-debt/20">
                      <span className="font-medium text-foreground">
                        Còn nợ
                      </span>
                      <span className="font-bold text-debt text-sm">
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

                  {isAdmin && debt.remainingDebt > 0 && (
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-credit hover:bg-credit/90 text-white gap-1.5 font-semibold"
                      onClick={() =>
                        handleMarkAllPaidClick(debt.name, debt.remainingDebt)
                      }
                    >
                      <Check className="w-3.5 h-3.5" />
                      Thanh toán ngay —{" "}
                      {roundUpK(debt.remainingDebt).toLocaleString("vi-VN")}đ
                    </Button>
                  )}

                  {/* Activities participated — opens in a dialog */}
                  <button
                    onClick={() => setDialogName(debt.name)}
                    className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs font-semibold text-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-primary" />
                      Hoạt động đã tham gia ({activitiesOf(debt.name).length})
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
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
                color: "text-credit",
              },
              {
                label: "Còn nợ",
                value: debts.filter((d) => d.remainingDebt > 0).length,
                color: "text-debt",
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

      {/* Activities-participated dialog */}
      <Dialog open={!!dialogName} onOpenChange={(o) => !o && setDialogName(null)}>
        <DialogContent className="sm:max-w-md">
          {dialogName && (() => {
            const acts = activitiesOf(dialogName);
            const info = debts.find((d) => d.name === dialogName);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {dialogName.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate">{dialogName}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {acts.length} hoạt động đã tham gia
                      </span>
                    </span>
                  </DialogTitle>
                  {info && (
                    <DialogDescription className="flex items-center gap-3 pt-1">
                      <span>
                        Còn nợ{" "}
                        <span className="font-bold text-debt">
                          {roundUpK(info.remainingDebt).toLocaleString("vi-VN")}đ
                        </span>
                      </span>
                      <span className="text-border">·</span>
                      <span>
                        Đã trả{" "}
                        <span className="font-bold text-credit">
                          {roundUpK(info.paidAmount).toLocaleString("vi-VN")}đ
                        </span>
                      </span>
                    </DialogDescription>
                  )}
                </DialogHeader>

                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto -mx-1 px-1">
                  {acts.map((a) => {
                    const part = a.participants.find((p) => p.name === dialogName);
                    const paid = !!part?.paid;
                    const share = part ? shareOf(a, part) : a.amountPerPerson;
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border ${paid ? "bg-credit-bg border-credit/30" : "bg-muted/40 border-border"}`}
                      >
                        <button
                          type="button"
                          disabled={!isAdmin || !onUpdate}
                          onClick={() => togglePaidOn(a, dialogName)}
                          aria-label={paid ? "Đánh dấu chưa trả" : "Đánh dấu đã trả"}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${paid ? "bg-credit border-credit" : "border-muted-foreground/30"} ${isAdmin && onUpdate ? "cursor-pointer hover:border-credit" : "cursor-default"}`}
                        >
                          {paid && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${paid ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {a.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(a.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold shrink-0 ${paid ? "text-credit" : "text-debt"}`}>
                          {roundUpK(share).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isAdmin && onUpdate && acts.length > 0 && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Bấm vào ô vuông để đánh dấu đã/chưa trả từng hoạt động
                  </p>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

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
