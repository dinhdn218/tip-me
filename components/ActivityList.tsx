'use client';

import { Activity, PaymentQR } from '@/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, CheckCircle, Calendar, Users } from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string }>({
    show: false,
    id: '',
    title: '',
  });
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

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
        const isExpanded = expandedId === activity.id;
        const paidCount = activity.participants.filter(p => p.paid).length;
        const totalCount = activity.participants.length;
        const allPaid = paidCount === totalCount;

        return (
          <div
            key={activity.id}
            className={`border rounded-xl overflow-hidden transition-all ${
              allPaid 
                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            {/* Header - Clickable */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              onClick={() => toggleExpand(activity.id)}
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
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{new Date(activity.date).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {/* Money Info - Compact Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Tổng: </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {activity.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Mỗi người: </span>
                      <span className="font-bold text-violet-600 dark:text-violet-400">
                        {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Expand Icon */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    allPaid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {paidCount}/{totalCount}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 p-4">
                {/* Participants List */}
                <div className="space-y-2">
                  {activity.participants.map((participant) => (
                    <div
                      key={participant.name}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        participant.paid
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      {/* Left: Checkbox + Name */}
                      <div className="flex items-center gap-3">
                        {isAdmin ? (
                          <input
                            type="checkbox"
                            checked={participant.paid}
                            onChange={() => togglePayment(activity, participant.name)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
                          />
                        ) : (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            participant.paid 
                              ? 'bg-green-600 border-green-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {participant.paid && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        )}
                        <span className={`font-medium ${
                          participant.paid
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {participant.name}
                        </span>
                      </div>

                      {/* Right: Amount + Status */}
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${
                          participant.paid
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {activity.amountPerPerson.toLocaleString('vi-VN')}đ
                        </span>
                        {participant.paid && (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delete Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteClick(activity.id, activity.title)}
                    className="mt-4 w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa hoạt động
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>

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
