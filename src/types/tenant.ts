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
  weekendOpen?: string;
  weekendClose?: string;
  settings?: string;
  status?: number;
  isActive?: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  ownerUserId?: number;
  ownerName?: string;
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
