import type { BaseEntity } from './common';

export interface TenantDto extends BaseEntity {
  tenantId: number;
  name: string;
  code: string;
  type?: string;
  address?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  weekdayOpen?: string;
  weekdayClose?: string;
  weekendOpen?: string;     // Giờ mở Thứ 7-CN (null = không mở)
  weekendClose?: string;    // Giờ đóng Thứ 7-CN (null = không mở)
  settings?: string;
  status?: number;
  isActive?: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  ownerUserId?: number;
  ownerName?: string;
}

export function isTenantOpenOnWeekend(tenant: TenantDto): boolean {
  return !!(tenant.weekendOpen && tenant.weekendClose);
}

export function formatTenantSchedule(tenant: TenantDto): { days: string; hours: string }[] {
  const schedule = [];
  if (tenant.weekdayOpen && tenant.weekdayClose) {
    schedule.push({
      days: 'T2-T6',
      hours: `${tenant.weekdayOpen} - ${tenant.weekdayClose}`
    });
  }
  if (tenant.weekendOpen && tenant.weekendClose) {
    schedule.push({
      days: 'T7-CN',
      hours: `${tenant.weekendOpen} - ${tenant.weekendClose}`
    });
  }
  return schedule;
}

export interface TenantCreateDto {
  name: string;
  code: string;
  type?: string;
  address?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  weekdayOpen?: string;
  weekdayClose?: string;
  weekendOpen?: string;
  weekendClose?: string;
  settings?: string;
  subscriptionPlan?: string;
  ownerUserId?: number;
}

export interface TenantUpdateDto {
  name?: string;
  type?: string;
  address?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  weekdayOpen?: string;
  weekdayClose?: string;
  weekendOpen?: string;
  weekendClose?: string;
  settings?: string;
  status?: number;
  subscriptionPlan?: string;
  ownerUserId?: number;
}

export interface TenantStatsDto {
  tenantId: number;
  totalPatients: number;
  totalUsers: number;
  totalAppointments: number;
  totalAppointmentsThisMonth: number;
  activePatients: number;
  activeUsers: number;
  recentAppointments: number;
}
