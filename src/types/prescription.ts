import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

export interface PrescriptionDto extends BaseEntity {
  prescriptionId: number;
  patientId: number;
  carePlanId?: number;
  doctorId: number;
  issuedAt: string;
  status: string;
  notes?: string;
  items: PrescriptionItemDto[];
  // Additional info
  patientName?: string;
  doctorName?: string;
  carePlanTitle?: string;
}

export interface PrescriptionCreateDto {
  patientId: number;
  carePlanId?: number;
  doctorId: number;
  status: string;
  notes?: string;
  items: PrescriptionItemCreateDto[];
}

export interface PrescriptionUpdateDto {
  status?: string;
  notes?: string;
}

export interface PrescriptionItemDto extends BaseEntity {
  itemId: number;
  prescriptionId: number;
  drugName: string;
  form?: string;
  strength?: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  quantity?: number;
  refills?: number;
  instructions?: string;
  isActive: boolean;
}

export interface PrescriptionItemCreateDto {
  drugName: string;
  form?: string;
  strength?: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  quantity?: number;
  refills?: number;
  instructions?: string;
}

export interface PrescriptionItemUpdateDto {
  drugName?: string;
  form?: string;
  strength?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  refills?: number;
  instructions?: string;
  isActive?: boolean;
}

export interface PrescriptionQueryDto extends BaseQueryDto, DateRangeFilter {
  patientId?: number;
  doctorId?: number;
  carePlanId?: number;
  status?: string;
  drugName?: string;
}

export interface QuickPrescriptionDto {
  patientId: number;
  carePlanId?: number;
  doctorId: number;
  medications: QuickMedicationDto[];
}

export interface QuickMedicationDto {
  drugName: string;
  form?: string;
  strength?: string;
  dose: string;
  route?: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
}

// Prescription constants
export const PrescriptionStatuses = {
  Active: 'Active',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  OnHold: 'OnHold'
} as const;

export const DrugForms = {
  Tablet: 'Tablet',
  Capsule: 'Capsule',
  Syrup: 'Syrup',
  Injection: 'Injection',
  Cream: 'Cream',
  Drops: 'Drops',
  Inhaler: 'Inhaler'
} as const;

export const DrugRoutes = {
  Oral: 'Oral',
  Topical: 'Topical',
  Injection: 'Injection',
  Inhalation: 'Inhalation',
  Nasal: 'Nasal',
  Rectal: 'Rectal'
} as const;

export const DrugFrequencies = {
  'QD': 'Once daily',
  'BID': 'Twice daily',
  'TID': 'Three times daily',
  'QID': 'Four times daily',
  'Q4H': 'Every 4 hours',
  'Q6H': 'Every 6 hours',
  'Q8H': 'Every 8 hours',
  'Q12H': 'Every 12 hours',
  'PRN': 'As needed'
} as const;

export type PrescriptionStatus = typeof PrescriptionStatuses[keyof typeof PrescriptionStatuses];
export type DrugForm = typeof DrugForms[keyof typeof DrugForms];
export type DrugRoute = typeof DrugRoutes[keyof typeof DrugRoutes];
export type DrugFrequency = keyof typeof DrugFrequencies;
