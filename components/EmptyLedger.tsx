"use client";

interface EmptyLedgerProps {
  isAdmin: boolean;
  onAdd: () => void;
}

/** Sổ trống — mở/đóng bằng kẻ để vẫn đọc như một tờ biên lai. */
export default function EmptyLedger({ isAdmin, onAdd }: EmptyLedgerProps) {
  return (
    <div className="border-t border-rule">
      <div className="px-6 py-11 text-center">
        <div className="eyebrow">SỔ TRỐNG</div>
        <div className="tnum text-[38px] leading-[1.15] text-rule-strong mt-2">
          0đ
        </div>
        <p className="text-body text-ink-2 mt-3 max-w-[34ch] mx-auto">
          Chưa có khoản nào. Ghi bữa đầu tiên vào đây là xong — cả nhóm xem được
          ngay, không cần đăng nhập.
        </p>
        {isAdmin && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-6 min-h-[52px] px-6 bg-ink text-on-ink rounded-ctl
                       font-mono text-[13px] tracking-[0.1em] hover:opacity-90 transition-opacity"
          >
            + GHI KHOẢN ĐẦU TIÊN
          </button>
        )}
      </div>
      <div className="rule-tear" />
    </div>
  );
}
