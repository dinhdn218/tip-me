'use client';

import { Activity, PaymentQR } from '@/types';
import { useState } from 'react';
import { Trash2, CheckCircle, Calendar, Users, X, DollarSign } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Chưa có hoạt động nào</p>
          <p className="text-sm text-muted-foreground mt-1">Hãy thêm hoạt động mới để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Delete All Button */}
      {isAdmin && activities.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAllClick}
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả ({activities.length})
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {activities.map((activity) => {
          const paidCount = activity.participants.filter(p => p.paid).length;
          const totalCount = activity.participants.length;
          const allPaid = paidCount === totalCount;
          const firstShare = activity.participants[0]?.shareAmount ?? activity.amountPerPerson;
          const hasUnequalShares = totalCount > 1 && activity.participants.some(
            (p) => Math.abs((p.shareAmount ?? activity.amountPerPerson) - firstShare) > 0.01
          );

          return (
            <Card
              key={activity.id}
              onClick={() => openActivityDetail(activity)}
              className={`cursor-pointer transition-all hover:shadow-md border-border/60 ${
                allPaid ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' : 'hover:border-primary/40'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base text-foreground truncate">{activity.title}</h3>
                      {allPaid && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 shrink-0 text-[10px] px-1.5 h-4">
                          <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Xong
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(activity.date).toLocaleDateString('vi-VN')}</span>
                      <span className="w-px h-3 bg-border" />
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{totalCount} người</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-muted-foreground">Tổng: <span className="font-semibold text-foreground">{activity.totalAmount.toLocaleString('vi-VN')}đ</span></span>
                      <span className="w-px h-3 bg-border hidden sm:block" />
                      {hasUnequalShares ? (
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          Chia riêng
                          <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-primary/40 text-primary font-semibold">Không đều</Badge>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Mỗi người: <span className="font-semibold text-primary">{activity.amountPerPerson.toLocaleString('vi-VN')}đ</span></span>
                      )}
                    </div>
                  </div>
                  <Badge variant={allPaid ? 'default' : 'secondary'} className={`shrink-0 text-xs font-bold ${allPaid ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}>
                    {paidCount}/{totalCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in" onClick={closeActivityDetail}>
          <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-border" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-primary p-4 sm:p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                <h3 className="text-lg sm:text-2xl font-bold text-primary-foreground mb-1 sm:mb-2 break-words leading-tight">{selectedActivity.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-primary-foreground/80 text-xs sm:text-sm">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 sm:w-4 sm:h-4" />{new Date(selectedActivity.date).toLocaleDateString('vi-VN')}</span>
                  <span className="h-3 sm:h-4 w-px bg-primary-foreground/30" />
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 sm:w-4 sm:h-4" />{selectedActivity.participants.length} người</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeActivityDetail} className="text-primary-foreground hover:bg-primary-foreground/20 shrink-0">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Amount Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 sm:p-4 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Tổng chi phí</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground break-words">{selectedActivity.totalAmount.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-primary/10 rounded-xl">
                    <p className="text-xs text-primary mb-1">
                      {selectedActivity.participants.some((p, _, arr) =>
                        Math.abs((p.shareAmount ?? selectedActivity.amountPerPerson) -
                          (arr[0].shareAmount ?? selectedActivity.amountPerPerson)) > 0.01
                      ) ? "Chia không đều" : "Mỗi người"}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-primary break-words">
                      {selectedActivity.participants.some((p, _, arr) =>
                        Math.abs((p.shareAmount ?? selectedActivity.amountPerPerson) -
                          (arr[0].shareAmount ?? selectedActivity.amountPerPerson)) > 0.01
                      ) ? "Xem bên dưới ↓" : selectedActivity.amountPerPerson.toLocaleString('vi-VN') + 'đ'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Participants List */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />Danh sách người tham gia
                  </h4>
                  <div className="space-y-2">
                    {selectedActivity.participants.map((participant) => (
                      <div
                        key={participant.name}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-colors ${
                          participant.paid
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-muted/40 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={participant.paid}
                              onChange={() => togglePayment(selectedActivity, participant.name)}
                              className="w-4 h-4 sm:w-5 sm:h-5 accent-primary rounded cursor-pointer flex-shrink-0"
                            />
                          ) : (
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${participant.paid ? 'bg-emerald-600 border-emerald-600' : 'border-muted-foreground/30'}`}>
                              {participant.paid && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          )}
                          <span className={`font-medium text-sm sm:text-base truncate ${participant.paid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {participant.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-semibold text-sm sm:text-base ${participant.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                            {(participant.shareAmount ?? selectedActivity.amountPerPerson).toLocaleString('vi-VN')}đ
                          </span>
                          {participant.paid && <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete Button */}
                {isAdmin && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      handleDeleteClick(selectedActivity.id, selectedActivity.title);
                      closeActivityDetail();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa hoạt động
                  </Button>
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
