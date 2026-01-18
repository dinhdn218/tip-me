'use client';

import { Activity, PaymentQR } from '@/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, CheckCircle, Clock, DollarSign, Users } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface ActivityListProps {
  activities: Activity[];
  onUpdate: (activity: Activity) => void;
  onDelete: (id: string) => void;
  paymentQR: PaymentQR | null;
  isAdmin: boolean;
}

export default function ActivityList({ activities, onUpdate, onDelete, paymentQR, isAdmin }: ActivityListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string }>({
    show: false,
    id: '',
    title: '',
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const togglePayment = (activity: Activity, participantName: string) => {
    const updatedActivity = {
      ...activity,
      participants: activity.participants.map(p =>
        p.name === participantName ? { ...p, paid: !p.paid } : p
      ),
    };
    onUpdate(updatedActivity);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({ show: true, id, title });
  };

  const confirmDelete = () => {
    onDelete(deleteConfirm.id);
    setDeleteConfirm({ show: false, id: '', title: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: '', title: '' });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full mb-6">
          <Users className="w-12 h-12 text-violet-600 dark:text-violet-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
          Chưa có hoạt động nào
        </p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          Hãy thêm hoạt động mới để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const isExpanded = expandedId === activity.id;
        const paidCount = activity.participants.filter(p => p.paid).length;
        const totalCount = activity.participants.length;
        const allPaid = paidCount === totalCount;

        return (
          <div
            key={activity.id}
            className="group border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-500 backdrop-blur-xl"
          >
            <div
              className="p-6 cursor-pointer bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800 hover:from-violet-50 hover:via-fuchsia-50/50 hover:to-violet-50 dark:hover:from-violet-900/20 dark:hover:via-fuchsia-900/20 dark:hover:to-violet-900/20 transition-all duration-500"
              onClick={() => toggleExpand(activity.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-black text-xl text-gray-800 dark:text-white tracking-tight">
                      {activity.title}
                    </h3>
                    {allPaid && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Hoàn tất
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2 font-semibold tracking-tight">
                    <Clock className="w-4 h-4" />
                    {new Date(activity.date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Tổng:</span>
                      <span className="font-black text-gray-800 dark:text-white tracking-tight">
                        {activity.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl border-2 border-violet-200 dark:border-violet-700 shadow-md">
                      <Users className="w-5 h-5 text-violet-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Mỗi người:</span>
                      <span className="font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">
                        {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black shadow-lg ${
                    allPaid
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  }`}>
                    <span className="text-lg tracking-tight">{paidCount}/{totalCount}</span>
                  </div>
                  <div className="mt-6 flex justify-center">
                    {isExpanded ? (
                      <ChevronUp className="w-7 h-7 text-violet-600 dark:text-violet-400 animate-bounce" />
                    ) : (
                      <ChevronDown className="w-7 h-7 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="p-8 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700 backdrop-blur-xl">
                <h4 className="font-black text-lg text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-3 tracking-tight">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Danh sách người tham gia
                </h4>
                <div className="space-y-4 mb-8">
                  {activity.participants.map((participant) => (
                    <div
                      key={participant.name}
                      className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 shadow-md hover:shadow-xl ${
                        participant.paid
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                          : 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isAdmin ? (
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={participant.paid}
                              onChange={() => togglePayment(activity, participant.name)}
                              className="w-7 h-7 text-violet-600 rounded-lg focus:ring-4 focus:ring-violet-500/30 cursor-pointer transition-all duration-300"
                            />
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                            participant.paid 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-500' 
                              : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                          }`}>
                            {participant.paid && <CheckCircle className="w-5 h-5 text-white" />}
                          </div>
                        )}
                        <span className={`font-bold text-lg tracking-tight ${
                          participant.paid
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-800 dark:text-white'
                        }`}>
                          {participant.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-black text-xl tracking-tight ${
                          participant.paid
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                        </span>
                        {participant.paid ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {paymentQR && (
                  <div className="mt-8 p-8 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-50 dark:from-violet-900/20 dark:via-fuchsia-900/20 dark:to-violet-900/20 rounded-3xl border-2 border-violet-300 dark:border-violet-700 shadow-xl backdrop-blur-xl">
                    <h5 className="font-black text-lg text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-3 tracking-tight">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      Thông tin thanh toán
                    </h5>
                    <div className="flex gap-8 items-center flex-col sm:flex-row">
                      <img
                        src={paymentQR.imageUrl}
                        alt="QR Code"
                        className="w-48 h-48 rounded-2xl object-cover shadow-2xl border-4 border-white dark:border-gray-700"
                      />
                      <div className="flex-1 space-y-3 text-gray-600 dark:text-gray-300">
                        {paymentQR.bankName && (
                          <p className="flex items-center gap-3 font-semibold tracking-tight">
                            <span className="text-gray-500 dark:text-gray-400">Ngân hàng:</span>
                            <span className="font-black text-gray-800 dark:text-white">{paymentQR.bankName}</span>
                          </p>
                        )}
                        {paymentQR.accountNumber && (
                          <p className="flex items-center gap-3 font-semibold tracking-tight">
                            <span className="text-gray-500 dark:text-gray-400">STK:</span>
                            <span className="font-black text-gray-800 dark:text-white">{paymentQR.accountNumber}</span>
                          </p>
                        )}
                        {paymentQR.accountName && (
                          <p className="flex items-center gap-3 font-semibold tracking-tight">
                            <span className="text-gray-500 dark:text-gray-400">Tên:</span>
                            <span className="font-black text-gray-800 dark:text-white">{paymentQR.accountName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteClick(activity.id, activity.title)}
                    className="group relative overflow-hidden mt-8 w-full px-6 py-5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl transition-all duration-500 font-black shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.01] flex items-center justify-center gap-3 tracking-tight"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Trash2 className="relative w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative">Xóa hoạt động</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Confirm Delete Dialog */}
      {deleteConfirm.show && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa hoạt động "${deleteConfirm.title}"? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
        />
      )}
    </div>
  );
}
