import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import type { AppointmentDto } from '@/types/appointment';
import { getStatusColor, getStatusLabel, getTypeLabel } from '@/types/appointment';
import { Calendar, Clock, User, Stethoscope, Phone, MapPin, FileText, CalendarClock, Hospital } from 'lucide-react';

interface ViewAppointmentDialogProps {
    appointment: AppointmentDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ViewAppointmentDialog({
    appointment,
    open,
    onOpenChange,
}: ViewAppointmentDialogProps) {
    if (!appointment) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    weekday: 'long'
                });
            }
            return dateString;
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString: string) => {
        if (!timeString || timeString === 'Invalid Date') return 'N/A';
        try {
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            return timeString;
        } catch {
            return 'N/A';
        }
    };

    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            return dateTimeString;
        } catch {
            return dateTimeString;
        }
    };

    const formatDateOfBirth = (dob: string | undefined) => {
        if (!dob) return 'N/A';
        try {
            const date = new Date(dob);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
            return dob;
        } catch {
            return dob;
        }
    };

    const getGenderLabel = (gender: string | undefined) => {
        if (!gender) return 'N/A';
        switch (gender.toLowerCase()) {
            case 'male':
            case 'm':
                return 'Nam';
            case 'female':
            case 'f':
                return 'Nữ';
            default:
                return gender;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex gap-12 h-12">
                        <div>
                            <DialogTitle className="text-2xl">Chi tiết lịch hẹn #{appointment.appointmentId}</DialogTitle>
                            <DialogDescription className="mt-1">
                                Thông tin chi tiết về lịch hẹn
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={getStatusColor(appointment.status)}>
                                {getStatusLabel(appointment.status)}
                            </Badge>
                            <Badge variant="outline">
                                {getTypeLabel(appointment.type)}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-lg text-blue-900">Thông tin bệnh nhân</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Họ và tên</Label>
                                        <p className="text-sm font-medium mt-1">
                                            {appointment.patientName || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Giới tính</Label>
                                            <p className="text-sm font-medium mt-1">
                                                {getGenderLabel(appointment.patientGender)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Ngày sinh</Label>
                                            <p className="text-sm font-medium mt-1">
                                                {formatDateOfBirth(appointment.patientDateOfBirth)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            Số điện thoại
                                        </Label>
                                        <p className="text-sm font-medium mt-1">
                                            {appointment.patientPhone || 'N/A'}
                                        </p>
                                    </div>

                                    {appointment.patientAddress && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                Địa chỉ
                                            </Label>
                                            <p className="text-sm font-medium mt-1 line-clamp-2">
                                                {appointment.patientAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {(appointment.createdAt || appointment.updatedAt) && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <Label className="text-xl font-semibold text-gray-700 mb-3 block">Lịch sử thay đổi</Label>
                                    <div className="space-y-2">
                                        {appointment.createdAt && appointment.updatedAt && (
                                            <div className="flex items-start space-x-18">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Ngày tạo
                                                    </Label>
                                                    <p className="text-sm font-medium mt-1">
                                                        {formatDateTime(appointment.createdAt)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Cập nhật lần cuối
                                                    </Label>
                                                    <p className="text-sm font-medium mt-1">
                                                        {formatDateTime(appointment.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Stethoscope className="h-5 w-5 text-green-600" />
                                    <h3 className="font-semibold text-lg text-green-900">Thông tin bác sĩ</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Họ và tên</Label>
                                        <p className="text-sm font-medium mt-1">
                                            {appointment.doctorName || 'N/A'}
                                        </p>
                                    </div>

                                    {appointment.doctorSpecialty && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Chuyên khoa</Label>
                                            <p className="text-sm font-medium mt-1">
                                                {appointment.doctorSpecialty}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        {appointment.doctorLicenseNumber && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Số chứng chỉ</Label>
                                                <p className="text-sm font-medium mt-1">
                                                    {appointment.doctorLicenseNumber}
                                                </p>
                                            </div>
                                        )}
                                        {appointment.doctorPhone && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    Điện thoại
                                                </Label>
                                                <p className="text-sm font-medium mt-1">
                                                    {appointment.doctorPhone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Time */}
                            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarClock className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-semibold text-lg text-purple-900">Thời gian hẹn</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Ngày hẹn
                                        </Label>
                                        <p className="text-sm font-medium mt-1">
                                            {formatDate(appointment.startAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Giờ khám
                                        </Label>
                                        <p className="text-sm font-medium mt-1">
                                            {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                                        </p>
                                    </div>

                                    {appointment.tenantName && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Hospital className="h-3 w-3" />
                                                Phòng khám
                                            </Label>
                                            <p className="text-sm font-medium mt-1">
                                                {appointment.tenantName}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* Notes */}
                        {appointment.notes && (
                            <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                                <div className="flex items-start gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-amber-600 mt-0.5" />
                                    <Label className="text-sm font-semibold text-amber-900">Ghi chú</Label>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap pl-6">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}