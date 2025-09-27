import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Plus } from 'lucide-react';
import type { AppointmentFormData } from '@/types/appointment';
import { AppointmentType } from '@/types/appointment';
import { useApiCall } from '@/hooks/useApiCall';
import appointmentService from '@/services/appointmentService';
import { toast } from 'sonner';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { useAuth } from '@/contexts/AuthContext';

interface CreateAppointmentDialogProps {
  onSuccess?: () => void;
}

export default function CreateAppointmentDialog({ onSuccess }: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: 0,
    doctorId: 0,
    tenantId: currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0,
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: AppointmentType.CONSULTATION,
    notes: ''
  });

  const createAppointmentWrapper = async (formData: AppointmentFormData) => {
    try {
      const createDto = appointmentService.convertFormDataToCreateDto(formData);      
      const result = await appointmentService.createAppointment(createDto);
      return result;
    } catch (error) {
      console.error('Error in wrapper:', error);
      throw error;
    }
  };

  const { execute: createAppointment, isLoading } = useApiCall(
    createAppointmentWrapper,
    {
      successMessage: 'Tạo lịch hẹn thành công!',
      showSuccessToast: true,
      showErrorToast: false,
      onSuccess: () => {
        setOpen(false);
        resetForm();
        onSuccess?.();
      },
    }
  );

  const resetForm = () => {
    setFormData({
      patientId: 0,
      doctorId: 0,
      tenantId: 0,
      appointmentDate: '',
      startTime: '',
      endTime: '',
      type: AppointmentType.CONSULTATION,
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || 
        !formData.startTime || !formData.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    await createAppointment(formData);
  };

  const handleInputChange = <K extends keyof AppointmentFormData>(field: K, value: AppointmentFormData[K]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'startTime' && prev.endTime && value) {
        const [startHour, startMin] = (value as string).split(':').map(Number);
        const [endHour, endMin] = prev.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes + 30) {
          newData.endTime = '';
        }
      }
      
      return newData;
    });
  };

  const handleDateChange = (dateStr: string) => {
    if (dateStr) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        handleInputChange('appointmentDate', isoDate);
        
        const selectedDate = new Date(isoDate);
        const now = new Date();
        const isToday = selectedDate.getDate() === now.getDate() &&
          selectedDate.getMonth() === now.getMonth() &&
          selectedDate.getFullYear() === now.getFullYear();
        
        if (isToday) {
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          if (formData.startTime) {
            const [startHour, startMinute] = formData.startTime.split(':').map(Number);
            if (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute)) {
              handleInputChange('startTime', '');
            }
          }
          
          if (formData.endTime) {
            const [endHour, endMinute] = formData.endTime.split(':').map(Number);
            if (endHour < currentHour || (endHour === currentHour && endMinute <= currentMinute)) {
              handleInputChange('endTime', '');
            }
          }
        }
      }
    } else {
      handleInputChange('appointmentDate', '');
    }
  };

  const getDisplayDate = () => {
    if (formData.appointmentDate) {
      const date = new Date(formData.appointmentDate);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    return '';
  };

  const generateTimeOptions = (isEndTime: boolean = false) => {
    const options = [];
    const now = new Date();
    const selectedDate = formData.appointmentDate ? new Date(formData.appointmentDate) : null;
    const isToday = selectedDate && 
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let minHour = 7;
    let minMinute = 0;
    
    if (isEndTime && formData.startTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      minHour = startHour;
      minMinute = startMin + 30;
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = 0;
      }
    }

    for (let hour = 7; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (isToday) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            continue;
          }
        }

        if (isEndTime) {
          if (hour < minHour || (hour === minHour && minute < minMinute)) {
            continue;
          }
        }

        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        });
        options.push({ value: timeStr, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = useMemo(() => generateTimeOptions(), [formData.appointmentDate]);
  const endTimeOptions = useMemo(() => generateTimeOptions(true), [formData.appointmentDate, formData.startTime]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo lịch hẹn mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết để tạo lịch hẹn cho bệnh nhân
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">ID Bệnh nhân *</Label>
              <Input
                id="patientId"
                type="number"
                min="1"
                value={formData.patientId || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0) {
                    handleInputChange('patientId', value);
                  }
                }}
                placeholder="Nhập ID bệnh nhân"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctorId">ID Bác sĩ *</Label>
              <Input
                id="doctorId"
                type="number"
                min="1"
                value={formData.doctorId || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0) {
                    handleInputChange('doctorId', value);
                  }
                }}
                placeholder="Nhập ID bác sĩ"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
            <Label htmlFor="appointmentDate">Ngày hẹn *</Label>
            <SimpleDatePicker
              value={getDisplayDate()}
              onChange={handleDateChange}
              placeholder="Chọn ngày"
              minDate={new Date()}
              className="w-full"
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Giờ bắt đầu *</Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => handleInputChange('startTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Giờ bắt đầu" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Giờ kết thúc *</Label>
              <Select
                value={formData.endTime}
                onValueChange={(value) => handleInputChange('endTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Giờ kết thúc" />
                </SelectTrigger>
                <SelectContent>
                  {endTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Loại hẹn</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppointmentType.CONSULTATION}>Tư vấn</SelectItem>
                  <SelectItem value={AppointmentType.FOLLOW_UP}>Tái khám</SelectItem>
                  <SelectItem value={AppointmentType.ROUTINE_CHECKUP}>Khám định kỳ</SelectItem>
                  <SelectItem value={AppointmentType.SPECIALIST}>Chuyên khoa</SelectItem>
                  <SelectItem value={AppointmentType.EMERGENCY}>Cấp cứu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Nhập ghi chú thêm"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang tạo...' : 'Tạo lịch hẹn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
