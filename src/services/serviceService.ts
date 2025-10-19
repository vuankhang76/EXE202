import api from "@/api/axios";
import type { Service, ServiceCreateDto, ServiceUpdateDto, DoctorWorkingHour } from "@/types/service";
import type { ApiResponse } from "@/models/ApiResponse";

export const serviceService = {
  // Get all services for a tenant
  async getTenantServices(tenantId: number): Promise<ApiResponse<Service[]>> {
    const response = await api.get<ApiResponse<Service[]>>(`/services/tenant/${tenantId}`);
    return response.data;
  },

  // Get service by ID
  async getServiceById(serviceId: number): Promise<ApiResponse<Service>> {
    const response = await api.get<ApiResponse<Service>>(`/services/${serviceId}`);
    return response.data;
  },

  // Create new service (Admin only)
  async createService(dto: ServiceCreateDto): Promise<ApiResponse<Service>> {
    const response = await api.post<ApiResponse<Service>>("/services", dto);
    return response.data;
  },

  // Update service (Admin only)
  async updateService(serviceId: number, dto: ServiceUpdateDto): Promise<ApiResponse<Service>> {
    const response = await api.put<ApiResponse<Service>>(`/services/${serviceId}`, dto);
    return response.data;
  },

  // Delete service (Admin only)
  async deleteService(serviceId: number): Promise<ApiResponse<boolean>> {
    const response = await api.delete<ApiResponse<boolean>>(`/services/${serviceId}`);
    return response.data;
  },

  // Get doctor working hours
  async getDoctorWorkingHours(doctorId: number): Promise<ApiResponse<DoctorWorkingHour[]>> {
    const response = await api.get<ApiResponse<DoctorWorkingHour[]>>(`/doctors/${doctorId}/working-hours`);
    return response.data;
  },

  // Get doctors available at specific time
  async getAvailableDoctors(
    tenantId: number, 
    dayOfWeek: number, 
    timeSlot: string,
    date?: string // yyyy-MM-dd format
  ): Promise<ApiResponse<number[]>> {
    const response = await api.get<ApiResponse<number[]>>('/doctors/available', {
      params: {
        tenantId,
        dayOfWeek,
        timeSlot,
        date
      }
    });
    return response.data;
  },

  // Get available dates within a date range
  async getAvailableDates(
    tenantId: number,
    startDate: string, // yyyy-MM-dd
    endDate: string // yyyy-MM-dd
  ): Promise<ApiResponse<string[]>> {
    const response = await api.get<ApiResponse<string[]>>('/doctors/available-dates', {
      params: {
        tenantId,
        startDate,
        endDate
      }
    });
    return response.data;
  },
};
