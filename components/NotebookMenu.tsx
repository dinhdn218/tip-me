"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Activity, PaymentQR } from "@/types";
import { exportToCSV, exportToExcel, exportToJSON } from "@/lib/exportUtils";
import SheetShell from "@/components/SheetShell";
import QRCodeManager from "@/components/QRCodeManager";
import { cn } from "@/lib/utils";

interface NotebookMenuProps {
  open: boolean;
  onClose: () => void;
  me: string | null;
  onClearMe: () => void;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  activities: Activity[];
  paymentQR: PaymentQR | null;
  onUpdateQR: (qr: PaymentQR) => void;
}

type Panel = null | "qr" | "export";

/** Thay avatar menu + tab QR + nút export. Năm dòng, không hơn. */
export default function NotebookMenu({
  open,
  onClose,
  me,
  onClearMe,
  isAdmin,
  onLogin,
  onLogout,
  theme,
  onToggleTheme,
  activities,
  paymentQR,
  onUpdateQR,
}: NotebookMenuProps) {
  const [panel, setPanel] = useState<Panel>(null);

  const close = () => {
    setPanel(null);
    onClose();
  };

  const doExport = (kind: "excel" | "csv" | "json") => {
    try {
      if (kind === "excel") exportToExcel(activities);
      else if (kind === "csv") exportToCSV(activities);
      else exportToJSON(activities);
      toast.success("Đã xuất dữ liệu");
    } catch {
      toast.error("Lỗi khi xuất dữ liệu — thử lại nhé");
    }
  };

  const row = (
    label: string,
    hint: string,
    value: string,
    onClick: () => void,
    tone?: "stamp",
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className="w-full text-left grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3
                 min-h-14 py-2 border-b border-rule"
    >
      <span className="min-w-0">
        <span className="block text-[16px] font-medium truncate">{label}</span>
        <span className="block font-mono text-eyebrow text-ink-3 mt-0.5 truncate">
          {hint}
        </span>
      </span>
      <span
        className={cn(
          "font-mono text-[12px] shrink-0",
          tone === "stamp" ? "text-stamp" : "text-ink-2",
        )}
      >
        {value}
      </span>
    </button>
  );

  if (panel === "qr") {
    return (
      <SheetShell
        open={open}
        onClose={close}
        header={
          <div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="font-mono text-eyebrow text-ink-2 hover:text-ink min-h-0"
            >
              ← SỔ TAY
            </button>
            <h2 className="text-head font-semibold mt-1.5">QR nhóm</h2>
          </div>
        }
      >
        <div className="border-t border-rule pt-4">
          <QRCodeManager
            paymentQR={paymentQR}
            onUpdate={onUpdateQR}
            isAdmin={isAdmin}
          />
        </div>
      </SheetShell>
    );
  }

  if (panel === "export") {
    return (
      <SheetShell
        open={open}
        onClose={close}
        header={
          <div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="font-mono text-eyebrow text-ink-2 hover:text-ink min-h-0"
            >
              ← SỔ TAY
            </button>
            <h2 className="text-head font-semibold mt-1.5">Xuất dữ liệu</h2>
          </div>
        }
      >
        <div className="border-t border-rule pt-4">
          {(
            [
              ["Excel", "Mở bằng Excel · .xls", "excel"],
              ["CSV", "Google Sheets · .csv", "csv"],
              ["JSON", "Sao lưu nguyên vẹn · .json", "json"],
            ] as const
          ).map(([label, hint, kind]) =>
            row(label, hint, "TẢI →", () => doExport(kind)),
          )}
          {activities.length === 0 && (
            <p className="text-body text-ink-2 mt-4">
              Sổ đang trống — chưa có gì để xuất.
            </p>
          )}
        </div>
      </SheetShell>
    );
  }

  return (
    <SheetShell
      open={open}
      onClose={close}
      header={<h2 className="text-head font-semibold">Sổ tay</h2>}
    >
      <div className="border-t border-rule pt-1">
        {row(
          "Bạn là ai",
          me ? "Chạm để chọn lại tên" : "Chọn tên để thấy số của mình",
          me ? me.toUpperCase() : "CHƯA CHỌN",
          () => {
            onClearMe();
            close();
          },
          me ? undefined : "stamp",
        )}

        {isAdmin
          ? row("Thoát quản trị", "Về chế độ chỉ xem", "THOÁT", () => {
              onLogout();
              close();
            })
          : row(
              "Đăng nhập quản trị",
              "Cần mã PIN để thêm hoặc sửa khoản",
              "PIN →",
              () => {
                close();
                onLogin();
              },
            )}

        {row(
          "Giao diện",
          "Sáng hoặc tối, lưu trên máy này",
          theme === "dark" ? "TỐI" : "SÁNG",
          onToggleTheme,
        )}

        {row(
          "QR nhóm",
          isAdmin ? "Tải ảnh QR và thông tin bank" : "Xem thông tin chuyển khoản",
          "MỞ →",
          () => setPanel("qr"),
        )}

        {row("Xuất dữ liệu", "Excel · CSV · JSON", "MỞ →", () =>
          setPanel("export"),
        )}
      </div>
    </SheetShell>
  );
}
