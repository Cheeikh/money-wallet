export interface ServiceConfig {
  id: string;
  type: string;
  name: string;
  label: string;
  icon: string;
  bgClass: string;
  iconClass: string;
  description: string;
  isSelected?: boolean;
}

export interface TransferData {
  phoneNumber: string;
  amount: number;
  description?: string;
  pin?: string;
}

export interface TransportData {
  ticketType: string;
  quantity: number;
  pin?: string;
}

export interface BillsData {
  provider: string;
  amount: number;
  pin?: string;
  reference: string;
}

export interface MobileRechargeData {
  phoneNumber: string;
  amount: number;
  isOwnNumber: boolean;
  pin?: string;
} 