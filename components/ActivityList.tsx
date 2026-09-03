"use client";

import type { Activity, ActivityCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import type { MonthGroup } from "@/lib/ledgerSelectors";
import { plain } from "@/lib/ledgerSelectors";
import CategoryMark, { markOf } from "@/components/CategoryMark";
import Money from "@/components/Money";
import { cn } from "@/lib/utils";

const CATEGORIES: ActivityCategory[] = [
  "dining",
  "travel",
  "bills",
  "entertainment",
  "groceries",
  "other",
];

interface ActivityListProps {
  /** Đã lọc và nhóm theo tháng ở page.tsx */
  groups: MonthGroup[];
  /** Toàn bộ hoạt động — để đếm số lượng cho chip danh mục */
  all: Activity[];
  query: string;
  onQuery: (value: string) => void;
  category: ActivityCategory | "all";
  onCategory: (value: ActivityCategory | "all") => void;
  onOpen: (activity: Activity) => void;
}

export default function ActivityList({
  groups,
  all,
  query,
  onQuery,
  category,
  onCategory,
  onOpen,
}: ActivityListProps) {
  const counts = new Map<ActivityCategory, number>();
  for (const a of all) {
    const c = (a.category ?? "other") as ActivityCategory;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }

  const shownCount = groups.reduce((n, g) => n + g.rows.length, 0);
  const shownSum = groups.reduce((n, g) => n + g.sum, 0);
  const hasFilter = query.trim() !== "" || category !== "all";

  const chip = (active: boolean) =>
    cn(
      "font-mono text-[11px] tracking-[0.08em] rounded-ctl px-2.5 py-2 min-h-9 border transition-colors",
      active
        ? "bg-ink text-on-ink border-ink"
        : "border-rule text-ink-2 hover:border-ink hover:text-ink",
    );

  return (
    <div>
      {/* Tìm */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 border border-rule-strong rounded-ctl px-3 min-h-11">
          <span aria-hidden className="text-ink-3">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm khoản chi, tên người…"
            aria-label="Tìm khoản chi"
            className="flex-1 bg-transparent text-body outline-none placeholder:text-ink-3"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Xóa tìm kiếm"
              className="text-ink-3 hover:text-ink min-h-0"
            >
              ✕
            </button>
          )}
        </div>

        {/* Chip danh mục — chỉ hiện danh mục có dữ liệu */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <button
            type="button"
            onClick={() => onCategory("all")}
            className={chip(category === "all")}
          >
            TẤT CẢ · {all.length}
          </button>
          {CATEGORIES.filter((c) => counts.get(c)).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategory(c)}
              aria-label={CATEGORY_LABELS[c]}
              className={chip(category === c)}
            >
              {markOf(c)} · {counts.get(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Nhóm theo tháng */}
      {groups.map((g) => (
        <div key={g.label}>
          <div className="bg-paper-2 border-t border-rule px-5 py-2.5 flex items-baseline justify-between">
            <span className="font-mono text-eyebrow text-ink-2">{g.label}</span>
            <span className="tnum font-mono text-eyebrow text-ink-2">
              {plain(g.sum)}đ
            </span>
          </div>
          <div className="px-5">
            {g.rows.map((r) => (
              <button
                key={r.activity.id}
                type="button"
                onClick={() => onOpen(r.activity)}
                className="w-full text-left grid grid-cols-[30px_minmax(0,1fr)_auto] items-start
                           gap-3 py-3.5 border-b border-rule"
              >
                <CategoryMark category={r.activity.category} size={30} />
                <span className="min-w-0">
                  <span className="block text-row font-medium truncate">
                    {r.activity.title}
                  </span>
                  <span className="block font-mono text-eyebrow text-ink-2 mt-1">
                    {r.metaLabel}
                  </span>
                </span>
                <span className="text-right">
                  <Money
                    value={r.activity.totalAmount}
                    className="block text-row"
                  />
                  <span
                    className={cn(
                      "block font-mono text-eyebrow mt-1",
                      r.done ? "text-settled" : "text-ink-3",
                    )}
                  >
                    {r.progressLabel}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Không khớp bộ lọc */}
      {shownCount === 0 && (
        <div className="px-6 py-11 text-center">
          <div className="eyebrow text-ink-3">KHÔNG KHỚP</div>
          <p className="text-body text-ink-2 mt-3">
            Không có khoản nào khớp bộ lọc hiện tại.
          </p>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                onQuery("");
                onCategory("all");
              }}
              className="mt-5 min-h-11 px-5 border border-ink rounded-ctl
                         font-mono text-[12px] tracking-[0.1em] hover:bg-paper-2 transition-colors"
            >
              BỎ BỘ LỌC
            </button>
          )}
        </div>
      )}

      {/* Dòng tổng cuối */}
      {shownCount > 0 && (
        <div className="rule-total mx-5 mt-4 pt-3.5 pb-6 flex items-baseline justify-between">
          <span className="eyebrow">TỔNG {shownCount} KHOẢN</span>
          <Money value={shownSum} className="text-head" />
        </div>
      )}
    </div>
  );
}
