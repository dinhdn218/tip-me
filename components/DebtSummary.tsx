'use client';

import { useState } from 'react';
import { Activity, DebtSummary as DebtSummaryType } from '@/types';
import { TrendingUp, TrendingDown, Users, Activity as ActivityIcon, CheckCircle, Clock, Check } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface DebtSummaryProps {
  activities: Activity[];
  onMarkAllPaid?: (personName: string) => void;
  isAdmin?: boolean;
}

export default function DebtSummary({ activities, onMarkAllPaid, isAdmin }: DebtSummaryProps) {
  const [confirmMarkPaid, setConfirmMarkPaid] = useState<{ show: boolean; name: string; amount: number }>({
    show: false,
    name: '',
    amount: 0,
  });

  const handleMarkAllPaidClick = (name: string, amount: number) => {
    setConfirmMarkPaid({ show: true, name, amount });
  };

  const confirmMarkAllPaid = () => {
    if (onMarkAllPaid) {
      onMarkAllPaid(confirmMarkPaid.name);
    }
    setConfirmMarkPaid({ show: false, name: '', amount: 0 });
  };

  const cancelMarkPaid = () => {
    setConfirmMarkPaid({ show: false, name: '', amount: 0 });
  };

  const calculateDebts = (): DebtSummaryType[] => {
    const debts = new Map<string, { total: number; paid: number }>();

    activities.forEach(activity => {
      activity.participants.forEach(participant => {
        const current = debts.get(participant.name) || { total: 0, paid: 0 };
        debts.set(participant.name, {
          total: current.total + activity.amountPerPerson,
          paid: current.paid + (participant.paid ? activity.amountPerPerson : 0),
        });
      });
    });

    return Array.from(debts.entries())
      .map(([name, { total, paid }]) => ({
        name,
        totalDebt: total,
        paidAmount: paid,
        remainingDebt: total - paid,
      }))
      .sort((a, b) => b.remainingDebt - a.remainingDebt);
  };

  const debts = calculateDebts();
  const totalDebt = debts.reduce((sum, d) => sum + d.totalDebt, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalRemaining = debts.reduce((sum, d) => sum + d.remainingDebt, 0);

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
          <ActivityIcon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
          Chưa có dữ liệu để tổng hợp
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Thêm hoạt động để xem báo cáo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-blue-600 rounded-xl">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
            <p className="text-xs sm:text-sm text-blue-100 font-medium">Tổng chi phí</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white break-words">
            {totalDebt.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div className="p-4 sm:p-5 bg-green-600 rounded-xl">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
            <p className="text-xs sm:text-sm text-green-100 font-medium">Đã thu</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white break-words">
            {totalPaid.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div className="p-4 sm:p-5 bg-orange-600 rounded-xl">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-200" />
            <p className="text-xs sm:text-sm text-orange-100 font-medium">Còn nợ</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white break-words">
            {totalRemaining.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Individual Debts */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          Chi tiết từng người
        </h3>
        <div className="space-y-3">
          {debts.map((debt) => (
            <div
              key={debt.name}
              className="p-4 sm:p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-violet-400 dark:hover:border-violet-600 transition-colors bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                    {debt.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {debt.name}
                  </h4>
                </div>
                {debt.remainingDebt === 0 ? (
                  <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg flex-shrink-0">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Đã thanh toán</span>
                    <span className="sm:hidden">Xong</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-600 text-white text-xs sm:text-sm font-semibold rounded-lg flex-shrink-0">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Còn nợ</span>
                    <span className="sm:hidden">Nợ</span>
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-750 rounded-lg gap-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Tổng phải trả:</span>
                  <span className="font-bold text-gray-900 dark:text-white break-words text-right">
                    {debt.totalDebt.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Đã trả:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 break-words text-right">
                    {debt.paidAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Còn nợ:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 text-base sm:text-lg break-words text-right">
                    {debt.remainingDebt.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Tiến độ</span>
                  <span className="font-semibold">
                    {((debt.paidAmount / debt.totalDebt) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-green-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(debt.paidAmount / debt.totalDebt) * 100}%` }}
                  />
                </div>
              </div>

              {/* Mark All Paid Button */}
              {isAdmin && debt.remainingDebt > 0 && (
                <button
                  onClick={() => handleMarkAllPaidClick(debt.name, debt.remainingDebt)}
                  className="mt-3 sm:mt-4 w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Đánh dấu đã thanh toán hết</span>
                  <span className="sm:hidden">Đã thanh toán</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="p-4 sm:p-5 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" />
          Thống kê
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Số người tham gia</p>
            <p className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
              {debts.length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Số hoạt động</p>
            <p className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
              {activities.length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Đã thanh toán đủ</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {debts.filter(d => d.remainingDebt === 0).length}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Còn nợ</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {debts.filter(d => d.remainingDebt > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Mark Paid Dialog */}
      {confirmMarkPaid.show && (
        <ConfirmDialog
          title="Xác nhận đã thanh toán"
          message={`Bạn xác nhận "${confirmMarkPaid.name}" đã thanh toán hết số tiền ${confirmMarkPaid.amount.toLocaleString('vi-VN')}đ? Tất cả các khoản nợ của người này sẽ được đánh dấu là đã thanh toán.`}
          onConfirm={confirmMarkAllPaid}
          onCancel={cancelMarkPaid}
          confirmText="Xác nhận"
          cancelText="Hủy"
          type="success"
        />
      )}
    </div>
  );
}
