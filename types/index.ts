export interface Participant {
  name: string;
  paid: boolean;
}

export interface Activity {
  id: string;
  title: string;
  totalAmount: number;
  participants: Participant[];
  date: string;
  amountPerPerson: number;
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
