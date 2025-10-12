import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Calendar, Eye, Edit } from "lucide-react";
import type { AppointmentDto } from "@/types/appointment";
import { getStatusColor, getStatusLabel, getTypeLabel, AppointmentStatus } from "@/types/appointment";
import { Mars, Venus } from "lucide-react";

interface AppointmentTableProps {
  appointments?: AppointmentDto[];
  currentLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onStatusChange: (id: number, newStatus: string) => Promise<void>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPageChange: (page: number) => void;
}

export default function AppointmentTable({
  appointments = [],
  currentLoading = false,
  currentPage = 1,
  totalPages = 0,
  onStatusChange,
  onView,
  onEdit,
  onPageChange
}: AppointmentTableProps) {
  const safeAppointments = appointments || [];

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
    const { status, appointmentId } = appointment;

    const getAvailableStatuses = (currentStatus: string) => {
      switch (currentStatus) {
        case AppointmentStatus.SCHEDULED:
          return [
            { value: AppointmentStatus.SCHEDULED, label: getStatusLabel(AppointmentStatus.SCHEDULED) },
            { value: AppointmentStatus.CONFIRMED, label: getStatusLabel(AppointmentStatus.CONFIRMED) },
            { value: AppointmentStatus.CANCELLED, label: getStatusLabel(AppointmentStatus.CANCELLED) }
          ];
        case AppointmentStatus.CONFIRMED:
        case AppointmentStatus.BOOKED:
          return [
            { value: currentStatus, label: getStatusLabel(currentStatus) },
            { value: AppointmentStatus.IN_PROGRESS, label: getStatusLabel(AppointmentStatus.IN_PROGRESS) },
            { value: AppointmentStatus.CANCELLED, label: getStatusLabel(AppointmentStatus.CANCELLED) }
          ];
        case AppointmentStatus.IN_PROGRESS:
          return [
            { value: AppointmentStatus.IN_PROGRESS, label: getStatusLabel(AppointmentStatus.IN_PROGRESS) },
            { value: AppointmentStatus.COMPLETED, label: getStatusLabel(AppointmentStatus.COMPLETED) }
          ];
        case AppointmentStatus.COMPLETED:
        case AppointmentStatus.CANCELLED:
        case AppointmentStatus.NO_SHOW:
        case AppointmentStatus.RESCHEDULED:
          return [
            { value: currentStatus, label: getStatusLabel(currentStatus) }
          ];
        default:
          return [
            { value: currentStatus, label: getStatusLabel(currentStatus) }
          ];
      }
    };

    const availableStatuses = getAvailableStatuses(status);
    const isDisabled = availableStatuses.length === 1;

    return (
      <Select
        value={status}
        onValueChange={(newStatus) => onStatusChange(appointmentId, newStatus)}
        disabled={isDisabled}
      >
        <SelectTrigger className={`w-[140px] ${getStatusColor(status)}`}>
          <SelectValue>
            {getStatusLabel(status)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((statusOption) => (
            <SelectItem
              key={statusOption.value}
              value={statusOption.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(statusOption.value)} variant="outline">
                  {statusOption.label}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderActionButtons = (appointment: AppointmentDto) => {
    const { appointmentId, status } = appointment;
    const isEditDisabled = status === AppointmentStatus.COMPLETED ||
      status === AppointmentStatus.CANCELLED ||
      status === AppointmentStatus.NO_SHOW;
    return (
      <div className="flex gap-1 justify-end">
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onPageChange(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onPageChange(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div>
      {currentLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" showText text="Đang tải lịch hẹn..." />
        </div>
      ) : safeAppointments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Không tìm thấy lịch hẹn nào</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto min-h-[500px]">
              <div className="min-w-[1200px] w-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="min-w-[30px]">ID</TableHead>
                      <TableHead className="min-w-[120px]">Họ và tên</TableHead>
                      <TableHead className="min-w-[120px]">Ngày sinh</TableHead>
                      <TableHead className="min-w-[60px]">Giới tính</TableHead>
                      <TableHead className="min-w-[60px]">Điện thoại</TableHead>
                      <TableHead className="min-w-[120px]">Địa chỉ</TableHead>
                      <TableHead className="min-w-[120px]">Bác sĩ</TableHead>
                      <TableHead className="min-w-[100px]">Ngày khám</TableHead>
                      <TableHead className="min-w-[120px]">Giờ khám</TableHead>
                      <TableHead className="min-w-[80px]">Loại</TableHead>
                      <TableHead className="min-w-[150px]">Trạng thái</TableHead>
                      <TableHead className="min-w-[100px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeAppointments.map((appointment) => {

                      return (
                        <TableRow key={appointment.appointmentId}>
                          <TableCell className="font-medium">
                            {appointment.appointmentId}
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
                            {renderStatusSelect(appointment)}
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
          {renderPagination()}
        </>
      )}
    </div>
  );
}
