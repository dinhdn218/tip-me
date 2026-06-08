import { Activity, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { shareOf } from '@/lib/utils';

// ── Outstanding-debt report model (chỉ khoản CHƯA TRẢ) ───────────────────────
interface UnpaidActivity {
  title: string;
  date: string;
  category: string;
  amount: number;
}
interface PersonOwed {
  name: string;
  activities: UnpaidActivity[]; // chỉ các hoạt động người này CHƯA trả
  owed: number; // tổng còn nợ
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');
const fmtVN = (n: number) => Math.round(n).toLocaleString('vi-VN');
const catLabel = (c?: ActivityCategory) => CATEGORY_LABELS[(c ?? 'other') as ActivityCategory];

/** Chỉ lấy các khoản CHƯA trả, gom theo người, bỏ người đã thanh toán hết. */
function buildUnpaidReport(activities: Activity[]): PersonOwed[] {
  const map = new Map<string, PersonOwed>();
  activities.forEach((a) => {
    a.participants.forEach((p) => {
      if (p.paid) return; // chỉ khoản chưa trả
      const r = map.get(p.name) ?? { name: p.name, activities: [], owed: 0 };
      const amount = shareOf(a, p);
      r.activities.push({
        title: a.title,
        date: a.date,
        category: catLabel(a.category),
        amount,
      });
      r.owed += amount;
      map.set(p.name, r);
    });
  });
  return Array.from(map.values())
    .filter((r) => r.owed > 0) // chỉ người còn nợ
    .map((r) => ({
      ...r,
      activities: r.activities.sort(
        (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime(),
      ),
    }))
    .sort((a, b) => b.owed - a.owed);
}

function triggerDownload(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().split('T')[0];

// Escape a CSV cell: quote when it contains a comma, quote or newline.
function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const NO_DEBT_MSG = 'Tất cả đã thanh toán — không có khoản nợ nào để xuất!';

// ── CSV ──────────────────────────────────────────────────────────────────────
export function exportToCSV(activities: Activity[]): void {
  const report = buildUnpaidReport(activities);
  if (report.length === 0) {
    alert(NO_DEBT_MSG);
    return;
  }
  const headers = ['Người', 'Hoạt động chưa trả', 'Ngày', 'Danh mục', 'Số tiền (đ)'];
  const lines: string[][] = [headers];

  report.forEach((person) => {
    person.activities.forEach((act) => {
      lines.push([
        person.name,
        act.title,
        fmtDate(act.date),
        act.category,
        String(Math.round(act.amount)),
      ]);
    });
    lines.push([person.name, 'TỔNG CÒN NỢ', '', '', String(Math.round(person.owed))]);
  });

  const grandOwed = report.reduce((s, p) => s + p.owed, 0);
  lines.push(['TẤT CẢ', 'TỔNG NỢ TOÀN NHÓM', '', '', String(Math.round(grandOwed))]);

  const csv = lines.map((row) => row.map(csvCell).join(',')).join('\n');
  const BOM = '﻿';
  triggerDownload(
    new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' }),
    `cong-no-chua-thu-${today()}.csv`,
  );
}

// ── JSON ─────────────────────────────────────────────────────────────────────
export function exportToJSON(activities: Activity[]): void {
  const report = buildUnpaidReport(activities);
  if (report.length === 0) {
    alert(NO_DEBT_MSG);
    return;
  }
  const data = report.map((p) => ({
    name: p.name,
    owed: Math.round(p.owed),
    unpaidActivities: p.activities.map((a) => ({
      title: a.title,
      date: a.date,
      category: a.category,
      amount: Math.round(a.amount),
    })),
  }));
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `cong-no-chua-thu-${today()}.json`,
  );
}

// ── Excel (.xls via HTML table) ──────────────────────────────────────────────
export function exportToExcel(activities: Activity[]): void {
  const report = buildUnpaidReport(activities);
  if (report.length === 0) {
    alert(NO_DEBT_MSG);
    return;
  }
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const headerCells = ['Người', 'Hoạt động chưa trả', 'Ngày', 'Danh mục', 'Số tiền (đ)']
    .map((h) => `<th>${h}</th>`)
    .join('');

  const bodyRows = report
    .map((person) => {
      const actRows = person.activities
        .map(
          (a) => `
        <tr>
          <td>${esc(person.name)}</td>
          <td>${esc(a.title)}</td>
          <td>${fmtDate(a.date)}</td>
          <td>${esc(a.category)}</td>
          <td class="num">${Math.round(a.amount)}</td>
        </tr>`,
        )
        .join('');
      const totalRow = `
        <tr class="total">
          <td>${esc(person.name)}</td>
          <td colspan="3">TỔNG CÒN NỢ</td>
          <td class="num">${Math.round(person.owed)}</td>
        </tr>`;
      return actRows + totalRow;
    })
    .join('');

  const grandOwed = report.reduce((s, p) => s + p.owed, 0);

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
          <x:Name>Công nợ chưa thu</x:Name>
          <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 6px 10px; font-family: Arial, sans-serif; font-size: 13px; }
          th { background-color: #4f46e5; color: #fff; font-weight: bold; }
          td.num { text-align: right; mso-number-format:"\\#\\,\\#\\#0"; color: #e11d48; }
          tr.total td { background-color: #fff1f2; font-weight: bold; }
          tr.grand td { background-color: #4f46e5; color: #fff; font-weight: bold; }
        </style>
      </head>
      <body>
        <h3>Báo cáo công nợ chưa thu</h3>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>
            ${bodyRows}
            <tr class="grand">
              <td>TẤT CẢ</td><td colspan="3">TỔNG NỢ TOÀN NHÓM</td>
              <td class="num" style="color:#fff">${Math.round(grandOwed)}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`;

  triggerDownload(
    new Blob(['﻿', html], { type: 'application/vnd.ms-excel' }),
    `cong-no-chua-thu-${today()}.xls`,
  );
}
