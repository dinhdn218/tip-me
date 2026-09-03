"use client";

import { useState } from "react";
import SheetShell from "@/components/SheetShell";
import { cn } from "@/lib/utils";

interface PinSheetProps {
  open: boolean;
  onClose: () => void;
  /** Trả về true nếu PIN đúng — luồng hash/nâng cấp vẫn nằm ở page.tsx */
  onSubmit: (pin: string) => Promise<boolean>;
  /** Chưa có admin config → lần đầu, cần đặt tên người ứng tiền */
  isFirstTime: boolean;
  adminName: string;
  onAdminNameChange: (value: string) => void;
}

const LEN = 6;

/** Thay AuthModal toàn màn hình. PIN là cửa vào chế độ ghi, không phải cổng chặn. */
export default function PinSheet({
  open,
  onClose,
  onSubmit,
  isFirstTime,
  adminName,
  onAdminNameChange,
}: PinSheetProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const press = async (digit: string) => {
    if (busy || pin.length >= LEN) return;
    const next = pin + digit;
    setError(false);
    setPin(next);

    if (next.length === LEN) {
      setBusy(true);
      const ok = await onSubmit(next);
      setBusy(false);
      if (ok) {
        setPin("");
      } else {
        setError(true);
        setPin("");
      }
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const keyClass =
    "min-h-[52px] border border-rule rounded-ctl font-mono text-[18px] " +
    "text-ink hover:border-ink hover:bg-paper-2 transition-colors";

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      header={
        <div>
          <h2 className="text-head font-semibold">
            {isFirstTime ? "Tạo mã quản trị" : "Đăng nhập quản trị"}
          </h2>
          <p className="text-body text-ink-2 mt-1.5 max-w-[38ch]">
            {isFirstTime
              ? "Đặt mã 6 số cho người giữ sổ. Người xem không cần mã này."
              : "Chỉ cần khi bạn muốn thêm hoặc sửa khoản chi. Xem thì không cần."}
          </p>
        </div>
      }
    >
      {isFirstTime && (
        <div className="border-t border-rule pt-4 mb-5">
          <label
            htmlFor="admin-name"
            className="eyebrow block mb-2"
          >
            TÊN NGƯỜI ỨNG TIỀN
          </label>
          <input
            id="admin-name"
            type="text"
            value={adminName}
            onChange={(e) => onAdminNameChange(e.target.value)}
            placeholder="Minh"
            className="w-full min-h-11 bg-transparent text-row outline-none
                       border-b border-rule-strong focus:border-ink placeholder:text-ink-3"
          />
        </div>
      )}

      <div className="border-t border-rule pt-5">
        <div className="flex gap-2">
          {Array.from({ length: LEN }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-[54px] grid place-items-center border rounded-ctl",
                "font-mono text-[20px] text-ink",
                error
                  ? "border-stamp"
                  : i === pin.length
                    ? "border-ink"
                    : "border-rule",
              )}
            >
              {i < pin.length ? "•" : ""}
            </div>
          ))}
        </div>

        <div
          aria-live="polite"
          className="font-mono text-eyebrow text-stamp mt-3 min-h-4"
        >
          {error ? "PIN KHÔNG ĐÚNG — THỬ LẠI" : ""}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={keyClass}
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin("");
              setError(false);
            }}
            aria-label="Xóa hết"
            className={cn(keyClass, "text-[12px] tracking-[0.1em]")}
          >
            XÓA
          </button>
          <button type="button" onClick={() => press("0")} className={keyClass}>
            0
          </button>
          <button
            type="button"
            onClick={() => {
              setPin((p) => p.slice(0, -1));
              setError(false);
            }}
            aria-label="Xóa một số"
            className={keyClass}
          >
            ⌫
          </button>
        </div>
      </div>
    </SheetShell>
  );
}
