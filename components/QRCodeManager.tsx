"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { PaymentQR } from "@/types";

interface QRCodeManagerProps {
  paymentQR: PaymentQR | null;
  onUpdate: (qr: PaymentQR) => void;
  isAdmin: boolean;
}

/**
 * Sống trong Sổ tay, không còn là một tab. Admin tải ảnh + nhập thông tin bank;
 * viewer chỉ đọc — cùng một component, hai trạng thái.
 */
export default function QRCodeManager({
  paymentQR,
  onUpdate,
  isAdmin,
}: QRCodeManagerProps) {
  const [imageUrl, setImageUrl] = useState(paymentQR?.imageUrl ?? "");
  const [bankName, setBankName] = useState(paymentQR?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(
    paymentQR?.accountNumber ?? "",
  );
  const [accountName, setAccountName] = useState(paymentQR?.accountName ?? "");

  // Firestore đẩy bản mới về → đồng bộ form ngay trong lúc render (không dùng
  // effect: tránh một lượt render thừa hiển thị dữ liệu cũ).
  const stamp = JSON.stringify(paymentQR ?? null);
  const [synced, setSynced] = useState(stamp);
  if (synced !== stamp) {
    setSynced(stamp);
    setImageUrl(paymentQR?.imageUrl ?? "");
    setBankName(paymentQR?.bankName ?? "");
    setAccountNumber(paymentQR?.accountNumber ?? "");
    setAccountName(paymentQR?.accountName ?? "");
  }

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!imageUrl) {
      toast.error("Cần tải lên ảnh QR trước đã");
      return;
    }
    onUpdate({
      imageUrl,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountName: accountName.trim() || undefined,
    });
  };

  const preview = (
    <div className="flex justify-center">
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
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
          {isAdmin ? "CHƯA TẢI LÊN" : "ADMIN TẢI LÊN"}
        </div>
      )}
    </div>
  );

  /* ---- Viewer: chỉ đọc ------------------------------------------------- */
  if (!isAdmin) {
    const rows = [
      { label: "NGÂN HÀNG", value: paymentQR?.bankName, mono: false },
      { label: "SỐ TÀI KHOẢN", value: paymentQR?.accountNumber, mono: true },
      { label: "CHỦ TÀI KHOẢN", value: paymentQR?.accountName, mono: false },
    ].filter((r) => r.value);

    return (
      <div>
        {preview}
        {rows.length > 0 ? (
          <div className="mt-5">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between gap-3 py-3 border-t border-rule"
              >
                <span className="font-mono text-eyebrow text-ink-2">
                  {r.label}
                </span>
                <span
                  className={`text-body font-medium text-right break-all ${
                    r.mono ? "tnum" : ""
                  }`}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body text-ink-2 text-center mt-5">
            Admin chưa thiết lập thông tin chuyển khoản.
          </p>
        )}
      </div>
    );
  }

  /* ---- Admin: sửa được -------------------------------------------------- */
  const field = (
    id: string,
    label: string,
    value: string,
    set: (v: string) => void,
    placeholder: string,
    mono = false,
  ) => (
    <div className="py-3 border-t border-rule">
      <label htmlFor={id} className="eyebrow block mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent text-body outline-none py-1
                    border-b border-rule-strong focus:border-ink placeholder:text-ink-3 ${
                      mono ? "tnum" : ""
                    }`}
      />
    </div>
  );

  return (
    <div>
      {preview}

      <div className="flex gap-1.5 mt-4">
        <label
          className="flex-1 min-h-11 grid place-items-center border border-rule rounded-ctl
                     font-mono text-[11px] tracking-[0.1em] text-ink-2 cursor-pointer
                     hover:border-ink hover:text-ink transition-colors"
        >
          {imageUrl ? "ĐỔI ẢNH QR" : "TẢI ẢNH QR"}
          <input
            type="file"
            accept="image/*"
            onChange={upload}
            className="sr-only"
          />
        </label>
        {imageUrl && (
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="min-h-11 px-3 border border-stamp text-stamp rounded-ctl
                       font-mono text-[11px] tracking-[0.1em] hover:bg-stamp-wash transition-colors"
          >
            XÓA ẢNH
          </button>
        )}
      </div>

      <div className="mt-4">
        {field("qr-bank", "NGÂN HÀNG", bankName, setBankName, "Vietcombank")}
        {field(
          "qr-number",
          "SỐ TÀI KHOẢN",
          accountNumber,
          setAccountNumber,
          "0011001234567",
          true,
        )}
        {field(
          "qr-owner",
          "CHỦ TÀI KHOẢN",
          accountName,
          setAccountName,
          "NGUYEN VAN MINH",
        )}
      </div>

      <button
        type="button"
        onClick={save}
        className="w-full mt-5 min-h-[52px] bg-ink text-on-ink rounded-ctl
                   font-mono text-[13px] tracking-[0.1em] hover:opacity-90 transition-opacity"
      >
        LƯU THÔNG TIN
      </button>
    </div>
  );
}
