"use client";

import { useState } from "react";
import type { Activity } from "@/types";
import type { buildLedger } from "@/lib/ledgerSelectors";
import { plain } from "@/lib/ledgerSelectors";
import Money from "@/components/Money";
import CategoryMark from "@/components/CategoryMark";
import PeopleRows from "@/components/PeopleRows";
import WhoAreYou from "@/components/WhoAreYou";

type LedgerData = ReturnType<typeof buildLedger>;

interface LedgerProps {
  ledger: LedgerData;
  me: string | null;
  isAdmin: boolean;
  payerName: string;
  onPickMe: (name: string) => void;
  onClearMe: () => void;
  onOpenPerson: (name: string) => void;
  onOpenActivity: (activity: Activity) => void;
  onOpenPay: () => void;
  onGoActivities: () => void;
}

export default function Ledger({
  ledger,
  me,
  isAdmin,
  payerName,
  onPickMe,
  onClearMe,
  onOpenPerson,
  onOpenActivity,
  onOpenPay,
  onGoActivities,
}: LedgerProps) {
  const [expanded, setExpanded] = useState(false);

  const iOwe = !!me && !ledger.iAmPayer && ledger.myOwed > 0;
  const myLabel = ledger.iAmPayer
    ? "BẠN CÒN PHẢI THU"
    : ledger.myOwed > 0
      ? "BẠN CÒN NỢ"
      : "BẠN ĐÃ TRẢ XONG";
  const myTone = ledger.iAmPayer || ledger.myOwed === 0 ? "settled" : "stamp";
  const myAmount = ledger.iAmPayer ? ledger.outstanding : ledger.myOwed;

  const linkish =
    "font-mono text-eyebrow tracking-[0.1em] text-stamp border-b border-stamp py-0.5";

  return (
    <div>
      {!me && <WhoAreYou roster={ledger.roster} onPick={onPickMe} />}

      {/* Dòng của bạn — hoặc của nhóm khi chưa chọn tên */}
      {me ? (
        <div className="px-5 pt-[22px] pb-5">
          <div className="flex justify-between items-baseline">
            <span className="eyebrow">BẠN LÀ {me.toUpperCase()}</span>
            <button type="button" onClick={onClearMe} className={linkish}>
              ĐỔI
            </button>
          </div>

          <div
            className={`eyebrow mt-[18px] ${myTone === "stamp" ? "text-stamp" : "text-settled"}`}
          >
            {myLabel}
          </div>
          <div
            className={`mt-1 text-fig-hero tracking-[-0.035em] ${
              myTone === "stamp" ? "text-stamp" : "text-settled"
            }`}
          >
            <Money
              value={myAmount}
              direction={myAmount === 0 ? undefined : myTone === "stamp" ? "out" : "in"}
              animate
            />
          </div>
          <p className="text-body text-ink-2 mt-2">
            {ledger.iAmPayer
              ? `${ledger.peopleUnsettled} người chưa trả xong`
              : ledger.myOwed > 0
                ? `Trả cho ${payerName} · ${ledger.myCounts.unpaid} khoản chưa xong`
                : `Bạn đã thanh toán đủ ${ledger.myCounts.total} khoản`}
          </p>

          {iOwe && (
            <button
              type="button"
              onClick={onOpenPay}
              className="mt-4 w-full min-h-[52px] bg-ink text-on-ink rounded-ctl
                         font-mono text-[13px] tracking-[0.12em] hover:opacity-90 transition-opacity"
            >
              QUÉT QR TRẢ NGAY →
            </button>
          )}
        </div>
      ) : (
        <div className="px-5 pt-[22px] pb-5">
          <div className="eyebrow text-stamp">NHÓM CÒN NỢ</div>
          <div className="mt-1 text-fig-hero tracking-[-0.035em] text-stamp">
            <Money value={ledger.outstanding} direction="out" animate />
          </div>
          <p className="text-body text-ink-2 mt-2">
            {ledger.peopleUnsettled} người chưa trả xong · trên tổng{" "}
            {plain(ledger.total)}đ
          </p>
        </div>
      )}

      {/* Dải tổng nhóm */}
      <div className="grid grid-cols-3 bg-paper-2 border-y border-rule-strong">
        <div className="px-3 py-3.5 border-r border-rule">
          <div className="font-mono text-[10px] tracking-[0.12em] text-ink-2">
            TỔNG CHI
          </div>
          <div className="tnum text-body mt-[5px]">{plain(ledger.total)}</div>
        </div>
        <div className="px-3 py-3.5 border-r border-rule">
          <div className="font-mono text-[10px] tracking-[0.12em] text-settled">
            ĐÃ THU
          </div>
          <div className="tnum text-body mt-[5px] text-settled">
            +{plain(ledger.collected)}
          </div>
        </div>
        <div className="px-3 py-3.5">
          <div className="font-mono text-[10px] tracking-[0.12em] text-stamp">
            CÒN NỢ
          </div>
          <div className="tnum text-body mt-[5px] text-stamp">
            −{plain(ledger.outstanding)}
          </div>
        </div>
      </div>

      {/* Tiến độ thu */}
      <div className="px-5 py-3 border-b border-rule flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Tỉ lệ đã thu"
          aria-valuenow={ledger.pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 h-1.5 bg-rule flex"
        >
          <div className="bg-ink" style={{ width: `${ledger.pct}%` }} />
        </div>
        <span className="tnum font-mono text-eyebrow text-ink-2">
          {ledger.pct}% ĐÃ THU
        </span>
      </div>

      {/* Ai nợ ai */}
      <div className="px-5 pt-[18px] pb-1 flex justify-between items-baseline">
        <span className="eyebrow">AI NỢ AI</span>
        <span className="font-mono text-eyebrow text-ink-3">
          {ledger.rows.length} người{isAdmin ? " · CHẠM ĐỂ TICK" : ""}
        </span>
      </div>
      <PeopleRows
        rows={ledger.rows}
        onOpen={onOpenPerson}
        expanded={expanded}
        onExpand={() => setExpanded(true)}
      />

      {/* Ghi chép gần đây */}
      <div className="border-t border-rule-strong mt-[18px] px-5 pt-[18px] pb-1.5 flex justify-between items-baseline">
        <span className="eyebrow">GHI CHÉP GẦN ĐÂY</span>
        <button type="button" onClick={onGoActivities} className={linkish}>
          TẤT CẢ →
        </button>
      </div>
      <div className="px-5 pb-6">
        {ledger.recent.map((r) => (
          <button
            key={r.activity.id}
            type="button"
            onClick={() => onOpenActivity(r.activity)}
            className="w-full text-left grid items-center gap-2.5 py-3 min-h-12
                       grid-cols-[42px_28px_minmax(0,1fr)_auto] border-b border-rule"
          >
            <span className="font-mono text-eyebrow text-ink-3">{r.dayLabel}</span>
            <CategoryMark category={r.activity.category} size={28} />
            <span className="text-body truncate">{r.activity.title}</span>
            <Money value={r.activity.totalAmount} className="text-[14px]" />
          </button>
        ))}
      </div>
    </div>
  );
}
