import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Plus, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import type { AppointmentFormData } from '@/types/appointment';
import { AppointmentType } from '@/types/appointment';
import { useApiCall } from '@/hooks/useApiCall';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { useDoctorSearch } from '@/hooks/useDoctorSearch';
import appointmentService from '@/services/appointmentService';
import { toast } from 'sonner';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { Combobox } from '@/components/ui/Combobox';
import { useAuth } from '@/contexts/AuthContext';

interface CreateAppointmentDialogProps {
  onSuccess?: () => void;
}

export default function CreateAppointmentDialog({ onSuccess }: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
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
    notes: '',
    estimatedCost: 200000
  });

  const patientSearch = usePatientSearch(tenantId);
  const doctorSearch = useDoctorSearch(tenantId);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const createAppointmentWrapper = async (formData: AppointmentFormData) => {
    try {
      const createDto = appointmentService.convertFormDataToCreateDto(formData);      
      const result = await appointmentService.createAppointment(createDto);
      return result;
    } catch (error: any) {
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
      tenantId: tenantId,
      appointmentDate: '',
      startTime: '',
      endTime: '',
      type: AppointmentType.CLINIC,
      notes: '',
      estimatedCost: 200000
    });
    patientSearch.setSearchTerm('');
    patientSearch.setSelectedPatientId('');
    doctorSearch.setSearchTerm('');
    doctorSearch.setSelectedDoctorId('');
    setAvailableTimeSlots([]);
    setAvailabilityMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientSearch.selectedPatientId || patientSearch.selectedPatientId === 'search') {
      toast.error('Vui lòng chọn bệnh nhân');
      return;
    }
    
    if (!doctorSearch.selectedDoctorId || doctorSearch.selectedDoctorId === 'search') {
      toast.error('Vui lòng chọn bác sĩ');
      return;
    }
    
    const selectedPatientId = parseInt(patientSearch.selectedPatientId);
    const selectedDoctorId = parseInt(doctorSearch.selectedDoctorId);
    
    if (isNaN(selectedPatientId) || selectedPatientId <= 0) {
      toast.error('ID bệnh nhân không hợp lệ');
      return;
    }
    
    if (isNaN(selectedDoctorId) || selectedDoctorId <= 0) {
      toast.error('ID bác sĩ không hợp lệ');
      return;
    }
    
    if (!formData.appointmentDate || !formData.startTime || !formData.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    const submitData = {
      ...formData,
      patientId: selectedPatientId,
      doctorId: selectedDoctorId
    };

    await createAppointment(submitData);
  };

  useEffect(() => {
    const loadAvailableTimeSlots = async () => {
      const doctorId = parseInt(doctorSearch.selectedDoctorId);
      if (!doctorId || isNaN(doctorId) || !formData.appointmentDate) {
        setAvailableTimeSlots([]);
        setAvailabilityMessage(null);
        return;
      }

      try {
        setLoadingTimeSlots(true);
        setAvailabilityMessage(null);
        setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
        
        const result = await appointmentService.getAvailableTimeSlots(doctorId, formData.appointmentDate, 5, true);
                
        if (result.success && result.data && result.data.length > 0) {
          
          setAvailableTimeSlots(result.data);

        } else {
          setAvailableTimeSlots([]);
          setAvailabilityMessage({
            type: 'info',
            message: 'Bác sĩ không có khung giờ trống trong ngày này'
          });
        }
      } catch (error) {
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
  }, [doctorSearch.selectedDoctorId, formData.appointmentDate]);

  useEffect(() => {
    const checkAvailability = async () => {
      const doctorId = parseInt(doctorSearch.selectedDoctorId);
      if (!doctorId || !formData.appointmentDate || !formData.startTime || !formData.endTime) {
        if (availabilityMessage?.type === 'error') {
          setAvailabilityMessage(null);
        }
        return;
      }

      try {
        setCheckingAvailability(true);
        const startAt = appointmentService.buildStartAtISO(formData.appointmentDate, formData.startTime);
        const endAt = appointmentService.buildEndAtISOFromTime(formData.appointmentDate, formData.endTime);
        
        const result = await appointmentService.checkDoctorAvailability(doctorId, startAt, endAt, true);
        
        if (result.success && result.data === true) {
          setAvailabilityMessage({
            type: 'success',
            message: 'Giờ hẹn đã được kiểm tra và khả dụng'
          });
        } else {
          setAvailabilityMessage({
            type: 'error',
            message: 'Bác sĩ đã có lịch trong khung giờ này. Vui lòng chọn giờ khác.'
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
  }, [doctorSearch.selectedDoctorId, formData.appointmentDate, formData.startTime, formData.endTime, availabilityMessage?.type]);

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
    const isToday =
      selectedDate &&
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    let minHour = 8;
    let minMinute = 0;
  
    if (isEndTime && formData.startTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      minHour = startHour;
      minMinute = startMin + 5;
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = 0;
      }
    }
  
    const availableTimes = new Set(
      availableTimeSlots.map(slot => {
        const date = new Date(slot);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return timeStr;
      })
    );
  
    const workingHours = [
      { start: 8 * 60, end: 12 * 60 },
      { start: 13 * 60 + 30, end: 17 * 60 + 30 },
    ];
  
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const totalMinutes = hour * 60 + minute;
  
        const isInWorkingHours = workingHours.some(
          period => totalMinutes >= period.start && totalMinutes < period.end
        );
        if (!isInWorkingHours) continue;
  
        if (isToday) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) continue;
        }
  
        if (isEndTime) {
          if (hour < minHour || (hour === minHour && minute < minMinute)) continue;
        }
  
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
  
        let isAvailable = false;
        if (!isEndTime) {
          if (availableTimeSlots.length > 0) {
            if (availableTimes.has(timeStr)) {
              isAvailable = true;
            } else {
              const timesSorted = Array.from(availableTimes)
                .map(t => {
                  const [h, m] = t.split(':').map(Number);
                  return h * 60 + m;
                })
                .sort((a, b) => a - b);
              const [hour, min] = timeStr.split(':').map(Number);
              const total = hour * 60 + min;
              for (let i = 0; i < timesSorted.length - 1; i++) {
                if (total > timesSorted[i] && total < timesSorted[i + 1]) {
                  isAvailable = true;
                  break;
                }
              }
            }
          }
        } else if (formData.startTime) {
          const startTimeAvailable = availableTimes.has(formData.startTime);
          
          if (startTimeAvailable) {
            const [startHour, startMin] = formData.startTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = hour * 60 + minute;
            const durationMinutes = endMinutes - startMinutes;
  
            if (durationMinutes > 0 && durationMinutes <= 180) {
              const slotsNeeded = Math.ceil(durationMinutes / 5); // 🔹 thay đổi tính theo 5 phút
              let allSlotsAvailable = true;
  
              for (let i = 0; i < slotsNeeded; i++) {
                const slotMinutes = startMinutes + i * 5;
                const slotHour = Math.floor(slotMinutes / 60);
                const slotMin = slotMinutes % 60;
                const slotTimeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin
                  .toString()
                  .padStart(2, '0')}`;
  
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

          {(loadingTimeSlots || checkingAvailability || availabilityMessage?.type ) && (
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
                  <SelectValue placeholder="Chọn giờ bắt đầu" />
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
                  <SelectValue placeholder="Chọn giờ kết thúc" />
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
            <Label htmlFor="estimatedCost">Chi phí ước tính (VND)</Label>
            <Input
              id="estimatedCost"
              type="number"
              min="0"
              step="10000"
              value={formData.estimatedCost || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
              placeholder="Nhập chi phí ước tính..."
            />
            <p className="text-xs text-muted-foreground">
              Hệ thống sẽ tự động tạo hóa đơn thanh toán với trạng thái PENDING
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú <span className="text-md text-muted-foreground">(Lưu ý: ghi địa chỉ nhà với loại hẹn khám tại nhà)</span></Label>
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
            <Button 
              type="submit" 
              disabled={isLoading || checkingAvailability || (availabilityMessage?.type === 'error')}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo lịch hẹn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
