export const UserRole = {
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  CLINIC_ADMIN: 'ClinicAdmin'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const AccountStatus = {
  ACTIVE: 'True',
  INACTIVE: 'False'
} as const;

export type AccountStatusType = typeof AccountStatus[keyof typeof AccountStatus];

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case UserRole.DOCTOR:
      return 'Bác sĩ';
    case UserRole.NURSE:
      return 'Y tá';
    case UserRole.RECEPTIONIST:
      return 'Lễ tân';
    case UserRole.CLINIC_ADMIN:
      return 'Quản trị';
    default:
      return role;
  }
};

export const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case UserRole.DOCTOR:
      return 'default';
    case UserRole.NURSE:
      return 'secondary';
    case UserRole.RECEPTIONIST:
      return 'outline';
    case UserRole.CLINIC_ADMIN:
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getStatusLabel = (status: string | boolean): string => {
  const statusStr = typeof status === 'boolean' ? (status ? 'True' : 'False') : status;
  switch (statusStr) {
    case AccountStatus.ACTIVE:
      return 'Đang hoạt động';
    case AccountStatus.INACTIVE:
      return 'Ngừng hoạt động';
    default:
      return statusStr;
  }
};

export const getStatusBadgeClass = (isActive: boolean): string => {
  return isActive 
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-gray-50 text-gray-700';
};
