// Account roles
export const UserRole = {
  TENANT: 'Tenant',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  CLINIC_ADMIN: 'ClinicAdmin'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Account status
export const AccountStatus = {
  ACTIVE: 'True',
  INACTIVE: 'False'
} as const;

export type AccountStatusType = typeof AccountStatus[keyof typeof AccountStatus];

// Get role label in Vietnamese
export const getRoleLabel = (role: string): string => {
  switch (role) {
    case UserRole.TENANT:
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

// Get role badge variant
export const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case UserRole.TENANT:
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

// Get status label in Vietnamese
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

// Get status badge class
export const getStatusBadgeClass = (isActive: boolean): string => {
  return isActive 
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-gray-50 text-gray-700';
};
