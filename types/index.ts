export type ActivityCategory = 'dining' | 'travel' | 'bills' | 'entertainment' | 'groceries' | 'other';

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  dining: 'Ăn uống',
  travel: 'Du lịch',
  bills: 'Hóa đơn',
  entertainment: 'Giải trí',
  groceries: 'Mua sắm',
  other: 'Khác',
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  dining: '🍜',
  travel: '✈️',
  bills: '💡',
  entertainment: '🎮',
  groceries: '🛒',
  other: '📌',
};

export interface Participant {
  name: string;
  paid: boolean;
  shareAmount?: number;
}

export interface Activity {
  id: string;
  title: string;
  totalAmount: number;
  participants: Participant[];
  date: string;
  amountPerPerson: number;
  category?: ActivityCategory;
}

export interface DebtSummary {
  name: string;
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
}

export interface PaymentQR {
  imageUrl: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface AdminConfig {
  pin: string;
  name: string;
}
