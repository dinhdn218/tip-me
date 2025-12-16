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
            className="group border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300"
          >
            <div
              className="p-5 cursor-pointer bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/20 dark:hover:to-fuchsia-900/20 transition-all duration-300"
              onClick={() => toggleExpand(activity.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                      {activity.title}
                    </h3>
                    {allPaid && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                        <CheckCircle className="w-3 h-3" />
                        Hoàn tất
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(activity.date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tổng:</span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {activity.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-xl border border-violet-200 dark:border-violet-800">
                      <Users className="w-4 h-4 text-violet-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mỗi người:</span>
                      <span className="font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                    allPaid
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                  }`}>
                    <span className="text-lg">{paidCount}/{totalCount}</span>
                  </div>
                  <div className="mt-4">
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-violet-600 dark:text-violet-400 animate-bounce" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="p-6 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Danh sách người tham gia:
                </h4>
                <div className="space-y-3 mb-6">
                  {activity.participants.map((participant) => (
                    <div
                      key={participant.name}
                      className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                        participant.paid
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isAdmin ? (
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={participant.paid}
                              onChange={() => togglePayment(activity, participant.name)}
                              className="w-6 h-6 text-violet-600 rounded-lg focus:ring-4 focus:ring-violet-500/20 cursor-pointer"
                            />
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                            participant.paid 
                              ? 'bg-green-500 border-green-500' 
                              : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                          }`}>
                            {participant.paid && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        )}
                        <span className={`font-semibold text-lg ${
                          participant.paid
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-800 dark:text-white'
                        }`}>
                          {participant.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-lg ${
                          participant.paid
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                        </span>
                        {participant.paid ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {paymentQR && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-2xl border-2 border-violet-200 dark:border-violet-800">
                    <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-violet-600" />
                      Thông tin thanh toán:
                    </h5>
                    <div className="flex gap-6 items-center flex-col sm:flex-row">
                      <img
                        src={paymentQR.imageUrl}
                        alt="QR Code"
                        className="w-40 h-40 rounded-2xl object-cover shadow-xl border-4 border-white dark:border-gray-700"
                      />
                      <div className="flex-1 space-y-2 text-gray-600 dark:text-gray-300">
                        {paymentQR.bankName && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Ngân hàng:</span>
                            <span className="font-bold text-gray-800 dark:text-white">{paymentQR.bankName}</span>
                          </p>
                        )}
                        {paymentQR.accountNumber && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">STK:</span>
                            <span className="font-bold text-gray-800 dark:text-white">{paymentQR.accountNumber}</span>
                          </p>
                        )}
                        {paymentQR.accountName && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Tên:</span>
                            <span className="font-bold text-gray-800 dark:text-white">{paymentQR.accountName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteClick(activity.id, activity.title)}
                    className="group mt-6 w-full px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Xóa hoạt động
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
