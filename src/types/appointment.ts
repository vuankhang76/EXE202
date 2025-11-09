export interface AppointmentDto {
  appointmentId: number;
  patientId: number;
  patientName?: string;
  patientPhone?: string;
  patientGender?: string;
  patientDateOfBirth?: string;
  patientAddress?: string;
  
  doctorId: number;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorLicenseNumber?: string;
  doctorPhone?: string;
  
  tenantId: number;
  tenantName?: string;
  
  startAt: string;
  endAt: string;
  type: string;
  status: string;
  channel?: string;
  address?: string;
  notes?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentCreateDto {
  tenantId: number;
  patientId: number;
  doctorId?: number;
  startAt: string;
  endAt?: string;
  type: string;
  channel?: string;
  address?: string;
  estimatedCost?: number; // Chi phí ước tính
  serviceId?: number; // Service selected
}

export interface AppointmentFormData {
  patientId: number;
  doctorId: number;
  tenantId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: string;
  notes?: string;
  estimatedCost?: number; // Chi phí ước tính
}

export interface AppointmentUpdateDto {
  startAt?: string;
  endAt?: string;
  type?: string;
  status?: string;
  address?: string;
  notes?: string;
}

export interface AppointmentFilterDto {
  tenantId?: number;
  patientId?: number;
  doctorId?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  type?: string;
  pageNumber: number;
  pageSize: number;
}

export interface CompleteAppointmentDto {
  notes?: string;
}

export const AppointmentStatus = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  BOOKED: 'Booked',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled'
} as const;

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const AppointmentType = {
  HOME: 'Home',
  CLINIC: 'Clinic',
  ONLINE: 'Online',
  PHONE: 'Phone'
} as const;

export type AppointmentTypeType = typeof AppointmentType[keyof typeof AppointmentType];

export const getStatusColor = (status: string): string => {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return 'bg-yellow-100 text-yellow-800';
    case AppointmentStatus.CONFIRMED:
    case AppointmentStatus.BOOKED:
      return 'bg-blue-100 text-blue-800';
    case AppointmentStatus.IN_PROGRESS:
      return 'bg-green-100 text-green-800';
    case AppointmentStatus.COMPLETED:
      return 'bg-gray-100 text-gray-800';
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    case AppointmentStatus.RESCHEDULED:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return 'Đã đặt lịch';
    case AppointmentStatus.CONFIRMED:
      return 'Đã xác nhận';
    case AppointmentStatus.BOOKED:
      return 'Đã đặt';
    case AppointmentStatus.IN_PROGRESS:
      return 'Đang khám';
    case AppointmentStatus.COMPLETED:
      return 'Hoàn thành';
    case AppointmentStatus.CANCELLED:
      return 'Đã hủy';
    case AppointmentStatus.RESCHEDULED:
      return 'Đã hoãn';
    default:
      return status;
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case AppointmentType.HOME:
      return 'Khám tại nhà';
    case AppointmentType.CLINIC:
      return 'Khám tại phòng khám';
    case AppointmentType.ONLINE:
      return 'Khám online';
    case AppointmentType.PHONE:
      return 'Tư vấn điện thoại';
    default:
      return type;
  }
};
