"use client";

import toast from "react-hot-toast";
import type { PaymentQR } from "@/types";
import { money, plain } from "@/lib/ledgerSelectors";
import SheetShell from "@/components/SheetShell";

interface PaySheetProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  payerName: string;
  paymentQR: PaymentQR | null;
}

/**
 * Thay tab QR cũ. Sheet mang theo ĐÚNG số tiền và ĐÚNG người nhận,
 * nên không ai phải nhớ con số khi mở app ngân hàng.
 */
export default function PaySheet({
  open,
  onClose,
  amount,
  payerName,
  paymentQR,
}: PaySheetProps) {
  const copy = () => {
    navigator.clipboard
      .writeText(String(Math.round(amount)))
      .then(() => toast.success(`Đã copy ${money(amount)}`))
      .catch(() => toast.error("Không copy được — nhập tay giúp mình nhé"));
  };

  const rows = [
    { label: "NGÂN HÀNG", value: paymentQR?.bankName, mono: false },
    { label: "SỐ TÀI KHOẢN", value: paymentQR?.accountNumber, mono: true },
    { label: "CHỦ TÀI KHOẢN", value: paymentQR?.accountName, mono: false },
  ].filter((r) => r.value);

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      header={
        <div>
          <div className="eyebrow">TRẢ CHO {payerName.toUpperCase()}</div>
          <div className="tnum text-fig mt-1.5">{money(amount)}</div>
        </div>
      }
      footer={
        <button
          type="button"
          onClick={copy}
          className="w-full min-h-[52px] border border-ink rounded-ctl
                     font-mono text-[13px] tracking-[0.1em] hover:bg-paper-2 transition-colors"
        >
          COPY SỐ TIỀN {plain(amount)}
        </button>
      }
    >
      <div className="rule-tear pt-5">
        <div className="flex justify-center">
          {paymentQR?.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={paymentQR.imageUrl}
              alt="Mã QR chuyển khoản"
              className="w-[200px] h-[200px] object-contain border border-rule-strong"
            />
          ) : (
            <div
              className="w-[200px] h-[200px] border border-rule-strong grid place-items-center
                         text-center font-mono text-eyebrow text-ink-3 leading-relaxed"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--paper-2) 0 8px, var(--paper) 8px 16px)",
              }}
            >
              ẢNH QR
              <br />
              ADMIN TẢI LÊN
            </div>
          )}
        </div>

        <div className="mt-5">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 py-3 border-t border-rule"
            >
              <span className="font-mono text-eyebrow text-ink-2">{r.label}</span>
              <span
                className={`text-body font-medium text-right break-all ${r.mono ? "tnum" : ""}`}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[14px] text-ink-2 text-center mt-5">
          Chuyển xong nhắn {payerName} một tiếng — chỉ admin tick được “đã trả”.
        </p>
      </div>
    </SheetShell>
  );
}
