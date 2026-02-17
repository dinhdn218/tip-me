'use client';

import { Activity } from '@/types';
import { TrendingUp, Users, DollarSign, Clock, Calendar, CheckCircle } from 'lucide-react';

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
        <div className="p-5 bg-blue-600 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-200" />
            <p className="text-sm text-blue-100 font-medium">Tổng hoạt động</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalActivities}</p>
        </div>

        <div className="p-5 bg-violet-600 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-violet-200" />
            <p className="text-sm text-violet-100 font-medium">Số người</p>
          </div>
          <p className="text-3xl font-bold text-white">{allParticipants.size}</p>
        </div>

        <div className="p-5 bg-orange-600 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-200" />
            <p className="text-sm text-orange-100 font-medium">Tổng chi</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalSpent.toLocaleString('vi-VN')}đ</p>
        </div>

        <div className="p-5 bg-green-600 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-200" />
            <p className="text-sm text-green-100 font-medium">Đã thu</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalPaid.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Tiến độ thu tiền</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Đã thu: {totalPaid.toLocaleString('vi-VN')}đ</span>
            <span>Còn lại: {totalUnpaid.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-green-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ width: `${totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0}%` }}
            >
              {totalSpent > 0 && (totalPaid / totalSpent) * 100 > 10 && (
                <span className="text-xs font-semibold text-white">
                  {((totalPaid / totalSpent) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Hoạt động gần đây</h3>
          </div>
          <div className="space-y-2">
            {recentActivities.map((activity) => {
              const paidCount = activity.participants.filter(p => p.paid).length;
              const totalCount = activity.participants.length;
              const allPaid = paidCount === totalCount;

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                      {allPaid && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Hoàn tất
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString('vi-VN')} • {activity.participants.length} người
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {activity.totalAmount.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {paidCount}/{totalCount} đã trả
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
            <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
            Chưa có hoạt động nào
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Thêm hoạt động đầu tiên để bắt đầu!
          </p>
        </div>
      )}
    </div>
  );
}
