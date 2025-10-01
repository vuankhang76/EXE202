import { 
  type NotificationDto,
  type NotificationCreateDto,
  type NotificationUpdateDto,
  type NotificationFilterDto,
  type BulkNotificationDto,
  type MarkAsReadDto,
  type NotificationReportDto,
  type UserNotificationSummaryDto,
  type NotificationTemplateDto,
  type ApiResponse,
  type PagedResult
} from '@/types';

import { apiUtils } from '@/api/axios';

class NotificationService {
  private readonly baseUrl = '/notifications';

  // Create notification
  async createNotification(data: NotificationCreateDto): Promise<ApiResponse<NotificationDto>> {
    const response = await apiUtils.post<ApiResponse<NotificationDto>>(this.baseUrl, data);
    return response.data;
  }

  // Get notification by ID
  async getNotificationById(id: number): Promise<ApiResponse<NotificationDto>> {
    const response = await apiUtils.get<ApiResponse<NotificationDto>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update notification
  async updateNotification(id: number, data: NotificationUpdateDto): Promise<ApiResponse<NotificationDto>> {
    const response = await apiUtils.put<ApiResponse<NotificationDto>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete notification
  async deleteNotification(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get notifications with filter and pagination
  async getNotifications(filter: NotificationFilterDto): Promise<ApiResponse<PagedResult<NotificationDto>>> {
    const response = await apiUtils.get<ApiResponse<PagedResult<NotificationDto>>>(this.baseUrl, { params: filter });
    return response.data;
  }

  // Get user notifications
  async getUserNotifications(
    userId: number,
    tenantId?: number,
    unreadOnly?: boolean
  ): Promise<ApiResponse<NotificationDto[]>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;

    const response = await apiUtils.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/user/${userId}`, { params });
    return response.data;
  }

  // Get patient notifications
  async getPatientNotifications(
    patientId: number,
    tenantId?: number,
    unreadOnly?: boolean
  ): Promise<ApiResponse<NotificationDto[]>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;

    const response = await apiUtils.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/patient/${patientId}`, { params });
    return response.data;
  }

  // Get tenant notifications
  async getTenantNotifications(
    tenantId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<NotificationDto[]>> {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/tenant/${tenantId}`, { params });
    return response.data;
  }

  // Mark notification as read
  async markAsRead(id: number): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/${id}/mark-read`);
    return response.data;
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(data: MarkAsReadDto): Promise<ApiResponse<boolean>> {
    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/mark-multiple-read`, data);
    return response.data;
  }

  // Mark all notifications as read
  async markAllAsRead(userId?: number, patientId?: number, tenantId?: number): Promise<ApiResponse<boolean>> {
    const params: any = {};
    if (userId) params.userId = userId;
    if (patientId) params.patientId = patientId;
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.post<ApiResponse<boolean>>(`${this.baseUrl}/mark-all-read`, null, { params });
    return response.data;
  }

  // Send bulk notification
  async sendBulkNotification(data: BulkNotificationDto): Promise<ApiResponse<NotificationDto[]>> {
    const response = await apiUtils.post<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/bulk-send`, data);
    return response.data;
  }

  // Get notification report
  async getNotificationReport(
    tenantId?: number,
    userId?: number,
    patientId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<NotificationReportDto>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (userId) params.userId = userId;
    if (patientId) params.patientId = patientId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<NotificationReportDto>>(`${this.baseUrl}/reports`, { params });
    return response.data;
  }

  // Get unread count
  async getUnreadCount(userId?: number, patientId?: number, tenantId?: number): Promise<ApiResponse<number>> {
    const params: any = {};
    if (userId) params.userId = userId;
    if (patientId) params.patientId = patientId;
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.get<ApiResponse<number>>(`${this.baseUrl}/unread-count`, { params });
    return response.data;
  }

  // Search notifications
  async searchNotifications(
    keyword: string,
    tenantId?: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<NotificationDto[]>> {
    const params: any = { keyword, pageNumber, pageSize };
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/search`, { params });
    return response.data;
  }

  // Get user notification summary
  async getUserNotificationSummary(
    userId?: number,
    patientId?: number,
    tenantId?: number
  ): Promise<ApiResponse<UserNotificationSummaryDto>> {
    const params: any = {};
    if (userId) params.userId = userId;
    if (patientId) params.patientId = patientId;
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.get<ApiResponse<UserNotificationSummaryDto>>(`${this.baseUrl}/summary`, { params });
    return response.data;
  }

  // Send notification from template
  async sendNotificationFromTemplate(
    template: NotificationTemplateDto,
    userId?: number,
    patientId?: number,
    tenantId: number = 1
  ): Promise<ApiResponse<NotificationDto>> {
    const params: any = { tenantId };
    if (userId) params.userId = userId;
    if (patientId) params.patientId = patientId;

    const response = await apiUtils.post<ApiResponse<NotificationDto>>(`${this.baseUrl}/send-from-template`, template, { params });
    return response.data;
  }

  // Get notifications by channel
  async getNotificationsByChannel(
    channel: string,
    tenantId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<NotificationDto[]>> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/channel/${channel}`, { params });
    return response.data;
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld: number = 30, tenantId?: number): Promise<ApiResponse<number>> {
    const params: any = { daysOld };
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.delete<ApiResponse<number>>(`${this.baseUrl}/cleanup`, { params });
    return response.data;
  }

  // Get used channels
  async getUsedChannels(tenantId?: number): Promise<ApiResponse<string[]>> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiUtils.get<ApiResponse<string[]>>(`${this.baseUrl}/channels`, { params });
    return response.data;
  }

  // Send appointment reminder
  async sendAppointmentReminder(
    appointmentId: number,
    hoursBeforeAppointment: number = 24
  ): Promise<ApiResponse<NotificationDto>> {
    const response = await apiUtils.post<ApiResponse<NotificationDto>>(
      `${this.baseUrl}/appointment-reminder/${appointmentId}`,
      null,
      { params: { hoursBeforeAppointment } }
    );
    return response.data;
  }

  // Send test result notification
  async sendTestResultNotification(
    patientId: number,
    testName: string,
    result: string,
    tenantId: number
  ): Promise<ApiResponse<NotificationDto>> {
    const params = { patientId, testName, result, tenantId };
    const response = await apiUtils.post<ApiResponse<NotificationDto>>(`${this.baseUrl}/test-result`, null, { params });
    return response.data;
  }

  // Get notification statistics
  async getNotificationStatistics(
    tenantId?: number,
    fromDate?: string,
    toDate?: string,
    groupBy: string = 'day'
  ): Promise<ApiResponse<object>> {
    const params: any = { groupBy };
    if (tenantId) params.tenantId = tenantId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiUtils.get<ApiResponse<object>>(`${this.baseUrl}/statistics`, { params });
    return response.data;
  }

  // Get recent unread notifications
  async getRecentUnreadNotifications(
    userId?: number,
    patientId?: number,
    tenantId?: number,
    limit: number = 10
  ): Promise<ApiResponse<NotificationDto[]>> {
    const params: any = { limit };
    if (userId) params.userId = userId;
    if (patientId) params.patientId = patientId;
    if (tenantId) params.tenantId = tenantId;

    const response = await apiUtils.get<ApiResponse<NotificationDto[]>>(`${this.baseUrl}/recent-unread`, { params });
    return response.data;
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<ApiResponse<NotificationTemplateDto[]>> {
    const response = await apiUtils.get<ApiResponse<NotificationTemplateDto[]>>(`${this.baseUrl}/templates`);
    return response.data;
  }
}

export default new NotificationService();
