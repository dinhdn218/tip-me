"use client";

import { useMemo, useState } from "react";
import type { Activity, ActivityCategory, Participant } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { money, plain } from "@/lib/ledgerSelectors";
import { markOf } from "@/components/CategoryMark";
import SheetShell from "@/components/SheetShell";
import { cn } from "@/lib/utils";

type SplitMode = "equal" | "percentage" | "exact";

interface QuickSplitWidgetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (activity: Activity) => void;
  existingParticipants: string[];
  /** Người ứng tiền — luôn được tick sẵn paid khi lưu */
  payerName: string;
}

const CATEGORIES: ActivityCategory[] = [
  "dining",
  "travel",
  "bills",
  "entertainment",
  "groceries",
  "other",
];

const QUICK_ADD = [50_000, 100_000, 500_000];

/**
 * Sheet ghi khoản mới. Thứ tự nhập theo cách người ta nói:
 * "một triệu hai bốn, lẩu, năm người".
 * Giữ đủ 3 chế độ chia; dòng "còn lại chưa chia" là bảo hiểm cho % và chính xác.
 */
export default function QuickSplitWidget({
  open,
  onClose,
  onAdd,
  existingParticipants,
  payerName,
}: QuickSplitWidgetProps) {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("dining");
  const [mode, setMode] = useState<SplitMode>("equal");
  const [picked, setPicked] = useState<string[]>([]);
  const [shares, setShares] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [extra, setExtra] = useState<string[]>([]);

  const roster = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of [payerName, ...existingParticipants, ...extra]) {
      const name = n.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
    }
    return out;
  }, [payerName, existingParticipants, extra]);

  const total = parseInt(amount || "0", 10) || 0;
  const count = picked.length;

  /** Phần tiền của từng người theo chế độ đang chọn. */
  const shareFor = (name: string): number => {
    if (!picked.includes(name)) return 0;
    if (mode === "equal") return count ? total / count : 0;
    const raw = parseFloat(shares[name] ?? "") || 0;
    if (mode === "percentage") return (raw / 100) * total;
    return raw;
  };

  const allocated = picked.reduce((s, n) => s + shareFor(n), 0);
  const remainder = total - allocated;
  const balanced = Math.abs(remainder) < 1;

  const canSave =
    title.trim() !== "" && total > 0 && count >= 1 && (mode === "equal" || balanced);

  const toggle = (name: string) =>
    setPicked((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const addPerson = () => {
    const name = newName.trim();
    if (!name || roster.includes(name)) {
      setNewName("");
      return;
    }
    setExtra((prev) => [...prev, name]);
    setPicked((prev) => [...prev, name]);
    setNewName("");
  };

  const save = () => {
    if (!canSave) return;

    const participants: Participant[] = picked.map((name) => {
      const base: Participant = { name, paid: name === payerName };
      // Chỉ ghi shareAmount cho chế độ chia riêng — chia đều dùng amountPerPerson,
      // nhờ đó splitLabel() phân biệt được "CHIA ĐỀU" và "CHIA RIÊNG".
      if (mode !== "equal") base.shareAmount = Math.round(shareFor(name));
      return base;
    });

    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      totalAmount: total,
      amountPerPerson: count ? Math.round(total / count) : 0,
      date: new Date().toISOString(),
      category,
      participants,
    });
    onClose();
  };

  const seg = (active: boolean) =>
    cn(
      "min-h-11 font-mono text-[12px] tracking-[0.1em] border transition-colors",
      active
        ? "bg-ink text-on-ink border-ink"
        : "border-rule text-ink-2 hover:border-ink hover:text-ink",
    );

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      header={<h2 className="text-head font-semibold">Ghi khoản mới</h2>}
      footer={
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="w-full min-h-[52px] bg-ink text-on-ink rounded-ctl
                     font-mono text-[13px] tracking-[0.1em] hover:opacity-90
                     disabled:opacity-40 transition-opacity"
        >
          LƯU VÀO SỔ
        </button>
      }
    >
      {/* 1. Số tiền */}
      <div className="border-t border-rule pt-4">
        <label htmlFor="split-amount" className="eyebrow block mb-1.5">
          SỐ TIỀN
        </label>
        <div className="flex items-baseline gap-2 border-b-2 border-ink">
          <input
            id="split-amount"
            type="text"
            inputMode="numeric"
            value={total ? plain(total).replace("đ", "") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="tnum flex-1 min-w-0 bg-transparent text-fig outline-none py-1
                       placeholder:text-ink-3"
          />
          <span className="text-head text-ink-3">đ</span>
        </div>
        <div className="flex gap-1.5 mt-2.5">
          {QUICK_ADD.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setAmount(String((parseInt(amount || "0", 10) || 0) + n))
              }
              className="min-h-10 px-3 border border-rule rounded-ctl font-mono text-[11px]
                         text-ink-2 hover:border-ink hover:text-ink transition-colors"
            >
              +{n / 1000}K
            </button>
          ))}
        </div>
      </div>

      {/* 2. Nội dung */}
      <div className="mt-6">
        <label htmlFor="split-title" className="eyebrow block mb-1.5">
          NỘI DUNG
        </label>
        <input
          id="split-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lẩu Kỳ Đồng"
          className="w-full bg-transparent text-row outline-none py-1.5
                     border-b border-rule-strong focus:border-ink placeholder:text-ink-3"
        />
      </div>

      {/* 3. Danh mục */}
      <div className="mt-6">
        <span className="eyebrow block mb-2">DANH MỤC</span>
        <div className="grid grid-cols-6 gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-label={CATEGORY_LABELS[c]}
              aria-pressed={category === c}
              className={cn(seg(category === c), "rounded-ctl")}
            >
              {markOf(c)}
            </button>
          ))}
        </div>
        <div className="font-mono text-eyebrow text-ink-3 mt-2">
          {CATEGORY_LABELS[category].toUpperCase()}
        </div>
      </div>

      {/* 4. Chia cho */}
      <div className="mt-6 flex items-baseline justify-between">
        <span className="eyebrow">
          CHIA CHO · {count} NGƯỜI
        </span>
        <button
          type="button"
          onClick={() =>
            setPicked(picked.length === roster.length ? [] : [...roster])
          }
          className="font-mono text-eyebrow tracking-[0.1em] text-stamp border-b border-stamp py-0.5"
        >
          {picked.length === roster.length ? "BỎ HẾT" : "CHỌN HẾT"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
        {(
          [
            ["equal", "ĐỀU"],
            ["percentage", "%"],
            ["exact", "CHÍNH XÁC"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={cn(seg(mode === key), "rounded-ctl")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 5. Danh sách người */}
      <div className="mt-3">
        {roster.map((name) => {
          const on = picked.includes(name);
          return (
            <div
              key={name}
              className={cn(
                "grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 py-2.5",
                "border-b border-rule min-h-14",
                !on && "opacity-50",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(name)}
                role="checkbox"
                aria-checked={on}
                aria-label={`Chia cho ${name}`}
                className={cn(
                  "w-6 h-6 min-h-6 grid place-items-center border rounded-ctl font-mono text-[13px]",
                  on
                    ? "bg-ink border-ink text-on-ink"
                    : "border-rule-strong text-transparent",
                )}
              >
                ✓
              </button>

              <span className="min-w-0 truncate text-body">
                {name}
                {name === payerName && (
                  <span className="text-ink-3"> · ứng tiền</span>
                )}
              </span>

              {!on ? (
                <span className="tnum text-body text-ink-3">—</span>
              ) : mode === "equal" ? (
                <span className="tnum text-body">{money(shareFor(name))}</span>
              ) : (
                <span className="flex items-baseline gap-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={shares[name] ?? ""}
                    onChange={(e) =>
                      setShares((prev) => ({
                        ...prev,
                        [name]: e.target.value.replace(/[^\d.]/g, ""),
                      }))
                    }
                    placeholder="0"
                    aria-label={`Phần của ${name}`}
                    className="tnum w-[104px] text-right bg-transparent text-body outline-none
                               border-b border-rule-strong focus:border-ink placeholder:text-ink-3"
                  />
                  <span className="text-ink-3 text-body">
                    {mode === "percentage" ? "%" : "đ"}
                  </span>
                </span>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-2 py-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPerson();
              }
            }}
            placeholder="Thêm người khác…"
            aria-label="Thêm người vào khoản này"
            className="flex-1 min-w-0 bg-transparent text-body outline-none py-1.5
                       border-b border-rule focus:border-ink placeholder:text-ink-3"
          />
          <button
            type="button"
            onClick={addPerson}
            className="min-h-11 px-3 border border-rule rounded-ctl font-mono text-[11px]
                       tracking-[0.1em] text-ink-2 hover:border-ink hover:text-ink transition-colors"
          >
            THÊM
          </button>
        </div>
      </div>

      {/* 6. Bảo hiểm cho % và chính xác */}
      <div className="rule-total mt-2 pt-3.5 flex items-baseline justify-between">
        <span className="eyebrow">CÒN LẠI CHƯA CHIA</span>
        {balanced ? (
          <span className="tnum text-row text-settled">0đ ✓</span>
        ) : (
          <span className="tnum text-row text-stamp">
            {remainder > 0 ? "−" : "+"}
            {money(Math.abs(remainder))}
          </span>
        )}
      </div>
    </SheetShell>
  );
}
