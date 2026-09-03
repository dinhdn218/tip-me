"use client";

import { useState } from "react";
import type { Activity } from "@/types";
import { shareOf } from "@/lib/utils";
import { activityDue, money, splitLabel } from "@/lib/ledgerSelectors";
import { labelOf } from "@/components/CategoryMark";
import CategoryMark from "@/components/CategoryMark";
import SheetShell from "@/components/SheetShell";
import Money from "@/components/Money";
import Stamp from "@/components/Stamp";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ActivitySheetProps {
  activity: Activity | null;
  onClose: () => void;
  onToggle: (activity: Activity, name: string) => void;
  onDelete: (id: string) => void;
  onOpenPay: () => void;
  isAdmin: boolean;
  me: string | null;
}

/** Thay modal tự chế trong ActivityList. Mọi phần tiền đi qua shareOf(). */
export default function ActivitySheet({
  activity,
  onClose,
  onToggle,
  onDelete,
  onOpenPay,
  isAdmin,
  me,
}: ActivitySheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [stamped, setStamped] = useState<string | null>(null);

  if (!activity) return null;

  const due = activityDue(activity);
  const dd = activity.date.slice(8, 10);
  const mm = activity.date.slice(5, 7);
  const yyyy = activity.date.slice(0, 4);
  const myPart = activity.participants.find((p) => p.name === me);
  const showPay = !!myPart && !myPart.paid;

  const tick = (name: string) => {
    setStamped(name);
    onToggle(activity, name);
  };

  return (
    <>
      <SheetShell
        open
        onClose={onClose}
        header={
          <div>
            <div className="flex items-center gap-2.5">
              <CategoryMark category={activity.category} size={28} />
              <h2 className="text-head font-semibold truncate">
                {activity.title}
              </h2>
            </div>
            <div className="font-mono text-eyebrow text-ink-2 mt-1.5">
              {dd}.{mm}.{yyyy} · {labelOf(activity.category).toUpperCase()} ·{" "}
              {splitLabel(activity)}
            </div>
          </div>
        }
        footer={
          <div className="space-y-2">
            {showPay && (
              <button
                type="button"
                onClick={onOpenPay}
                className="w-full min-h-[52px] bg-ink text-on-ink rounded-ctl
                           font-mono text-[13px] tracking-[0.1em] hover:opacity-90 transition-opacity"
              >
                QUÉT QR TRẢ PHẦN CỦA BẠN
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full min-h-11 border border-stamp text-stamp rounded-ctl
                           font-mono text-[12px] tracking-[0.1em] hover:bg-stamp-wash transition-colors"
              >
                XÓA KHOẢN NÀY
              </button>
            )}
          </div>
        }
      >
        <div className="flex items-baseline justify-between border-t border-rule pt-4">
          <span className="eyebrow">TỔNG</span>
          <Money value={activity.totalAmount} className="text-[28px]" />
        </div>

        <div className="eyebrow mt-6 mb-1">
          CHIA CHO {activity.participants.length} NGƯỜI
        </div>
        <div>
          {activity.participants.map((p) => {
            const isMe = p.name === me;
            return (
              <div
                key={p.name}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 border-b border-rule"
              >
                <span className="min-w-0 truncate text-body">
                  {p.name}
                  {isMe && <span className="text-ink-3"> · bạn</span>}
                </span>
                <Money value={shareOf(activity, p)} className="text-body" />
                <Stamp
                  paid={p.paid}
                  onTick={isAdmin ? () => tick(p.name) : undefined}
                  ariaLabel={
                    p.paid
                      ? `Bỏ tick đã trả cho ${p.name}`
                      : `Tick đã trả cho ${p.name}`
                  }
                  justStamped={stamped === p.name}
                />
              </div>
            );
          })}
        </div>

        <div className="rule-total mt-4 pt-3.5 flex items-baseline justify-between">
          <span className="eyebrow">CÒN PHẢI THU</span>
          {due === 0 ? (
            <span className="tnum text-row text-settled">0đ ✓</span>
          ) : (
            <Money value={due} direction="out" className="text-row text-stamp" />
          )}
        </div>
      </SheetShell>

      {confirmDelete && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Xóa khoản “${activity.title}” (${money(activity.totalAmount)})? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete(activity.id);
            onClose();
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
