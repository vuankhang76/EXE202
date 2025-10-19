import { apiUtils } from '@/api/axios';
import type { ApiResponse } from '@/models/ApiResponse';
import type { PagedResult } from '@/types/common';
import type {
  AppointmentDto,
  AppointmentCreateDto,
  AppointmentFormData,
  AppointmentUpdateDto,
  AppointmentFilterDto,
  CompleteAppointmentDto
} from '@/types/appointment';

class AppointmentService {
  private readonly baseUrl = '/appointments';

  async createAppointment(data: AppointmentCreateDto): Promise<ApiResponse<AppointmentDto>> {
    const response = await apiUtils.post<ApiResponse<AppointmentDto>>(this.baseUrl, data);
    return response.data;
  }

  async getAppointmentById(id: number, skipGlobalLoading = false): Promise<ApiResponse<AppointmentDto>> {
    const response = await apiUtils.get<ApiResponse<AppointmentDto>>(
      `${this.baseUrl}/${id}`,
      undefined,
      { skipGlobalLoading });
    return response.data;
  }

  async updateAppointment(id: number, data: AppointmentUpdateDto): Promise<ApiResponse<AppointmentDto>> {
    const response = await apiUtils.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async cancelAppointment(id: number, reason?: string): Promise<ApiResponse<boolean>> {
    const params = reason ? { reason } : {};
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, { params });
    return response.data;
  }

  async getAppointments(filter: AppointmentFilterDto): Promise<ApiResponse<PagedResult<AppointmentDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<AppointmentDto>>>(this.baseUrl, filter);
    return response.data;
  }

  async getPatientAppointments(patientId: number, tenantId?: number): Promise<ApiResponse<AppointmentDto[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<AppointmentDto[]>>(`${this.baseUrl}/patient/${patientId}`, params);
    return response.data;
  }

  async getDoctorAppointments(
    doctorId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<AppointmentDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<AppointmentDto[]>>(`${this.baseUrl}/doctor/${doctorId}`, params);
    return response.data;
  }

  async getTenantAppointments(
    tenantId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<AppointmentDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<AppointmentDto[]>>(`${this.baseUrl}/tenant/${tenantId}`, params);
    return response.data;
  }

  async checkDoctorAvailability(
    doctorId: number,
    startTime: string,
    endTime: string,
    skipGlobalLoading = false
  ): Promise<ApiResponse<boolean>> {
    const params = { startTime, endTime };
    const response = await apiUtils.get<ApiResponse<boolean>>(`${this.baseUrl}/doctor/${doctorId}/availability`, params, { skipGlobalLoading });
    return response.data;
  }

  async getAvailableTimeSlots(
    doctorId: number,
    date: string,
    durationMinutes: number = 5,
    skipGlobalLoading = false
  ): Promise<ApiResponse<string[]>> {
    const params = { date, durationMinutes };
    const response = await apiUtils.get<ApiResponse<string[]>>(`${this.baseUrl}/doctor/${doctorId}/timeslots`, params, { skipGlobalLoading });
    return response.data;
  }

  async confirmAppointment(id: number): Promise<ApiResponse<AppointmentDto>> {
    const response = await apiUtils.post<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/confirm`);
    return response.data;
  }

  async startAppointment(id: number): Promise<ApiResponse<AppointmentDto>> {
    const response = await apiUtils.post<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/start`);
    return response.data;
  }

  async completeAppointment(id: number, notes?: string): Promise<ApiResponse<AppointmentDto>> {
    const data: CompleteAppointmentDto = notes ? { notes } : {};
    const response = await apiUtils.post<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/complete`, data);
    return response.data;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateTime(date: Date): string {
    return date.toISOString();
  }

  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  buildStartAtISO(date: string | Date, time: string): string {
    const dateStr = typeof date === 'string' ? date : this.formatDate(date);
    const timeWithSeconds = time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;

    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes, seconds = 0] = timeWithSeconds.split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    return utcDate.toISOString();
  }

  buildEndAtISOFromTime(date: string | Date, time: string): string {
    const dateStr = typeof date === 'string' ? date : this.formatDate(date);
    const timeWithSeconds = time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;

    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes, seconds = 0] = timeWithSeconds.split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    return utcDate.toISOString();
  }

  /**
   * Convert form data to backend DTO format
   */
  convertFormDataToCreateDto(formData: AppointmentFormData): AppointmentCreateDto {
    const startAt = this.buildStartAtISO(formData.appointmentDate, formData.startTime);
    const endAt = this.buildEndAtISOFromTime(formData.appointmentDate, formData.endTime);

    return {
      tenantId: formData.tenantId,
      patientId: formData.patientId,
      doctorId: formData.doctorId || undefined,
      startAt: startAt,
      endAt: endAt,
      type: formData.type,
      channel: 'Web',
      estimatedCost: formData.estimatedCost || 200000 // Mặc định 200,000 VND nếu không nhập
    };
  }

  async createAppointmentFromForm(formData: AppointmentFormData): Promise<ApiResponse<AppointmentDto>> {
    const createDto = this.convertFormDataToCreateDto(formData);
    return this.createAppointment(createDto);
  }

  async getTodayAppointments(tenantId?: number): Promise<ApiResponse<AppointmentDto[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<AppointmentDto[]>>(`${this.baseUrl}/today`, params);
    return response.data;
  }

  async getAvailableTimeSlotsAsDateTime(
    doctorId: number,
    date: string,
    durationMinutes: number = 30
  ): Promise<ApiResponse<Date[]>> {
    const params = { date, durationMinutes };
    const response = await apiUtils.get<ApiResponse<Date[]>>(`${this.baseUrl}/doctor/${doctorId}/timeslots`, params);
    return response.data;
  }

  async getAppointmentStats(tenantId?: number): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const result = await this.getTodayAppointments(tenantId);

      if (!result.success || !result.data) {
        return { total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0 };
      }

      const appointments = result.data;
      return {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'Scheduled').length,
        confirmed: appointments.filter(a => a.status === 'Confirmed').length,
        inProgress: appointments.filter(a => a.status === 'InProgress').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
        cancelled: appointments.filter(a => a.status === 'Cancelled').length,
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return { total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0 };
    }
  }
}

export default new AppointmentService();
