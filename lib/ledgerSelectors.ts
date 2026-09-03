/**
 * lib/ledgerSelectors.ts — mọi giá trị dẫn xuất của màn Sổ.
 *
 * Đây là code thật, drop-in. Lý do tách ra một file:
 * mọi con số tiền trong app phải đi qua ĐÚNG MỘT đường — shareOf() —
 * nên đặt hết công thức ở đây, component chỉ đọc kết quả.
 *
 * KHÔNG BAO GIỜ tính lại bằng totalAmount / participants.length:
 * sẽ sai với bill chia theo % hoặc chia chính xác.
 *
 * Dùng trong app/page.tsx:
 *   const ledger = useMemo(() => buildLedger(activities, payerName), [activities, payerName]);
 */

import type { Activity } from '@/types';
import { shareOf } from '@/lib/utils';

/* ---------- Tổng của nhóm ---------------------------------------------- */

export interface GroupTotals {
  total: number;        // tổng chi
  collected: number;    // đã thu (tổng phần của những người đã tick paid)
  outstanding: number;  // còn nợ
  pct: number;          // % đã thu, 0–100, đã làm tròn
}

export function groupTotals(activities: Activity[]): GroupTotals {
  let total = 0;
  let collected = 0;

  for (const a of activities) {
    total += a.totalAmount;
    for (const p of a.participants) {
      if (p.paid) collected += shareOf(a, p);
    }
  }

  const outstanding = Math.max(0, total - collected);
  return {
    total,
    collected,
    outstanding,
    pct: total ? Math.round((collected / total) * 100) : 0,
  };
}

/* ---------- Theo từng người -------------------------------------------- */

/** Số tiền một người còn nợ = tổng phần chưa tick paid của người đó. */
export function owedBy(activities: Activity[], name: string): number {
  let sum = 0;
  for (const a of activities) {
    for (const p of a.participants) {
      if (p.name === name && !p.paid) sum += shareOf(a, p);
    }
  }
  return sum;
}

export interface PersonCounts {
  unpaid: number;
  total: number;
}

export function countsFor(activities: Activity[], name: string): PersonCounts {
  let unpaid = 0;
  let total = 0;
  for (const a of activities) {
    for (const p of a.participants) {
      if (p.name !== name) continue;
      total++;
      if (!p.paid) unpaid++;
    }
  }
  return { unpaid, total };
}

/** Danh sách tên xuất hiện trong dữ liệu (nguồn cho dải "Bạn là ai?"). */
export function roster(activities: Activity[]): string[] {
  const seen = new Set<string>();
  for (const a of activities) {
    for (const p of a.participants) seen.add(p.name);
  }
  return Array.from(seen);
}

/* ---------- Dòng "Ai nợ ai" -------------------------------------------- */

export interface PersonRow {
  name: string;
  initials: string;      // 2 chữ cái cho ô vuông avatar
  owed: number;
  unpaidCount: number;
  totalCount: number;
  settled: boolean;      // đã trả xong tất cả
  isPayer: boolean;      // người ứng tiền — luôn ở cuối, phía trên có kẻ đôi
  isMe: boolean;         // nền --stamp-wash + thẻ "BẠN"
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Sắp theo số tiền nợ giảm dần. KHÔNG có hạng, KHÔNG huy chương —
 * sổ ghi chép, không phán xét.
 * Người ứng tiền tách riêng và luôn xếp cuối.
 */
export function personRows(
  activities: Activity[],
  payerName: string,
  me: string | null,
): PersonRow[] {
  const names = roster(activities);

  const rows: PersonRow[] = names
    .filter((n) => n !== payerName)
    .map((name) => {
      const counts = countsFor(activities, name);
      const owed = owedBy(activities, name);
      return {
        name,
        initials: initials(name),
        owed,
        unpaidCount: counts.unpaid,
        totalCount: counts.total,
        settled: owed === 0,
        isPayer: false,
        isMe: name === me,
      };
    })
    .sort((a, b) => b.owed - a.owed);

  if (names.includes(payerName)) {
    const counts = countsFor(activities, payerName);
    rows.push({
      name: payerName,
      initials: initials(payerName),
      // Người ứng tiền: con số hiển thị là CÒN PHẢI THU của cả nhóm
      owed: groupTotals(activities).outstanding,
      unpaidCount: counts.unpaid,
      totalCount: counts.total,
      settled: false,
      isPayer: true,
      isMe: payerName === me,
    });
  }

  return rows;
}

/* ---------- Hoạt động: nhóm theo tháng --------------------------------- */

export interface ActivityRow {
  activity: Activity;
  paidCount: number;
  done: boolean;
  /** "01.09" */
  dayLabel: string;
  /** "01.09 · 4 NGƯỜI · CHIA CHÍNH XÁC" */
  metaLabel: string;
  /** "1/4 ĐÃ TRẢ" hoặc "XONG ✓" */
  progressLabel: string;
}

export interface MonthGroup {
  /** "THÁNG 9 · 2026" */
  label: string;
  sum: number;
  rows: ActivityRow[];
}

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/**
 * Nhãn cách chia. Suy ra từ dữ liệu vì Activity không có field splitMode:
 * không ai có shareAmount → chia đều; có → % hoặc chính xác (hiển thị chung
 * là "CHIA RIÊNG" nếu bạn không muốn đoán).
 */
export function splitLabel(a: Activity): string {
  const custom = a.participants.some((p) => p.shareAmount != null);
  return custom ? 'CHIA RIÊNG' : 'CHIA ĐỀU';
}

export function activityRow(a: Activity): ActivityRow {
  const paidCount = a.participants.filter((p) => p.paid).length;
  const done = paidCount === a.participants.length && a.participants.length > 0;
  const dd = a.date.slice(8, 10);
  const mm = a.date.slice(5, 7);

  return {
    activity: a,
    paidCount,
    done,
    dayLabel: `${dd}.${mm}`,
    metaLabel: `${dd}.${mm} · ${a.participants.length} NGƯỜI · ${splitLabel(a)}`,
    progressLabel: done ? 'XONG ✓' : `${paidCount}/${a.participants.length} ĐÃ TRẢ`,
  };
}

/** Số tiền còn phải thu của một khoản (dùng cho dòng kẻ đôi trong sheet). */
export function activityDue(a: Activity): number {
  let due = 0;
  for (const p of a.participants) {
    if (!p.paid) due += shareOf(a, p);
  }
  return due;
}

export interface ActivityFilter {
  query: string;
  category: string; // 'all' | ActivityCategory
}

export function filterActivities(activities: Activity[], f: ActivityFilter): Activity[] {
  const q = f.query.trim().toLowerCase();

  return activities
    .filter((a) => {
      if (f.category !== 'all' && a.category !== f.category) return false;
      if (!q) return true;
      if (a.title.toLowerCase().includes(q)) return true;
      // Tìm cả theo tên người — chủ ý, không phải phụ phẩm
      return a.participants.some((p) => p.name.toLowerCase().includes(q));
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function monthGroups(activities: Activity[]): MonthGroup[] {
  const groups: MonthGroup[] = [];

  for (const a of activities) {
    const label = `THÁNG ${MONTHS[parseInt(a.date.slice(5, 7), 10) - 1]} · ${a.date.slice(0, 4)}`;
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, sum: 0, rows: [] };
      groups.push(g);
    }
    g.sum += a.totalAmount;
    g.rows.push(activityRow(a));
  }

  return groups;
}

/* ---------- Định dạng tiền --------------------------------------------- */

/** "1.373.000đ" */
export function money(n: number): string {
  return Math.round(n).toLocaleString('vi-VN') + 'đ';
}

/** "1.373.000" — cho dải tổng và nút copy */
export function plain(n: number): string {
  return Math.round(n).toLocaleString('vi-VN');
}

/**
 * Tiền có dấu. Dấu −/+ là MỘT trong ba tầng phân biệt vào/ra
 * (dấu · nhãn chữ · viền liền/gạch) nên không được bỏ.
 */
export function signed(n: number, direction: 'out' | 'in'): string {
  if (n === 0) return '0đ ✓';
  return (direction === 'out' ? '−' : '+') + money(n);
}

/* ---------- Gói chung cho page.tsx ------------------------------------- */

export function buildLedger(
  activities: Activity[],
  payerName: string,
  me: string | null,
) {
  const totals = groupTotals(activities);
  const rows = personRows(activities, payerName, me);
  const myOwed = me ? owedBy(activities, me) : 0;
  const iAmPayer = me === payerName;

  return {
    ...totals,
    rows,
    roster: roster(activities),
    myOwed,
    iAmPayer,
    myCounts: me ? countsFor(activities, me) : { unpaid: 0, total: 0 },
    /** Số tiền nút thanh dưới sẽ mời trả */
    payTarget: me && !iAmPayer ? myOwed : totals.outstanding,
    peopleUnsettled: rows.filter((r) => !r.isPayer && !r.settled).length,
    recent: activities
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 3)
      .map(activityRow),
  };
}
