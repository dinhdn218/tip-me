'use client';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning',
}: ConfirmDialogProps) {
  const icons = {
    danger: <XCircle className="w-5 h-5 text-destructive" />,
    warning: <AlertTriangle className="w-5 h-5 text-debt" />,
    info: <Info className="w-5 h-5 text-primary" />,
    success: <CheckCircle className="w-5 h-5 text-credit" />,
  };

  const actionClass = {
    danger: 'bg-destructive hover:bg-destructive/90 text-white',
    warning: 'bg-debt hover:bg-debt/90 text-white',
    info: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    success: 'bg-credit hover:bg-credit/90 text-white',
  };

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {icons[type]}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={actionClass[type]}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
