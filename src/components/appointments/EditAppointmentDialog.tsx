import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import type { AppointmentDto, AppointmentFormData } from '@/types/appointment';
import { AppointmentType } from '@/types/appointment';
import { Clock, AlertCircle } from 'lucide-react';
import { useApiCall } from '@/hooks/useApiCall';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { useDoctorSearch } from '@/hooks/useDoctorSearch';
import appointmentService from '@/services/appointmentService';
import { toast } from 'sonner';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { Combobox } from '@/components/ui/Combobox';
import { useAuth } from '@/contexts/AuthContext';

interface EditAppointmentDialogProps {
  appointment: AppointmentDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess
}: EditAppointmentDialogProps) {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: 0,
    doctorId: 0,
    tenantId: tenantId,
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: AppointmentType.CLINIC,
    notes: ''
  });

  const patientSearch = usePatientSearch(tenantId);
  const doctorSearch = useDoctorSearch(tenantId);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  useEffect(() => {
    if (appointment && open) {
      const startDate = new Date(appointment.startAt);
      const endDate = new Date(appointment.endAt);
      
      const appointmentDate = startDate.toISOString().split('T')[0];
      const startTime = startDate.toTimeString().slice(0, 5);
      const endTime = endDate.toTimeString().slice(0, 5);

      setFormData({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        tenantId: appointment.tenantId,
        appointmentDate,
        startTime,
        endTime,
        type: appointment.type,
        notes: appointment.notes || ''
      });

      // Set selected IDs and search terms
      if (appointment.patientId) {
        patientSearch.setSelectedPatientId(appointment.patientId.toString());
        patientSearch.setSearchTerm(appointment.patientName || '');
      }
      
      if (appointment.doctorId) {
        doctorSearch.setSelectedDoctorId(appointment.doctorId.toString());
        doctorSearch.setSearchTerm(appointment.doctorName || '');
      }
    }
  }, [appointment, open]);

  useEffect(() => {
    const loadAvailableTimeSlots = async () => {
      const doctorId = parseInt(doctorSearch.selectedDoctorId);
      if (!doctorId || isNaN(doctorId) || !formData.appointmentDate || !open) {
        setAvailableTimeSlots([]);
        setAvailabilityMessage(null);
        return;
      }

      try {
        setLoadingTimeSlots(true);
        setAvailabilityMessage(null);
        const result = await appointmentService.getAvailableTimeSlots(doctorId, formData.appointmentDate, 30, true);
        
        if (result.success && result.data && result.data.length > 0) {
          setAvailableTimeSlots(result.data);
          setAvailabilityMessage({
            type: 'success',
            message: `Có ${result.data.length} khung giờ trống`
          });
        } else {
          setAvailableTimeSlots([]);
          setAvailabilityMessage({
            type: 'info',
            message: 'Bác sĩ không có khung giờ trống trong ngày này'
          });
        }
      } catch (error) {
        console.error('Error loading time slots:', error);
        setAvailableTimeSlots([]);
        setAvailabilityMessage({
          type: 'error',
          message: 'Không thể tải khung giờ trống'
        });
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    loadAvailableTimeSlots();
  }, [doctorSearch.selectedDoctorId, formData.appointmentDate, open]);

  useEffect(() => {
    const checkAvailability = async () => {
      const doctorId = parseInt(doctorSearch.selectedDoctorId);
      if (!doctorId || !formData.appointmentDate || !formData.startTime || !formData.endTime || !open) {
        return;
      }

      if (appointment && 
          formData.appointmentDate === new Date(appointment.startAt).toISOString().split('T')[0] &&
          formData.startTime === new Date(appointment.startAt).toTimeString().slice(0, 5) &&
          formData.endTime === new Date(appointment.endAt).toTimeString().slice(0, 5)) {
        setAvailabilityMessage({
          type: 'info',
          message: 'Giữ nguyên thời gian ban đầu'
        });
        return;
      }

      try {
        setCheckingAvailability(true);
        const startAt = appointmentService.buildStartAtISO(formData.appointmentDate, formData.startTime);
        const endAt = appointmentService.buildEndAtISOFromTime(formData.appointmentDate, formData.endTime);
        
        const result = await appointmentService.checkDoctorAvailability(doctorId, startAt, endAt, true);
        
        if (result.success && result.data === true) {
          setAvailabilityMessage(null);
        } else {
          setAvailabilityMessage({
            type: 'error',
            message: '✗ Bác sĩ đã có lịch trong khung giờ này. Vui lòng chọn giờ khác.'
          });
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [doctorSearch.selectedDoctorId, formData.appointmentDate, formData.startTime, formData.endTime, appointment, open]);

  const updateAppointmentWrapper = async (formData: AppointmentFormData) => {
    if (!appointment) throw new Error('No appointment to update');
    
    try {
      const startAt = appointmentService.buildStartAtISO(formData.appointmentDate, formData.startTime);
      const endAt = appointmentService.buildEndAtISOFromTime(formData.appointmentDate, formData.endTime);
      const updateDto = {
        startAt,
        endAt,
        type: formData.type,
        status: appointment.status
      };
      
      const result = await appointmentService.updateAppointment(appointment.appointmentId, updateDto);
      return result;
    } catch (error: any) {
      console.error('Error in wrapper:', error);
      throw error;
    }
  };

  const { execute: updateAppointment, isLoading } = useApiCall(
    updateAppointmentWrapper,
    {
      successMessage: 'Cập nhật lịch hẹn thành công!',
      showSuccessToast: true,
      showErrorToast: false,
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.appointmentDate || !formData.startTime || !formData.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    await updateAppointment(formData);
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

    const availableTimes = new Set(
      availableTimeSlots.map(slot => {
        const date = new Date(slot);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      })
    );

    for (let hour = 7; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
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
        
        let isAvailable = false;
        
        if (!isEndTime) {
          isAvailable = availableTimeSlots.length > 0 && availableTimes.has(timeStr);
        } else if (formData.startTime) {
          const startTimeAvailable = availableTimes.has(formData.startTime);
          
          if (startTimeAvailable) {
            const [startHour, startMin] = formData.startTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = hour * 60 + minute;
            const durationMinutes = endMinutes - startMinutes;
            
            if (durationMinutes > 0 && durationMinutes <= 180) {
              const slotsNeeded = Math.ceil(durationMinutes / 30);
              let allSlotsAvailable = true;
              
              for (let i = 0; i < slotsNeeded; i++) {
                const slotMinutes = startMinutes + (i * 30);
                const slotHour = Math.floor(slotMinutes / 60);
                const slotMin = slotMinutes % 60;
                const slotTimeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
                
                if (!availableTimes.has(slotTimeStr)) {
                  allSlotsAvailable = false;
                  break;
                }
              }
              
              isAvailable = allSlotsAvailable;
            }
          }
        }
        
        const label = isAvailable ? `${displayTime} ✓` : displayTime;
        
        options.push({ value: timeStr, label });
      }
    }
    return options;
  };

  const timeOptions = useMemo(() => generateTimeOptions(), [formData.appointmentDate, availableTimeSlots]);
  const endTimeOptions = useMemo(() => generateTimeOptions(true), [formData.appointmentDate, formData.startTime, availableTimeSlots]);

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin lịch hẹn #{appointment.appointmentId}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Bệnh nhân *</Label>
              <Combobox
                selectedValue={patientSearch.selectedPatientId}
                onSelectedValueChange={(value: string) => {
                  patientSearch.setSelectedPatientId(value);
                }}
                searchValue={patientSearch.searchTerm}
                onSearchValueChange={patientSearch.setSearchTerm}
                items={patientSearch.items}
                isLoading={patientSearch.isLoading}
                hasSearched={patientSearch.hasSearched}
                placeholder="Chọn bệnh nhân..."
                searchPlaceholder="Tìm kiếm bệnh nhân..."
                emptyMessage="Không tìm thấy bệnh nhân"
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor">Bác sĩ *</Label>
              <Combobox
                selectedValue={doctorSearch.selectedDoctorId}
                onSelectedValueChange={(value: string) => {
                  doctorSearch.setSelectedDoctorId(value);
                }}
                searchValue={doctorSearch.searchTerm}
                onSearchValueChange={doctorSearch.setSearchTerm}
                items={doctorSearch.items}
                isLoading={doctorSearch.isLoading}
                hasSearched={doctorSearch.hasSearched}
                placeholder="Chọn bác sĩ..."
                searchPlaceholder="Tìm kiếm bác sĩ..."
                emptyMessage="Không tìm thấy bác sĩ"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Ngày hẹn *</Label>
              <SimpleDatePicker
                value={getDisplayDate()}
                onChange={handleDateChange}
                placeholder="Chọn ngày"
                minDate={new Date()}
                className="w-full"
                disabled={!doctorSearch.selectedDoctorId || doctorSearch.selectedDoctorId === 'search'}
              />
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
                  <SelectItem value={AppointmentType.CLINIC}>Khám tại phòng khám</SelectItem>
                  <SelectItem value={AppointmentType.HOME}>Khám tại nhà</SelectItem>
                  <SelectItem value={AppointmentType.ONLINE}>Khám online</SelectItem>
                  <SelectItem value={AppointmentType.PHONE}>Tư vấn điện thoại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Availability Status */}
          {(loadingTimeSlots || checkingAvailability || availabilityMessage?.type === 'error') && (
            <Alert variant={availabilityMessage?.type === 'error' ? 'destructive' : availabilityMessage?.type === 'success' ? 'success' : 'default'} className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {loadingTimeSlots ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-3 w-3 animate-spin" />
                    Đang tải khung giờ trống...
                  </span>
                ) : checkingAvailability ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-3 w-3 animate-spin" />
                    Đang kiểm tra lịch bác sĩ...
                  </span>
                ) : availabilityMessage?.type === 'error' ? (
                  availabilityMessage.message
                ) : availabilityMessage?.type === 'success' ? (
                  availabilityMessage.message
                ) : null}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Giờ bắt đầu *</Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => handleInputChange('startTime', value)}
                disabled={!formData.appointmentDate || !doctorSearch.selectedDoctorId}
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
                disabled={!formData.appointmentDate || !formData.startTime || !doctorSearch.selectedDoctorId}
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
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || checkingAvailability || (availabilityMessage?.type === 'error')}
            >
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
