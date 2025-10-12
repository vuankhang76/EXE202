import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

// Payment Transaction DTO
export interface PaymentTransactionDto extends BaseEntity {
  paymentId: number;
  tenantId: number;
  tenantName?: string;
  patientId: number;
  patientName?: string;
  patientPhone?: string;
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
}

// Create Payment Transaction
export interface PaymentTransactionCreateDto {
  tenantId: number;
  patientId: number;
  appointmentId?: number;
  amount: number;
  currency?: string; // Default: "VND"
  method: string; // "CASH", "CARD", "BANK_TRANSFER", "MOMO", "ZALOPAY"
  providerRef?: string;
}

// Update Payment Transaction
export interface PaymentTransactionUpdateDto {
  status: string; // "PENDING", "COMPLETED", "FAILED", "REFUNDED"
  providerRef?: string;
}

// Payment Transaction Filter
export interface PaymentTransactionFilterDto extends BaseQueryDto, DateRangeFilter {
  tenantId?: number;
  patientId?: number;
  appointmentId?: number;
  status?: string;
  method?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Refund Request
export interface RefundRequestDto {
  reason: string;
  refundAmount?: number; // If null, refund full amount
}

// Payment Statistics
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

// Daily Payment Summary
export interface DailyPaymentSummaryDto {
  date: string;
  transactionCount: number;
  totalAmount: number;
  completedAmount: number;
}

// Complete Payment DTO
export interface CompletePaymentDto {
  providerRef?: string;
}

// Fail Payment DTO
export interface FailPaymentDto {
  reason?: string;
}

// Payment Method Options
export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'CARD', label: 'Thẻ tín dụng/ghi nợ' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  { value: 'MOMO', label: 'Ví MoMo' },
  { value: 'ZALOPAY', label: 'Ví ZaloPay' },
  { value: 'VNPAY', label: 'VNPay' },
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

export const getPaymentStatusLabel = (status: string): string => {
  return PAYMENT_STATUS.find(s => s.value === status)?.label || status;
};

export const getPaymentStatusColor = (status: string): string => {
  return PAYMENT_STATUS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
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
