import api from "@/api/axios";
import type { ApiResponse } from "@/models/ApiResponse";

export interface BookingConfig {
  maxAdvanceBookingDays: number;
  defaultSlotDurationMinutes: number;
  minAdvanceBookingHours: number;
  maxCancellationHours: number;
  allowWeekendBooking: boolean;
}

export interface PaymentConfig {
  bankTransferEnabled: boolean;
  eWalletEnabled: boolean;
  cashEnabled: boolean;
}

export interface TenantSetting {
  tenantSettingId: number;
  tenantId: number;
  settingKey: string;
  settingValue: string;
  settingType: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const tenantSettingService = {
  /**
   * Get booking configuration for a tenant from database
   */
  async getBookingConfig(tenantId: number): Promise<ApiResponse<BookingConfig>> {
    const response = await api.get<ApiResponse<BookingConfig>>(`/tenants/${tenantId}/booking-config`);
    return response.data;
  },

  /**
   * Get payment configuration for a tenant
   */
  async getPaymentConfig(tenantId: number): Promise<ApiResponse<PaymentConfig>> {
    const response = await api.get<ApiResponse<PaymentConfig>>(`/tenants/${tenantId}/payment-config`);
    return response.data;
  },

  /**
   * Get all settings for a tenant
   */
  async getTenantSettings(tenantId: number, category?: string): Promise<ApiResponse<TenantSetting[]>> {
    const response = await api.get<ApiResponse<TenantSetting[]>>(`/tenants/${tenantId}/settings`, {
      params: { category }
    });
    return response.data;
  },

  /**
   * Update a single setting
   */
  async updateSetting(tenantId: number, settingKey: string, settingValue: string): Promise<ApiResponse<TenantSetting>> {
    const response = await api.put<ApiResponse<TenantSetting>>(
      `/tenants/${tenantId}/settings/${settingKey}`,
      { settingKey, settingValue }
    );
    return response.data;
  },

  /**
   * Bulk update multiple settings
   */
  async updateSettings(tenantId: number, settings: Record<string, string>): Promise<ApiResponse<TenantSetting[]>> {
    const response = await api.put<ApiResponse<TenantSetting[]>>(
      `/tenants/${tenantId}/settings`,
      { Settings: settings }  // Backend expects "Settings" with capital S
    );
    return response.data;
  },

  /**
   * Initialize default settings for a tenant
   */
  async initializeSettings(tenantId: number): Promise<ApiResponse<string>> {
    const response = await api.post<ApiResponse<string>>(`/tenants/${tenantId}/settings/initialize`);
    return response.data;
  },

  /**
   * Helper: Calculate max booking date based on tenant config
   */
  async getMaxBookingDate(tenantId: number): Promise<Date> {
    try {
      const config = await this.getBookingConfig(tenantId);
      if (config.success && config.data) {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + config.data.maxAdvanceBookingDays);
        return maxDate;
      }
    } catch (error) {
      // Fallback to default
    }
    
    // Fallback to 90 days if API fails
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 90);
    return fallbackDate;
  },

  /**
   * Helper: Get date range for available dates query
   */
  async getBookingDateRange(tenantId: number): Promise<{ startDate: string; endDate: string }> {
    const today = new Date();
    const maxDate = await this.getMaxBookingDate(tenantId);
    
    return {
      startDate: today.toISOString().split('T')[0],
      endDate: maxDate.toISOString().split('T')[0]
    };
  }
};
