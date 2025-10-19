export interface Service {
  serviceId: number;
  tenantId: number;
  tenantName?: string;
  name: string;
  basePrice: number;
  serviceType: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceCreateDto {
  tenantId: number;
  name: string;
  basePrice: number;
  serviceType?: string;
  description?: string;
}

export interface ServiceUpdateDto {
  name?: string;
  basePrice?: number;
  serviceType?: string;
  description?: string;
  isActive?: boolean;
}

export interface DoctorWorkingHour {
  workingHourId: number;
  doctorId: number;
  doctorName?: string;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  dayName?: string;
  startTime: string; // HH:mm:ss format
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface DoctorWorkingHourCreateDto {
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  doctorId?: number;
  doctorName?: string;
}
