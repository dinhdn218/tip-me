"use client";

import type { PersonRow } from "@/lib/ledgerSelectors";
import { cn } from "@/lib/utils";
import Money from "@/components/Money";

interface PeopleRowsProps {
  rows: PersonRow[];
  onOpen: (name: string) => void;
  /** Nhóm lớn: hiện 5 dòng đầu rồi "XEM CẢ N NGƯỜI" */
  expanded: boolean;
  onExpand: () => void;
}

const VISIBLE = 5;

export default function PeopleRows({
  rows,
  onOpen,
  expanded,
  onExpand,
}: PeopleRowsProps) {
  const shown = expanded ? rows : rows.slice(0, VISIBLE);
  const hidden = rows.length - shown.length;

  return (
    <div className="px-5">
      {shown.map((p) => (
        <button
          key={p.name}
          type="button"
          onClick={() => onOpen(p.name)}
          className={cn(
            "w-full text-left grid items-center gap-3 py-[13px] min-h-14",
            "grid-cols-[32px_minmax(0,1fr)_auto] border-b border-rule",
            p.isPayer && "rule-total mt-1",
            p.isMe && "bg-stamp-wash",
          )}
        >
          <span
            className={cn(
              "w-8 h-8 grid place-items-center border rounded-ctl font-mono text-[11px] font-semibold",
              p.isMe ? "border-stamp text-stamp" : "border-rule-strong text-ink",
            )}
          >
            {p.initials}
          </span>

          <span className="min-w-0">
            <span className="block text-row font-medium truncate">
              {p.name}
              {p.isMe && (
                <span className="ml-1.5 font-mono text-[10px] border border-stamp text-stamp rounded-ctl px-1 py-px align-middle">
                  BẠN
                </span>
              )}
            </span>
            <span className="block font-mono text-eyebrow text-ink-3 mt-0.5">
              {p.isPayer
                ? "NGƯỜI ỨNG TIỀN"
                : p.settled
                  ? `XONG ${p.totalCount}/${p.totalCount} KHOẢN`
                  : `${p.unpaidCount} KHOẢN CHƯA TRẢ`}
            </span>
          </span>

          <span className="text-right">
            {p.isPayer ? (
              <Money
                value={p.owed}
                direction="in"
                className="text-row text-settled"
              />
            ) : p.settled ? (
              <span className="stamp-paid inline-grid place-items-center rounded-ctl font-mono text-[10px] px-2 py-1 -rotate-3">
                ĐÃ TRẢ ✓
              </span>
            ) : (
              <Money
                value={p.owed}
                direction="out"
                className="text-row text-stamp"
              />
            )}
          </span>
        </button>
      ))}

      {hidden > 0 && (
        <button
          type="button"
          onClick={onExpand}
          className="w-full mt-3 min-h-11 border border-rule rounded-ctl
                     font-mono text-[11px] tracking-[0.1em] text-ink-2 hover:border-ink transition-colors"
        >
          XEM CẢ {rows.length} NGƯỜI ↓
        </button>
      )}
    </div>
  );
}
