'use client';

import { Activity } from '@/types';
import { TrendingUp, Users, DollarSign, Clock, Calendar } from 'lucide-react';

interface OverviewProps {
  activities: Activity[];
}

export default function Overview({ activities }: OverviewProps) {
  const totalSpent = activities.reduce((sum, act) => sum + act.totalAmount, 0);
  const totalActivities = activities.length;
  
  const allParticipants = new Set<string>();
  activities.forEach(act => {
    act.participants.forEach(p => allParticipants.add(p.name));
  });
  
  const totalPaid = activities.reduce((sum, act) => {
    return sum + act.participants.filter(p => p.paid).length * act.amountPerPerson;
  }, 0);
  
  const totalUnpaid = totalSpent - totalPaid;
  
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-[1.03] cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-300/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/95 font-semibold tracking-tight">Tổng hoạt động</p>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">{totalActivities}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-purple-600 via-violet-500 to-purple-500 rounded-3xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-[1.03] cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-300/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/95 font-semibold tracking-tight">Số người</p>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">{allParticipants.size}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 rounded-3xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 hover:scale-[1.03] cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-300/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/95 font-semibold tracking-tight">Tổng chi</p>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{totalSpent.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-500 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-[1.03] cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-300/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-white/95 font-semibold tracking-tight">Đã thu</p>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{totalPaid.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="relative overflow-hidden p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-6 tracking-tight">Tiến độ thu tiền</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-semibold">
              <span>Đã thu: {totalPaid.toLocaleString('vi-VN')}đ</span>
              <span>Còn lại: {totalUnpaid.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="relative w-full h-8 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-lg flex items-center justify-end pr-4"
                style={{ width: `${totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0}%` }}
              >
                <span className="text-sm font-black text-white drop-shadow-lg">
                  {totalSpent > 0 ? ((totalPaid / totalSpent) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="relative overflow-hidden p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-3 tracking-tight">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Hoạt động gần đây
              </h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const paidCount = activity.participants.filter(p => p.paid).length;
                const totalCount = activity.participants.length;
                const allPaid = paidCount === totalCount;

                return (
                  <div
                    key={activity.id}
                    className="group flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-white tracking-tight">{activity.title}</h4>
                        {allPaid && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                            ✓ Hoàn tất
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(activity.date).toLocaleDateString('vi-VN')} • {activity.participants.length} người
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {activity.totalAmount.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                        {paidCount}/{totalCount} đã trả
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full mb-6">
            <Calendar className="w-12 h-12 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
            Chưa có hoạt động nào
          </p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Thêm hoạt động đầu tiên để bắt đầu!
          </p>
        </div>
      )}
    </div>
  );
}
