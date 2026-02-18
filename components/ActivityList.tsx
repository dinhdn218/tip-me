'use client';

import { Activity, PaymentQR } from '@/types';
import { useState } from 'react';
import { Trash2, CheckCircle, Calendar, Users, X, DollarSign } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface ActivityListProps {
  activities: Activity[];
  onUpdate: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onDeleteAll?: () => void;
  paymentQR: PaymentQR | null;
  isAdmin: boolean;
}

export default function ActivityList({ activities, onUpdate, onDelete, onDeleteAll, paymentQR, isAdmin }: ActivityListProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string }>({
    show: false,
    id: '',
    title: '',
  });
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  const openActivityDetail = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const closeActivityDetail = () => {
    setSelectedActivity(null);
  };

  const togglePayment = (activity: Activity, participantName: string) => {
    const updatedActivity = {
      ...activity,
      participants: activity.participants.map(p =>
        p.name === participantName ? { ...p, paid: !p.paid } : p
      ),
    };
    onUpdate(updatedActivity);
    
    // Update selected activity if it's currently open
    if (selectedActivity && selectedActivity.id === activity.id) {
      setSelectedActivity(updatedActivity);
    }
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

  const handleDeleteAllClick = () => {
    setDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    if (onDeleteAll) {
      onDeleteAll();
    }
    setDeleteAllConfirm(false);
  };

  const cancelDeleteAll = () => {
    setDeleteAllConfirm(false);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
          <Users className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
          Chưa có hoạt động nào
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Hãy thêm hoạt động mới để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Delete All Button */}
      {isAdmin && activities.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleDeleteAllClick}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả hoạt động ({activities.length})
          </button>
        </div>
      )}

      <div className="space-y-3">
      {activities.map((activity) => {
        const paidCount = activity.participants.filter(p => p.paid).length;
        const totalCount = activity.participants.length;
        const allPaid = paidCount === totalCount;

        return (
          <div
            key={activity.id}
            onClick={() => openActivityDetail(activity)}
            className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
              allPaid 
                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </h3>
                  {allPaid && (
                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded flex items-center gap-1 flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      Xong
                    </span>
                  )}
                </div>
                
                {/* Date & Amount Row */}
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{totalCount} người</span>
                  </div>
                </div>

                {/* Money Info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Tổng: </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {activity.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Mỗi người: </span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Status Badge */}
              <div className="flex-shrink-0">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                  allPaid
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>
                  {paidCount}/{totalCount}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in" onClick={closeActivityDetail}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-violet-600 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 break-words leading-tight">{selectedActivity.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{new Date(selectedActivity.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="h-3 sm:h-4 w-px bg-white/30"></div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{selectedActivity.participants.length} người</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeActivityDetail}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Amount Summary */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng chi phí</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                      {selectedActivity.totalAmount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                    <p className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 mb-1">Mỗi người</p>
                    <p className="text-lg sm:text-2xl font-bold text-violet-700 dark:text-violet-300 break-words">
                      {selectedActivity.amountPerPerson.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                {/* Participants List */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                    Danh sách người tham gia
                  </h4>
                  <div className="space-y-2">
                    {selectedActivity.participants.map((participant) => (
                      <div
                        key={participant.name}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors ${
                          participant.paid
                            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                            : 'bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {/* Left: Checkbox + Name */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={participant.paid}
                              onChange={() => togglePayment(selectedActivity, participant.name)}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500/30 cursor-pointer flex-shrink-0"
                            />
                          ) : (
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              participant.paid 
                                ? 'bg-green-600 border-green-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {participant.paid && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                            </div>
                          )}
                          <span className={`font-medium text-sm sm:text-lg truncate ${
                            participant.paid
                              ? 'text-gray-500 dark:text-gray-400 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {participant.name}
                          </span>
                        </div>

                        {/* Right: Amount + Status */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className={`font-bold text-sm sm:text-lg ${
                            participant.paid
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {selectedActivity.amountPerPerson.toLocaleString('vi-VN')}đ
                          </span>
                          {participant.paid && (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete Button */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      handleDeleteClick(selectedActivity.id, selectedActivity.title);
                      closeActivityDetail();
                    }}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-bold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Xóa hoạt động
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Confirm Delete All Dialog */}
      {deleteAllConfirm && (
        <ConfirmDialog
          title="Xác nhận xóa tất cả"
          message={`Bạn có chắc chắn muốn xóa TẤT CẢ ${activities.length} hoạt động? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.`}
          onConfirm={confirmDeleteAll}
          onCancel={cancelDeleteAll}
          confirmText="Xóa tất cả"
          cancelText="Hủy"
          type="danger"
        />
      )}
    </div>
  );
}
