import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

// Payment Transaction DTO
export interface PaymentTransactionDto extends BaseEntity {
  paymentId: number;
  tenantId: number;
  tenantName?: string;
  patientId: number;
  patientName?: string;
  patientPhone?: string;
  patientGender?: string;
  patientDateOfBirth?: string;
  appointmentId?: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  providerRef?: string;
  // Appointment info
  appointmentType?: string;
  appointmentDate?: string;
  doctorName?: string;
  // SePay webhook fields
  gateway?: string;
  sepayId?: number;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string;
  transferType?: string;
  transferAmount?: number;
  accumulated?: number;
  code?: string;
  content?: string;
  description?: string;
  referenceCode?: string;
  completedAt?: string;
}

// Create Payment Transaction
export interface PaymentTransactionCreateDto {
  tenantId: number;
  patientId: number;
  appointmentId?: number;
  amount: number;
  currency?: string; // Default: "VND"
  method: string; // "Cash", "BankTransfer", "MoMo", "ZaloPay", "VNPay", "Card"
  providerRef?: string;
}

// Update Payment Transaction
export interface PaymentTransactionUpdateDto {
  status: string; // "Pending", "Completed", "Failed", "Refunded"
  providerRef?: string;
}

export interface PaymentTransactionFilterDto extends BaseQueryDto, DateRangeFilter {
  tenantId?: number;
  patientId?: number;
  appointmentId?: number;
  status?: string;
  method?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface RefundRequestDto {
  reason: string;
  refundAmount?: number;
}

export interface PaymentStatisticsDto {
  totalTransactions: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  transactionsByMethod: Record<string, number>;
  transactionsByStatus: Record<string, number>;
  dailySummary: DailyPaymentSummaryDto[];
}

export interface DailyPaymentSummaryDto {
  date: string;
  transactionCount: number;
  totalAmount: number;
  completedAmount: number;
}

export interface CompletePaymentDto {
  providerRef?: string;
}

export interface FailPaymentDto {
  reason?: string;
}

export const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', category: 'bank', icon: '🏦' },
] as const;

// Payment Status Options
export const PAYMENT_STATUS = [
  { value: 'PENDING', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  { value: 'FAILED', label: 'Thất bại', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'bg-blue-100 text-blue-800' },
] as const;

// Helper functions
export const getPaymentMethodLabel = (method: string): string => {
  return PAYMENT_METHODS.find(m => m.value === method)?.label || method;
};

export const getPaymentMethodIcon = (method: string): string => {
  return PAYMENT_METHODS.find(m => m.value === method)?.icon || '💳';
};

export const getPaymentStatusLabel = (status: string): string => {
  return PAYMENT_STATUS.find(s => s.value === status)?.label || status;
};

export const getPaymentStatusColor = (status: string): string => {
  return PAYMENT_STATUS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
};

// Filter available payment methods based on tenant settings
export const getAvailablePaymentMethods = (config?: {
  bankTransferEnabled?: boolean;
}) => {
  if (!config) return PAYMENT_METHODS;
  
  // Always return BANK_TRANSFER (only method available)
  return PAYMENT_METHODS.filter(method => 
    method.category === 'bank' && config.bankTransferEnabled !== false
  );
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
