import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

export interface NotificationDto extends BaseEntity {
  notificationId: number;
  tenantId?: number;
  userId?: number;
  patientId?: number;
  title: string;
  body: string;
  channel: string;
  isRead: boolean;
  readAt?: string;
  scheduledAt?: string;
  sentAt?: string;
  metadata?: string;
  // Additional info
  userName?: string;
  patientName?: string;
  tenantName?: string;
}

export interface NotificationCreateDto {
  tenantId?: number;
  userId?: number;
  patientId?: number;
  title: string;
  body: string;
  channel: string;
  scheduledAt?: string;
  metadata?: string;
}

export interface NotificationUpdateDto {
  title?: string;
  body?: string;
  channel?: string;
  scheduledAt?: string;
  metadata?: string;
}

export interface NotificationFilterDto extends BaseQueryDto, DateRangeFilter {
  tenantId?: number;
  userId?: number;
  patientId?: number;
  channel?: string;
  isRead?: boolean;
}

export interface BulkNotificationDto {
  tenantId?: number;
  userIds?: number[];
  patientIds?: number[];
  title: string;
  body: string;
  channel: string;
  scheduledAt?: string;
  metadata?: string;
}

export interface MarkAsReadDto {
  notificationIds: number[];
}

export interface NotificationReportDto {
  totalNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  readRate: number;
  notificationsByChannel: Record<string, number>;
  notificationsByDay: Record<string, number>;
  fromDate?: string;
  toDate?: string;
}

export interface UserNotificationSummaryDto {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  recentNotifications: NotificationDto[];
}

export interface NotificationTemplateDto {
  type: string;
  title: string;
  body: string;
  channel: string;
  variables?: Record<string, string>;
}

// Notification channels
export const NotificationChannels = {
  Push: 'Push',
  Email: 'Email',
  SMS: 'SMS',
  InApp: 'InApp'
} as const;

export type NotificationChannel = typeof NotificationChannels[keyof typeof NotificationChannels];
