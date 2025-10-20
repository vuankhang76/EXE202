import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Clock, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Play, 
  MoreHorizontal 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown-menu';
import { type AppointmentDto, getStatusColor, getStatusLabel, getTypeLabel } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: AppointmentDto;
  onConfirm?: (id: number) => void;
  onStart?: (id: number) => void;
  onComplete?: (id: number) => void;
  onCancel?: (id: number) => void;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
}

export default function AppointmentCard({
  appointment,
  onConfirm,
  onStart,
  onComplete,
  onCancel,
  onEdit,
  onView
}: AppointmentCardProps) {
  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return time;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const canConfirm = appointment.status === 'Pending';
  const canStart = appointment.status === 'Confirmed';
  const canComplete = appointment.status === 'InProgress';
  const canCancel = ['Pending', 'Confirmed'].includes(appointment.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
            <Badge variant="outline">
              {getTypeLabel(appointment.type)}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(appointment.appointmentId)}>
                  Xem chi tiết
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(appointment.appointmentId)}>
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              {canCancel && onCancel && (
                <DropdownMenuItem 
                  onClick={() => onCancel(appointment.appointmentId)}
                  className="text-destructive"
                >
                  Hủy lịch hẹn
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{appointment.patientName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(appointment.startAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}</span>
          </div>
          
          {appointment.doctorName && (
            <div className="text-sm text-muted-foreground">
              Bác sĩ: {appointment.doctorName}
            </div>
          )}
          

        </div>

        <div className="flex gap-2">
          {canConfirm && onConfirm && (
            <Button 
              size="sm" 
              onClick={() => onConfirm(appointment.appointmentId)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Xác nhận
            </Button>
          )}
          
          {canStart && onStart && (
            <Button 
              size="sm" 
              onClick={() => onStart(appointment.appointmentId)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Bắt đầu
            </Button>
          )}
          
          {canComplete && onComplete && (
            <Button 
              size="sm" 
              onClick={() => onComplete(appointment.appointmentId)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Hoàn thành
            </Button>
          )}
          
          {canCancel && onCancel && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCancel(appointment.appointmentId)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Hủy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
