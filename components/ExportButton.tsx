'use client';

import { Download, FileText, FileJson, Table } from 'lucide-react';
import toast from 'react-hot-toast';
import { Activity } from '@/types';
import { exportToCSV, exportToJSON, exportToExcel } from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
    try {
      if (type === 'csv') exportToCSV(activities);
      else if (type === 'json') exportToJSON(activities);
      else exportToExcel(activities);
      toast.success('📤 Đã xuất dữ liệu!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất dữ liệu. Vui lòng thử lại!');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-card/60 backdrop-blur px-3 h-9 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            aria-label="Xuất dữ liệu"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Xuất dữ liệu</span>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Chọn định dạng</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-credit-bg rounded-md flex items-center justify-center shrink-0">
            <Table className="w-3.5 h-3.5 text-credit" />
          </div>
          <div>
            <div className="font-medium text-sm">Excel (.xls)</div>
            <div className="text-xs text-muted-foreground">Bảng tính Excel</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">CSV (.csv)</div>
            <div className="text-xs text-muted-foreground">Google Sheets</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2.5 cursor-pointer">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center shrink-0">
            <FileJson className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm">JSON (.json)</div>
            <div className="text-xs text-muted-foreground">Sao lưu dữ liệu</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
