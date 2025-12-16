'use client';

import { Activity, DebtSummary as DebtSummaryType } from '@/types';
import { TrendingUp, TrendingDown, Users, Activity as ActivityIcon, CheckCircle, Clock } from 'lucide-react';

interface DebtSummaryProps {
  activities: Activity[];
}

export default function DebtSummary({ activities }: DebtSummaryProps) {
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
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full mb-6">
          <ActivityIcon className="w-12 h-12 text-violet-600 dark:text-violet-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
          Chưa có dữ liệu để tổng hợp
        </p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          Thêm hoạt động để xem báo cáo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-white/80" />
              <p className="text-sm text-white/90 font-medium">Tổng chi phí</p>
            </div>
            <p className="text-3xl font-black text-white">
              {totalDebt.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-white/80" />
              <p className="text-sm text-white/90 font-medium">Đã thu</p>
            </div>
            <p className="text-3xl font-black text-white">
              {totalPaid.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-white/80" />
              <p className="text-sm text-white/90 font-medium">Còn nợ</p>
            </div>
            <p className="text-3xl font-black text-white">
              {totalRemaining.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </div>

      {/* Individual Debts */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-7 h-7 text-violet-600" />
          Chi tiết từng người
        </h3>
        <div className="space-y-4">
          {debts.map((debt) => (
            <div
              key={debt.name}
              className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-violet-400 dark:hover:border-violet-600 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {debt.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-xl text-gray-800 dark:text-white">
                    {debt.name}
                  </h4>
                </div>
                {debt.remainingDebt === 0 ? (
                  <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    Đã thanh toán
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                    <Clock className="w-4 h-4" />
                    Còn nợ
                  </span>
                )}
              </div>
              
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="font-medium">Tổng phải trả:</span>
                  <span className="font-bold text-gray-800 dark:text-white text-lg">
                    {debt.totalDebt.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <span className="font-medium">Đã trả:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {debt.paidAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <span className="font-bold">Còn nợ:</span>
                  <span className="font-black text-orange-600 dark:text-orange-400 text-xl">
                    {debt.remainingDebt.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Tiến độ</span>
                  <span className="font-bold">
                    {((debt.paidAmount / debt.totalDebt) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${(debt.paidAmount / debt.totalDebt) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-2xl border-2 border-violet-200 dark:border-violet-800">
        <h4 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-lg">
          <TrendingUp className="w-6 h-6 text-violet-600" />
          Thống kê
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">Số người tham gia</p>
            <p className="text-3xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {debts.length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">Số hoạt động</p>
            <p className="text-3xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {activities.length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">Đã thanh toán đủ</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">
              {debts.filter(d => d.remainingDebt === 0).length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">Còn nợ</p>
            <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
              {debts.filter(d => d.remainingDebt > 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
