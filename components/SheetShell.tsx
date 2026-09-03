"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SheetShellProps {
  open: boolean;
  onClose: () => void;
  /** Tiêu đề trái — chuỗi hoặc JSX (header hoạt động có chữ ký danh mục) */
  header: React.ReactNode;
  children: React.ReactNode;
  /** Chân sheet dính đáy (các nút hành động) */
  footer?: React.ReactNode;
}

/**
 * Quy tắc lớp phủ duy nhất của app:
 * mobile = bottom sheet, desktop ≥1024px = side sheet phải rộng 420px.
 * AlertDialog chỉ dành cho xác nhận phá hủy.
 */
export default function SheetShell({
  open,
  onClose,
  header,
  children,
  footer,
}: SheetShellProps) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={desktop ? "right" : "bottom"}
        showCloseButton={false}
        className={cn(
          "bg-paper text-ink p-0 gap-0 border-rule-strong shadow-sheet",
          desktop
            ? "w-full sm:max-w-[420px] h-full"
            : "max-h-[92%] rounded-t-sheet",
        )}
      >
        {!desktop && (
          <span
            aria-hidden
            className="mx-auto mt-2 mb-3 block w-10 h-1 rounded-[2px] bg-rule-strong"
          />
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-5 pb-5">
            <div className="flex items-start justify-between gap-3 pt-2 pb-4">
              <div className="min-w-0">{header}</div>
              <SheetClose
                render={
                  <button
                    type="button"
                    aria-label="Đóng"
                    className="w-10 h-10 shrink-0 grid place-items-center border border-rule
                               rounded-ctl text-ink-2 hover:border-ink transition-colors"
                  >
                    ✕
                  </button>
                }
              />
            </div>
            {children}
          </div>
        </div>

        {footer && (
          <div className="flex-none border-t border-rule-strong px-5 pt-3 pb-safe">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
