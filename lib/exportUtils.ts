import { Activity } from '@/types';

export function exportToCSV(activities: Activity[]): void {
  if (activities.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  // CSV Header
  const headers = ['Hoạt động', 'Ngày', 'Tổng tiền', 'Người tham gia', 'Số tiền/người', 'Đã thanh toán'];
  
  // CSV Rows
  const rows = activities.flatMap(activity => 
    activity.participants.map(participant => [
      activity.title,
      new Date(activity.date).toLocaleDateString('vi-VN'),
      activity.totalAmount.toLocaleString('vi-VN'),
      participant.name,
      activity.amountPerPerson.toLocaleString('vi-VN'),
      participant.paid ? 'Đã thanh toán' : 'Chưa thanh toán'
    ])
  );

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `chi-tien-nhom-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(activities: Activity[]): void {
  if (activities.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const dataStr = JSON.stringify(activities, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `chi-tien-nhom-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(activities: Activity[]): void {
  if (activities.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  // Create HTML table
  const table = document.createElement('table');
  
  // Header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  ['Hoạt động', 'Ngày', 'Tổng tiền', 'Người tham gia', 'Số tiền/người', 'Đã thanh toán'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });

  // Body
  const tbody = table.createTBody();
  activities.forEach(activity => {
    activity.participants.forEach(participant => {
      const row = tbody.insertRow();
      [
        activity.title,
        new Date(activity.date).toLocaleDateString('vi-VN'),
        activity.totalAmount.toLocaleString('vi-VN') + ' đ',
        participant.name,
        activity.amountPerPerson.toLocaleString('vi-VN') + ' đ',
        participant.paid ? 'Đã thanh toán' : 'Chưa thanh toán'
      ].forEach(text => {
        const cell = row.insertCell();
        cell.textContent = text;
      });
    });
  });

  // Convert to Excel format
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Chia tiền nhóm</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #8b5cf6; color: white; font-weight: bold; }
        </style>
      </head>
      <body>${table.outerHTML}</body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `chi-tien-nhom-${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
