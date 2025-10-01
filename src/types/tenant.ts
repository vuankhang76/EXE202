import type { BaseEntity } from './common';

export interface TenantDto extends BaseEntity {
  tenantId: number;
  name: string;
  code: string;
  type: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  settings?: string;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
}

export interface TenantCreateDto {
  name: string;
  code: string;
  type: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  settings?: string;
  subscriptionPlan?: string;
}

export interface TenantUpdateDto {
  name?: string;
  type?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  settings?: string;
  subscriptionPlan?: string;
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
