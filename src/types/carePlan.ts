import type { BaseEntity } from './common';

export interface CarePlanDto extends BaseEntity {
  carePlanId: number;
  tenantId: number;
  patientId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  createdByUserId: number;
  items: CarePlanItemDto[];
  // Additional info
  patientName?: string;
  createdByUserName?: string;
  tenantName?: string;
}

export interface CarePlanCreateDto {
  patientId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  items: CarePlanItemCreateDto[];
}

export interface CarePlanUpdateDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface CarePlanItemDto extends BaseEntity {
  itemId: number;
  carePlanId: number;
  title: string;
  description?: string;
  frequency: string;
  targetValue?: string;
  isCompleted: boolean;
  completedAt?: string;
  dueDate?: string;
  priority: string;
}

export interface CarePlanItemCreateDto {
  title: string;
  description?: string;
  frequency: string;
  targetValue?: string;
  dueDate?: string;
  priority: string;
}

export interface CarePlanItemUpdateDto {
  title?: string;
  description?: string;
  frequency?: string;
  targetValue?: string;
  isCompleted?: boolean;
  dueDate?: string;
  priority?: string;
}

export interface CarePlanItemLogDto extends BaseEntity {
  logId: number;
  itemId: number;
  patientId: number;
  loggedAt: string;
  value?: string;
  notes?: string;
  isCompleted: boolean;
  // Additional info
  itemTitle?: string;
  patientName?: string;
}

export interface CarePlanItemLogCreateDto {
  itemId: number;
  value?: string;
  notes?: string;
  isCompleted: boolean;
}

export interface CarePlanProgressDto {
  carePlanId: number;
  title: string;
  totalItems: number;
  completedItems: number;
  completionRate: number;
  overDueItems: number;
  upcomingItems: number;
  recentLogs: CarePlanItemLogDto[];
}

// Care plan constants
export const CarePlanStatuses = {
  Active: 'Active',
  Completed: 'Completed',
  OnHold: 'OnHold',
  Cancelled: 'Cancelled'
} as const;

export const CarePlanItemPriorities = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical'
} as const;

export const CarePlanItemFrequencies = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  Monthly: 'Monthly',
  AsNeeded: 'AsNeeded',
  Once: 'Once'
} as const;

export type CarePlanStatus = typeof CarePlanStatuses[keyof typeof CarePlanStatuses];
export type CarePlanItemPriority = typeof CarePlanItemPriorities[keyof typeof CarePlanItemPriorities];
export type CarePlanItemFrequency = typeof CarePlanItemFrequencies[keyof typeof CarePlanItemFrequencies];
