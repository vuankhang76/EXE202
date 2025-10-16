import { Calendar, Clock, MapPin, User, Stethoscope, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { DoctorDto, TenantDto } from '@/types';
import { getTypeLabel } from '@/types/appointment';

interface BookingConfirmationProps {
  clinic: TenantDto;
  doctor: DoctorDto;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  appointmentType: string;
  notes?: string;
}

export default function BookingConfirmation({
  clinic,
  doctor,
  appointmentDate,
  startTime,
  endTime,
  appointmentType,
  notes
}: BookingConfirmationProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Card className="border-2 border-red-100">
      <CardContent className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-6">
          Thông tin đặt lịch
        </h3>

        <div className="space-y-4">
          {/* Clinic Info */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phòng khám</p>
              <p className="font-semibold text-gray-900">{clinic.name}</p>
              {clinic.address && (
                <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {clinic.address}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Doctor Info */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {doctor.avatarUrl ? (
                <img
                  src={doctor.avatarUrl}
                  alt={doctor.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Bác sĩ</p>
              <p className="font-semibold text-gray-900">
                {doctor.title} {doctor.fullName}
              </p>
              {doctor.specialty && (
                <p className="text-sm text-red-500">{doctor.specialty}</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày khám</p>
              <p className="font-semibold text-gray-900">
                {formatDate(appointmentDate)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giờ khám</p>
              <p className="font-semibold text-gray-900">
                {formatTime(startTime)} - {formatTime(endTime)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Appointment Type */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hình thức khám</p>
              <p className="font-semibold text-gray-900">
                {getTypeLabel(appointmentType)}
              </p>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                <p className="text-gray-900">{notes}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Vui lòng đến trước giờ hẹn 10-15 phút để làm thủ tục.
            Mang theo CCCD/CMND và các giấy tờ y tế liên quan (nếu có).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
