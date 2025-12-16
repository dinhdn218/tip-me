'use client';

import { useState } from 'react';
import { Download, FileText, FileJson, Table } from 'lucide-react';
import { Activity } from '@/types';
import { exportToCSV, exportToJSON, exportToExcel } from '@/lib/exportUtils';

interface ExportButtonProps {
  activities: Activity[];
}

export default function ExportButton({ activities }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (type: 'csv' | 'json' | 'excel') => {
    switch (type) {
      case 'csv':
        exportToCSV(activities);
        break;
      case 'json':
        exportToJSON(activities);
        break;
      case 'excel':
        exportToExcel(activities);
        break;
    }
    setShowMenu(false);
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
      >
        <Download className="w-5 h-5" />
        Xuất dữ liệu
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20 animate-scale-in">
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-lg flex items-center justify-center">
                <Table className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">Excel (.xls)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Định dạng Excel</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">CSV (.csv)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bảng tính CSV</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center">
                <FileJson className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">JSON (.json)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Dữ liệu JSON</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
