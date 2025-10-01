import type { BaseEntity, BaseQueryDto, DateRangeFilter } from './common';

export interface MeasurementDto extends BaseEntity {
  measurementId: number;
  patientId: number;
  carePlanId?: number;
  type: string;
  value1?: number;
  value2?: number;
  unit?: string;
  source: string;
  measuredAt: string;
  notes?: string;
  isVerified: boolean;
  verifiedByUserId?: number;
  verifiedAt?: string;
  // Additional info
  patientName?: string;
  verifiedByUserName?: string;
}

export interface MeasurementCreateDto {
  patientId: number;
  carePlanId?: number;
  type: string;
  value1?: number;
  value2?: number;
  unit?: string;
  source: string;
  measuredAt?: string;
  notes?: string;
}

export interface MeasurementUpdateDto {
  type?: string;
  value1?: number;
  value2?: number;
  unit?: string;
  notes?: string;
  isVerified?: boolean;
}

export interface MeasurementQueryDto extends BaseQueryDto, DateRangeFilter {
  patientId?: number;
  carePlanId?: number;
  type?: string;
  source?: string;
}

export interface MeasurementStatsDto {
  type: string;
  count: number;
  averageValue1?: number;
  averageValue2?: number;
  minValue1?: number;
  maxValue1?: number;
  minValue2?: number;
  maxValue2?: number;
  latestValue1?: number;
  latestValue2?: number;
  latestMeasuredAt?: string;
}

export interface QuickMeasurementDto {
  patientId: number;
  type: string;
  value1?: number;
  value2?: number;
  notes?: string;
}

// Measurement constants
export const MeasurementTypes = {
  BloodPressure: 'BloodPressure',
  HeartRate: 'HeartRate',
  Temperature: 'Temperature',
  Weight: 'Weight',
  Height: 'Height',
  BloodSugar: 'BloodSugar',
  Cholesterol: 'Cholesterol',
  BMI: 'BMI',
  OxygenSaturation: 'OxygenSaturation'
} as const;

export const MeasurementSources = {
  Manual: 'Manual',
  Device: 'Device',
  App: 'App',
  Clinic: 'Clinic'
} as const;

export type MeasurementType = typeof MeasurementTypes[keyof typeof MeasurementTypes];
export type MeasurementSource = typeof MeasurementSources[keyof typeof MeasurementSources];
