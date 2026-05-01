'use client';

import { Download, FileText, FileJson, Table } from 'lucide-react';
import { Activity } from '@/types';
import { exportToCSV, exportToJSON, exportToExcel } from '@/lib/exportUtils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  activities: Activity[];
}

export default function ExportButton({ activities }: ExportButtonProps) {
  if (activities.length === 0) return null;

  const handleExport = (type: 'csv' | 'json' | 'excel') => {
    switch (type) {
      case 'csv': exportToCSV(activities); break;
      case 'json': exportToJSON(activities); break;
      case 'excel': exportToExcel(activities); break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 h-9 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
          <Download className="w-4 h-4" />
          Xuất dữ liệu
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Chọn định dạng</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 rounded-md flex items-center justify-center shrink-0">
            <Table className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="font-medium text-sm">Excel (.xls)</div>
            <div className="text-xs text-muted-foreground">Bảng tính Excel</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-md flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-sm">CSV (.csv)</div>
            <div className="text-xs text-muted-foreground">Bảng tính CSV</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/40 rounded-md flex items-center justify-center shrink-0">
            <FileJson className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="font-medium text-sm">JSON (.json)</div>
            <div className="text-xs text-muted-foreground">Dữ liệu JSON</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
