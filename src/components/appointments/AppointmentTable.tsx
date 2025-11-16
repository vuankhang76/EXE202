import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Calendar, Eye, Edit } from "lucide-react";
import type { AppointmentDto } from "@/types/appointment";
import {getStatusLabel, getTypeLabel, AppointmentStatus } from "@/types/appointment";
import { Mars, Venus } from "lucide-react";
import TableSkeleton from "../ui/TableSkeleton";
import TablePagination from "../ui/TablePagination";
import { CheckCircle, XCircle, Clock, Loader, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface AppointmentTableProps {
  appointments?: AppointmentDto[];
  currentLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  rowsPerPage?: number;
  onStatusChange: (id: number, newStatus: string) => Promise<void>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function AppointmentTable({
  appointments = [],
  currentLoading = false,
  currentPage = 1,
  totalPages = 0,
  totalCount = 0,
  rowsPerPage = 0,
  onStatusChange,
  onView,
  onEdit,
  onPageChange,
  onRowsPerPageChange
}: AppointmentTableProps) {
  const safeAppointments = appointments || [];
  
  // Local state để track status changes cho instant UI update
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});

  // Reset local statuses khi appointments thay đổi từ server
  useEffect(() => {
    setLocalStatuses({});
  }, [appointments]);

  const getDisplayStatus = (appointmentId: number, originalStatus: string) => {
    return localStatuses[appointmentId] ?? originalStatus;
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    // Update local state ngay lập tức
    setLocalStatuses(prev => ({ ...prev, [appointmentId]: newStatus }));
    
    try {
      // Gọi API ở background
      await onStatusChange(appointmentId, newStatus);
      
      // Xóa local override sau khi API success (để dùng data từ server)
      setLocalStatuses(prev => {
        const updated = { ...prev };
        delete updated[appointmentId];
        return updated;
      });
    } catch (error) {
      // Revert nếu API fail
      setLocalStatuses(prev => {
        const updated = { ...prev };
        delete updated[appointmentId];
        return updated;
      });
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Invalid Date') return 'N/A';

    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } else if (timeString.includes(':')) {
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
          const hours = parseInt(timeParts[0]) || 0;
          const minutes = parseInt(timeParts[1]) || 0;

          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
        }
      }

      if (!isNaN(Number(timeString))) {
        const timestamp = Number(timeString);
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }

      return timeString;
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const newDate = new Date(year, month - 1, day);
            return newDate.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        }
      }

      return dateString;
    } catch {
      return dateString;
    }
  };

  const age = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  const renderGender = (gender?: string) => {
    if (!gender) return "N/A";
    return gender === "M" ? <span className="flex items-center"><Mars className="text-blue-500 h-4 w-4 mr-1" />Nam</span> : <span className="text-pink-500 flex"><Venus className="h-4 w-4" />Nữ</span>;
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return "N/A";

    const digits = phone.replace(/\D/g, "");

    if (/^0\d{9}$/.test(digits)) {
      return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }

    if (/^84\d{9}$/.test(digits)) {
      const local = "0" + digits.slice(2);
      return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }

    return phone;
  };

  const renderStatusSelect = (appointment: AppointmentDto) => {
    const { status: originalStatus, appointmentId } = appointment;
    
    // Dùng local status nếu có, nếu không dùng original
    const status = getDisplayStatus(appointmentId, originalStatus);
  
    const getAvailableStatuses = (currentStatus: string) => {
      switch (currentStatus) {
        case AppointmentStatus.SCHEDULED:
          return [
            { value: AppointmentStatus.SCHEDULED, label: getStatusLabel(AppointmentStatus.SCHEDULED), icon: <Clock className="h-4 w-4 text-blue-500" /> },
            { value: AppointmentStatus.CONFIRMED, label: getStatusLabel(AppointmentStatus.CONFIRMED), icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
            { value: AppointmentStatus.CANCELLED, label: getStatusLabel(AppointmentStatus.CANCELLED), icon: <XCircle className="h-4 w-4 text-red-500" /> }
          ];
        case AppointmentStatus.CONFIRMED:
        case AppointmentStatus.BOOKED:
          return [
            { value: currentStatus, label: getStatusLabel(currentStatus), icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
            { value: AppointmentStatus.IN_PROGRESS, label: getStatusLabel(AppointmentStatus.IN_PROGRESS), icon: <Loader className="h-4 w-4 text-yellow-500" /> },
            { value: AppointmentStatus.CANCELLED, label: getStatusLabel(AppointmentStatus.CANCELLED), icon: <XCircle className="h-4 w-4 text-red-500" /> }
          ];
        case AppointmentStatus.IN_PROGRESS:
          return [
            { value: AppointmentStatus.IN_PROGRESS, label: getStatusLabel(AppointmentStatus.IN_PROGRESS), icon: <Loader className="h-4 w-4 text-yellow-500" /> },
            { value: AppointmentStatus.COMPLETED, label: getStatusLabel(AppointmentStatus.COMPLETED), icon: <CheckCircle className="h-4 w-4 text-green-500" /> }
          ];
        case AppointmentStatus.COMPLETED:
          return [{ value: currentStatus, label: getStatusLabel(currentStatus), icon: <CheckCircle className="h-4 w-4 text-green-500" /> }];
        case AppointmentStatus.CANCELLED:
          return [{ value: currentStatus, label: getStatusLabel(currentStatus), icon: <XCircle className="h-4 w-4 text-red-500" /> }];
        case AppointmentStatus.RESCHEDULED:
          return [{ value: currentStatus, label: getStatusLabel(currentStatus), icon: <AlertTriangle className="h-4 w-4 text-orange-500" /> }];
        default:
          return [{ value: currentStatus, label: getStatusLabel(currentStatus), icon: <Clock className="h-4 w-4 text-gray-400" /> }];
      }
    };
  
    const availableStatuses = getAvailableStatuses(status);
    const isDisabled = availableStatuses.length === 1;
    const currentStatusObj = availableStatuses.find(s => s.value === status);
  
    const cancelledStyle = status === AppointmentStatus.CANCELLED
      ? "border border-red-400 bg-red-50 text-red-600"
      : "";
  
    return (
      <Select
        value={status}
        onValueChange={(newStatus) => handleStatusChange(appointmentId, newStatus)}
        disabled={isDisabled}
      >
        <SelectTrigger className={`w-full rounded-full ${cancelledStyle}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentStatusObj?.icon}
              <span>{getStatusLabel(status)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((statusOption) => (
            <SelectItem key={statusOption.value} value={statusOption.value}>
              <div className="flex items-center gap-2">
                {statusOption.icon}
                <span>{statusOption.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderActionButtons = (appointment: AppointmentDto) => {
    const { appointmentId, status } = appointment;
    const isEditDisabled =
      status === AppointmentStatus.COMPLETED ||
      status === AppointmentStatus.CANCELLED;

    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(appointmentId)}
          className="h-8 w-8 p-0"
          title="Xem chi tiết"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(appointmentId)}
          className="h-8 w-8 p-0"
          title={isEditDisabled ? "Không thể chỉnh sửa lịch hẹn đã hoàn thành hoặc đã hủy" : "Chỉnh sửa"}
          disabled={isEditDisabled}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div>
      {currentLoading ? (
        <div>
          <TableSkeleton rows={10} columns={6} />
      </div>
      ) : safeAppointments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Không tìm thấy lịch hẹn nào</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="w-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="min-w-[30px]">Lịch hẹn</TableHead>
                      <TableHead className="min-w-[150px]">Trạng thái</TableHead>
                      <TableHead className="min-w-[120px]">Họ và tên</TableHead>
                      <TableHead className="min-w-[120px]">Ngày sinh</TableHead>
                      <TableHead className="min-w-[60px]">Giới tính</TableHead>
                      <TableHead className="min-w-[60px]">Điện thoại</TableHead>
                      <TableHead className="min-w-[120px]">Địa chỉ</TableHead>
                      <TableHead className="min-w-[120px]">Bác sĩ</TableHead>
                      <TableHead className="min-w-[100px]">Ngày khám</TableHead>
                      <TableHead className="min-w-[120px]">Giờ khám</TableHead>
                      <TableHead className="min-w-[80px]">Loại</TableHead>
                      <TableHead className="min-w-[100px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeAppointments.map((appointment) => {
                      return (
                        <TableRow key={appointment.appointmentId}>
                          <TableCell className="font-medium">
                            #{appointment.appointmentId}
                          </TableCell>
                          <TableCell>
                            {renderStatusSelect(appointment)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {appointment.patientName}
                          </TableCell>
                          <TableCell>
                            {appointment.patientDateOfBirth
                              ? `${formatDate(appointment.patientDateOfBirth)} (${age(appointment.patientDateOfBirth)} tuổi)`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {renderGender(appointment.patientGender)}
                          </TableCell>
                          <TableCell>
                            {formatPhone(appointment.patientPhone)}
                          </TableCell>
                          <TableCell>
                            {appointment.patientAddress}
                          </TableCell>
                          <TableCell>
                            {appointment.doctorName}
                          </TableCell>
                          <TableCell>
                            {formatDate(appointment.startAt)}
                          </TableCell>
                          <TableCell>
                            {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTypeLabel(appointment.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderActionButtons(appointment)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <TablePagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange} 
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
      )}
    </div>
  );
}
