import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

export interface ReminderDTO extends BaseEntity {
  reminderId: number;
  tenantId: number;
  patientId: number;
  title: string;
  message: string;
  reminderTime: string;
  isRecurring: boolean;
  recurringPattern?: string;
  isActive: boolean;
  lastFiredAt?: string;
  nextFireAt?: string;
  targetType?: string;
  targetId?: number;
  // Additional info
  patientName?: string;
  tenantName?: string;
}

export interface CreateReminderDTO {
  patientId: number;
  title: string;
  message: string;
  reminderTime: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  targetType?: string;
  targetId?: number;
}

export interface UpdateReminderDTO {
  title?: string;
  message?: string;
  reminderTime?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  isActive?: boolean;
}

export interface ReminderQueryDTO extends BaseQueryDto, DateRangeFilter {
  patientId?: number;
  isActive?: boolean;
  targetType?: string;
  targetId?: number;
}

export interface ReminderListResponseDTO {
  reminders: ReminderDTO[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface SnoozeReminderDTO {
  snoozeMinutes: number;
  reason?: string;
}

export interface BulkReminderActionDTO {
  reminderIds: number[];
  action: 'activate' | 'deactivate' | 'delete';
}

export interface ReminderStatsDTO {
  totalReminders: number;
  activeReminders: number;
  upcomingReminders: number;
  overdueReminders: number;
  completedReminders: number;
}

export interface FireReminderDTO {
  reminderId: number;
  patientId: number;
  title: string;
  message: string;
  reminderTime: string;
  patientName?: string;
  patientPhoneE164?: string;
}

export interface ReminderTemplateDTO {
  templateId?: number;
  name: string;
  title: string;
  message: string;
  defaultMinutesBefore: number;
  targetType: string;
}
