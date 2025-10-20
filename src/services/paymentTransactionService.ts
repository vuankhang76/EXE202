import { apiUtils } from '@/api/axios';
import type { ApiResponse } from '@/models/ApiResponse';
import type {
  PaymentTransactionDto,
  PaymentTransactionCreateDto,
  PaymentTransactionUpdateDto,
  PaymentTransactionFilterDto,
  PaymentStatisticsDto,
  DailyPaymentSummaryDto,
  RefundRequestDto,
  CompletePaymentDto,
  FailPaymentDto,
} from '@/types/paymentTransaction';
import type { PagedResult } from '@/types/common';

class PaymentTransactionService {
  private readonly baseUrl = '/paymenttransactions';

  // Create a new payment transaction
  async createPaymentTransaction(data: PaymentTransactionCreateDto): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.post<ApiResponse<PaymentTransactionDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get payment transaction by ID
  async getPaymentTransactionById(id: number, skipGlobalLoading = false): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.get<ApiResponse<PaymentTransactionDto>>(
      `${this.baseUrl}/${id}`,
      undefined,
      { skipGlobalLoading }
    );
    return response.data;
  }

  // Update payment transaction
  async updatePaymentTransaction(id: number, data: PaymentTransactionUpdateDto): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.put<ApiResponse<PaymentTransactionDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete payment transaction (only PENDING)
  async deletePaymentTransaction(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get payment transactions with filters and pagination
  async getPaymentTransactions(filter: PaymentTransactionFilterDto): Promise<ApiResponse<PagedResult<PaymentTransactionDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<PaymentTransactionDto>>>(this.baseUrl, filter);
    return response.data;
  }

  // Get payment transactions by patient
  async getPatientPaymentTransactions(patientId: number, tenantId?: number): Promise<ApiResponse<PaymentTransactionDto[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<PaymentTransactionDto[]>>(
      `${this.baseUrl}/patient/${patientId}`,
      params
    );
    return response.data;
  }

  // Get payment transactions by tenant
  async getTenantPaymentTransactions(
    tenantId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<PaymentTransactionDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<PaymentTransactionDto[]>>(
      `${this.baseUrl}/tenant/${tenantId}`,
      params
    );
    return response.data;
  }

  // Get payment transactions by appointment
  async getAppointmentPaymentTransactions(appointmentId: number): Promise<ApiResponse<PaymentTransactionDto[]>> {
    const response = await apiUtils.get<ApiResponse<PaymentTransactionDto[]>>(
      `${this.baseUrl}/appointment/${appointmentId}`
    );
    return response.data;
  }

  // Process payment (create and process transaction)
  async processPayment(data: PaymentTransactionCreateDto): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.post<ApiResponse<PaymentTransactionDto>>(`${this.baseUrl}/process`, data);
    return response.data;
  }

  // Complete payment
  async completePayment(id: number, data?: CompletePaymentDto): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.post<ApiResponse<PaymentTransactionDto>>(
      `${this.baseUrl}/${id}/complete`,
      data || {}
    );
    return response.data;
  }

  // Fail payment
  async failPayment(id: number, data?: FailPaymentDto): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.post<ApiResponse<PaymentTransactionDto>>(
      `${this.baseUrl}/${id}/fail`,
      data || {}
    );
    return response.data;
  }

  // Refund payment
  async refundPayment(id: number, data: RefundRequestDto): Promise<ApiResponse<PaymentTransactionDto>> {
    const response = await apiUtils.post<ApiResponse<PaymentTransactionDto>>(
      `${this.baseUrl}/${id}/refund`,
      data
    );
    return response.data;
  }

  // Get payment statistics
  async getPaymentStatistics(
    tenantId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<PaymentStatisticsDto>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<PaymentStatisticsDto>>(
      `${this.baseUrl}/statistics`,
      params
    );
    return response.data;
  }

  // Get daily payment summary
  async getDailyPaymentSummary(
    tenantId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<DailyPaymentSummaryDto[]>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<DailyPaymentSummaryDto[]>>(
      `${this.baseUrl}/daily-summary`,
      params
    );
    return response.data;
  }
}

export const paymentTransactionService = new PaymentTransactionService();
export default paymentTransactionService;
