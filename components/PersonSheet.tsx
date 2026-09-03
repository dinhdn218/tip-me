"use client";

import type { Activity } from "@/types";
import { shareOf } from "@/lib/utils";
import { countsFor, owedBy } from "@/lib/ledgerSelectors";
import CategoryMark from "@/components/CategoryMark";
import SheetShell from "@/components/SheetShell";
import Money from "@/components/Money";

interface PersonSheetProps {
  name: string | null;
  activities: Activity[];
  onClose: () => void;
  onOpenActivity: (activity: Activity) => void;
  onOpenPay: () => void;
  onMarkAllPaid: (name: string) => void;
  me: string | null;
  isAdmin: boolean;
  isPayer: boolean;
}

/** Thay dialog chi tiết theo người trong DebtSummary. */
export default function PersonSheet({
  name,
  activities,
  onClose,
  onOpenActivity,
  onOpenPay,
  onMarkAllPaid,
  me,
  isAdmin,
  isPayer,
}: PersonSheetProps) {
  if (!name) return null;

  const mine = activities
    .filter((a) => a.participants.some((p) => p.name === name))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const owed = owedBy(activities, name);
  const counts = countsFor(activities, name);
  const isMe = name === me;

  return (
    <SheetShell
      open
      onClose={onClose}
      header={
        <div>
          <h2 className="text-head font-semibold truncate">{name}</h2>
          <div className="font-mono text-eyebrow text-ink-2 mt-1.5">
            {isPayer ? "NGƯỜI ỨNG TIỀN" : `${counts.total} KHOẢN THAM GIA`}
          </div>
        </div>
      }
      footer={
        isMe && owed > 0 && !isPayer ? (
          <button
            type="button"
            onClick={onOpenPay}
            className="w-full min-h-[52px] bg-ink text-on-ink rounded-ctl
                       font-mono text-[13px] tracking-[0.1em] hover:opacity-90 transition-opacity"
          >
            QUÉT QR TRẢ NGAY
          </button>
        ) : isAdmin && owed > 0 && !isPayer ? (
          <button
            type="button"
            onClick={() => {
              onMarkAllPaid(name);
              onClose();
            }}
            className="w-full min-h-[52px] border border-ink rounded-ctl
                       font-mono text-[13px] tracking-[0.1em] hover:bg-paper-2 transition-colors"
          >
            TICK ĐÃ TRẢ TẤT CẢ
          </button>
        ) : undefined
      }
    >
      <div className="border-t border-rule pt-4">
        <div className={`eyebrow ${owed > 0 ? "text-stamp" : "text-settled"}`}>
          {owed > 0 ? "CÒN NỢ" : "ĐÃ TRẢ XONG"}
        </div>
        <div className="mt-1">
          {owed > 0 ? (
            <Money
              value={owed}
              direction="out"
              className="text-[36px] text-stamp"
            />
          ) : (
            <span className="tnum text-[36px] text-settled">0đ ✓</span>
          )}
        </div>
      </div>

      <div className="eyebrow mt-6 mb-1">TỪNG KHOẢN</div>
      <div>
        {mine.map((a) => {
          const p = a.participants.find((x) => x.name === name)!;
          const dd = a.date.slice(8, 10);
          const mm = a.date.slice(5, 7);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onOpenActivity(a)}
              className="w-full text-left grid grid-cols-[28px_minmax(0,1fr)_auto] items-center
                         gap-3 py-3 border-b border-rule min-h-14"
            >
              <CategoryMark category={a.category} size={28} />
              <span className="min-w-0">
                <span className="block text-body truncate">{a.title}</span>
                <span className="block font-mono text-eyebrow text-ink-3 mt-0.5">
                  {dd}.{mm}
                </span>
              </span>
              <span className="text-right">
                <Money value={shareOf(a, p)} className="block text-body" />
                <span
                  className={`block font-mono text-[10px] mt-0.5 ${
                    p.paid ? "text-settled" : "text-stamp"
                  }`}
                >
                  {p.paid ? "ĐÃ TRẢ ✓" : "CHƯA TRẢ"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </SheetShell>
  );
}
