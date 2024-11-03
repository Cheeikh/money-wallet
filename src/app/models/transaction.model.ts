export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  status: TransactionStatus;
  recipient?: string;
  userId?: string;
  icon?: string;
  destinataire?: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  source?: {
    nom: string;
    prenom: string;
    telephone: string;
  };
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  description: string;
  phoneNumber?: string;
  recipient?: string;
  pin?: string;
}

export interface TransferData {
  phoneNumber: string;
  amount: number;
  pin?: string;
}

export interface MobileRechargeData {
  phoneNumber: string;
  amount: number;
  isOwnNumber: boolean;
  pin?: string;
} 