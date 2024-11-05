export type QRCodeAction = 'payment' | 'transfer' | 'identification' | 'deposit' | 'withdrawal';

export interface QRCodeData {
  type: QRCodeAction;
  userId: string;
  phone: string;
  timestamp: number;
  expiresIn: number;
  amount?: number;
  description?: string;
}

export interface QRConfigs {
  transfer: {
    title: string;
    description: string;
    action: string;
  };
  payment: {
    title: string;
    description: string;
    action: string;
  };
  deposit: {
    title: string;
    description: string;
    action: string;
  };
  withdrawal: {
    title: string;
    description: string;
    action: string;
  };
  identification: {
    title: string;
    description: string;
    action: string;
  };
} 