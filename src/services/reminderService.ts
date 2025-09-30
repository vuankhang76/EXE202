import { 
  type ReminderDTO,
  type CreateReminderDTO,
  type UpdateReminderDTO,
  type ReminderQueryDTO,
  type ReminderListResponseDTO,
  type SnoozeReminderDTO,
  type BulkReminderActionDTO,
  type ReminderStatsDTO,
  type FireReminderDTO,
  type ReminderTemplateDTO,
  type ApiResponse
} from '@/types';

import { apiUtils } from '@/api/axios';

class ReminderService {
  private readonly baseUrl = '/reminders';

  // Create reminder
  async createReminder(data: CreateReminderDTO): Promise<ApiResponse<ReminderDTO>> {
    const response = await apiUtils.post<ApiResponse<ReminderDTO>>(this.baseUrl, data);
    return response.data;
  }

  // Get reminders with pagination and filter
  async getReminders(query: ReminderQueryDTO): Promise<ApiResponse<ReminderListResponseDTO>> {
    const response = await apiUtils.get<ApiResponse<ReminderListResponseDTO>>(this.baseUrl, { params: query });
    return response.data;
  }

  // Get reminder by ID
  async getReminderById(reminderId: number): Promise<ApiResponse<ReminderDTO>> {
    const response = await apiUtils.get<ApiResponse<ReminderDTO>>(`${this.baseUrl}/${reminderId}`);
    return response.data;
  }

  // Update reminder
  async updateReminder(reminderId: number, data: UpdateReminderDTO): Promise<ApiResponse<ReminderDTO>> {
    const response = await apiUtils.put<ApiResponse<ReminderDTO>>(`${this.baseUrl}/${reminderId}`, data);
    return response.data;
  }

  // Delete reminder
  async deleteReminder(reminderId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${reminderId}`);
    return response.data;
  }

  // Snooze reminder
  async snoozeReminder(reminderId: number, data: SnoozeReminderDTO): Promise<ApiResponse<ReminderDTO>> {
    const response = await apiUtils.post<ApiResponse<ReminderDTO>>(`${this.baseUrl}/${reminderId}/snooze`, data);
    return response.data;
  }

  // Activate reminder
  async activateReminder(reminderId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/${reminderId}/activate`);
    return response.data;
  }

  // Deactivate reminder
  async deactivateReminder(reminderId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/${reminderId}/deactivate`);
    return response.data;
  }

  // Bulk reminder action
  async bulkReminderAction(data: BulkReminderActionDTO): Promise<ApiResponse<number>> {
    const response = await apiUtils.post<ApiResponse<number>>(`${this.baseUrl}/bulk-action`, data);
    return response.data;
  }

  // Get upcoming reminders
  async getUpcomingReminders(hours: number = 24): Promise<ApiResponse<ReminderDTO[]>> {
    const response = await apiUtils.get<ApiResponse<ReminderDTO[]>>(`${this.baseUrl}/upcoming`, { params: { hours } });
    return response.data;
  }

  // Get overdue reminders
  async getOverdueReminders(): Promise<ApiResponse<ReminderDTO[]>> {
    const response = await apiUtils.get<ApiResponse<ReminderDTO[]>>(`${this.baseUrl}/overdue`);
    return response.data;
  }

  // Get reminder stats
  async getReminderStats(fromDate?: string, toDate?: string): Promise<ApiResponse<ReminderStatsDTO>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    const response = await apiUtils.get<ApiResponse<ReminderStatsDTO>>(`${this.baseUrl}/stats`, { params });
    return response.data;
  }

  // Get due reminders (for background service)
  async getDueReminders(): Promise<ApiResponse<FireReminderDTO[]>> {
    const response = await apiUtils.get<ApiResponse<FireReminderDTO[]>>(`${this.baseUrl}/due`);
    return response.data;
  }

  // Mark reminder as fired
  async markReminderAsFired(reminderId: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/${reminderId}/mark-fired`);
    return response.data;
  }

  // Get reminder templates
  async getReminderTemplates(): Promise<ApiResponse<ReminderTemplateDTO[]>> {
    const response = await apiUtils.get<ApiResponse<ReminderTemplateDTO[]>>(`${this.baseUrl}/templates`);
    return response.data;
  }

  // Create reminder from template
  async createReminderFromTemplate(
    targetType: string,
    targetId: number,
    patientId: number,
    minutesBefore: number = 30
  ): Promise<ApiResponse<ReminderDTO>> {
    const params = { targetType, targetId, patientId, minutesBefore };
    const response = await apiUtils.post<ApiResponse<ReminderDTO>>(`${this.baseUrl}/from-template`, null, { params });
    return response.data;
  }

  // Patient APIs
  // Get patient reminders
  async getPatientReminders(patientId: number, activeOnly: boolean = true): Promise<ApiResponse<ReminderDTO[]>> {
    const response = await apiUtils.get<ApiResponse<ReminderDTO[]>>(`${this.baseUrl}/patient/${patientId}`, { 
      params: { activeOnly } 
    });
    return response.data;
  }

  // Patient snooze reminder
  async patientSnoozeReminder(
    patientId: number,
    reminderId: number,
    data: SnoozeReminderDTO
  ): Promise<ApiResponse<ReminderDTO>> {
    const response = await apiUtils.post<ApiResponse<ReminderDTO>>(
      `${this.baseUrl}/patient/${patientId}/reminders/${reminderId}/snooze`,
      data
    );
    return response.data;
  }
}

export default new ReminderService();
