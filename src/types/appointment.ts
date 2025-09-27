export interface AppointmentDto {
  appointmentId: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  tenantId: number;
  tenantName?: string;
  startAt: string;
  endAt: string;
  type: string;
  status: string;
  channel?: string;
  address?: string;
  notes?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
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
}

export interface AppointmentUpdateDto {
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
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

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CompleteAppointmentDto {
  notes?: string;
}

export const AppointmentStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  BOOKED: 'Booked', // New status from API
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'NoShow'
} as const;

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const AppointmentType = {
  CONSULTATION: 'Consultation',
  FOLLOW_UP: 'FollowUp',
  EMERGENCY: 'Emergency',
  ROUTINE_CHECKUP: 'RoutineCheckup',
  SPECIALIST: 'Specialist'
} as const;

export type AppointmentTypeType = typeof AppointmentType[keyof typeof AppointmentType];

export const getStatusColor = (status: string): string => {
  switch (status) {
    case AppointmentStatus.PENDING:
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
    case AppointmentStatus.NO_SHOW:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'Chờ xác nhận';
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
    case AppointmentStatus.NO_SHOW:
      return 'Không đến';
    default:
      return status;
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case AppointmentType.CONSULTATION:
      return 'Tư vấn';
    case AppointmentType.FOLLOW_UP:
      return 'Tái khám';
    case AppointmentType.EMERGENCY:
      return 'Cấp cứu';
    case AppointmentType.ROUTINE_CHECKUP:
      return 'Khám định kỳ';
    case AppointmentType.SPECIALIST:
      return 'Chuyên khoa';
    default:
      return type;
  }
};
