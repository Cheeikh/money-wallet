export type QRCodeAction = 'transfer' | 'payment' | 'deposit' | 'withdrawal';

export interface QRCodeData {
  type: QRCodeAction;
  userId: string;
  phone: string;
  amount?: number;
  description?: string;
  timestamp: number;
  expiresIn: number;
} 