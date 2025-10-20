import type { TenantDto } from '@/types/tenant';
import type { BookingConfig } from '@/services/tenantSettingService';

export interface BookingValidationResult {
  isValid: boolean;
  message?: string;
  reason?: 'weekend_not_allowed' | 'weekend_not_configured' | 'outside_hours' | 'valid';
}

export function isWeekendDate(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
}

export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function timeToString(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Kiểm tra xem booking time có nằm trong khoảng giờ không
 * @param bookingTime - Giờ booking (HH:mm)
 * @param openTime - Giờ mở (HH:mm)
 * @param closeTime - Giờ đóng (HH:mm)
 * @param slotDurationMinutes - Độ dài slot (mặc định 30 phút)
 */
export function isTimeWithinRange(
  bookingTime: string,
  openTime: string,
  closeTime: string,
  slotDurationMinutes: number = 30
): boolean {
  try {
    const bookingMinutes = timeStringToMinutes(bookingTime);
    const openMinutes = timeStringToMinutes(openTime);
    const closeMinutes = timeStringToMinutes(closeTime);

    const startValid = bookingMinutes >= openMinutes;
    
    const endTime = bookingMinutes + slotDurationMinutes;
    const endValid = endTime <= closeMinutes;

    return startValid && endValid;
  } catch (error) {
    console.error('Error validating time range:', error);
    return false;
  }
}

export function validateBooking(
  date: Date,
  bookingTime: string,
  tenant: TenantDto,
  bookingConfig: BookingConfig,
  slotDurationMinutes: number = 30
): BookingValidationResult {
  if (isWeekendDate(date)) {
    if (!bookingConfig.allowWeekendBooking) {
      return {
        isValid: false,
        message: 'Phòng khám không cho phép đặt lịch vào cuối tuần',
        reason: 'weekend_not_allowed'
      };
    }

    if (!tenant.weekendOpen || !tenant.weekendClose) {
      return {
        isValid: false,
        message: 'Thông tin giờ hoạt động cuối tuần chưa được cấu hình',
        reason: 'weekend_not_configured'
      };
    }

    if (!isTimeWithinRange(bookingTime, tenant.weekendOpen, tenant.weekendClose, slotDurationMinutes)) {
      return {
        isValid: false,
        message: `Giờ đặt lịch phải nằm trong khoảng ${tenant.weekendOpen} - ${tenant.weekendClose}`,
        reason: 'outside_hours'
      };
    }
  } else {
    if (!tenant.weekdayOpen || !tenant.weekdayClose) {
      return {
        isValid: false,
        message: 'Thông tin giờ hoạt động chưa được cấu hình',
        reason: 'weekend_not_configured'
      };
    }

    if (!isTimeWithinRange(bookingTime, tenant.weekdayOpen, tenant.weekdayClose, slotDurationMinutes)) {
      return {
        isValid: false,
        message: `Giờ đặt lịch phải nằm trong khoảng ${tenant.weekdayOpen} - ${tenant.weekdayClose}`,
        reason: 'outside_hours'
      };
    }
  }

  return {
    isValid: true,
    reason: 'valid'
  };
}

export function canBookOnWeekend(
  tenant: TenantDto,
  bookingConfig: BookingConfig
): boolean {
  return (
    bookingConfig.allowWeekendBooking &&
    !!tenant.weekendOpen &&
    !!tenant.weekendClose
  );
}

export function getOperatingHours(
  date: Date,
  tenant: TenantDto
): { open: string; close: string } | null {
  if (isWeekendDate(date)) {
    if (tenant.weekendOpen && tenant.weekendClose) {
      return {
        open: tenant.weekendOpen,
        close: tenant.weekendClose
      };
    }
    return null;
  } else {
    if (tenant.weekdayOpen && tenant.weekdayClose) {
      return {
        open: tenant.weekdayOpen,
        close: tenant.weekdayClose
      };
    }
    return null;
  }
}
