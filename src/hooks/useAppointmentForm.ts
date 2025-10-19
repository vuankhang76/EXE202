import { useState, useEffect } from 'react';
import appointmentService from '@/services/appointmentService';
import type { AppointmentFormData } from '@/types/appointment';
import { AppointmentType } from '@/types/appointment';

interface UseAppointmentFormOptions {
  tenantId: number;
  doctorId: string;
  slotDurationMinutes: number;
}

export function useAppointmentForm({ tenantId, doctorId, slotDurationMinutes }: UseAppointmentFormOptions) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: 0,
    doctorId: 0,
    tenantId: tenantId,
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: AppointmentType.CLINIC,
    notes: '',
    estimatedCost: 0
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

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
      estimatedCost: 0
    });
    setAvailableTimeSlots([]);
    setAvailabilityMessage(null);
  };

  // Load available time slots when doctor and date change
  useEffect(() => {
    const loadAvailableTimeSlots = async () => {
      const selectedDoctorId = parseInt(doctorId);
      if (!selectedDoctorId || isNaN(selectedDoctorId) || !formData.appointmentDate) {
        setAvailableTimeSlots([]);
        setAvailabilityMessage(null);
        return;
      }

      try {
        setLoadingTimeSlots(true);
        setAvailabilityMessage(null);
        setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
        
        const result = await appointmentService.getAvailableTimeSlots(
          selectedDoctorId, 
          formData.appointmentDate, 
          slotDurationMinutes,
          true
        );
                
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
  }, [doctorId, formData.appointmentDate, slotDurationMinutes]);

  // Check availability when time changes
  useEffect(() => {
    const checkAvailability = async () => {
      const selectedDoctorId = parseInt(doctorId);
      if (!selectedDoctorId || !formData.appointmentDate || !formData.startTime || !formData.endTime) {
        if (availabilityMessage?.type === 'error') {
          setAvailabilityMessage(null);
        }
        return;
      }

      try {
        setCheckingAvailability(true);
        const startAt = appointmentService.buildStartAtISO(formData.appointmentDate, formData.startTime);
        const endAt = appointmentService.buildEndAtISOFromTime(formData.appointmentDate, formData.endTime);
        
        const result = await appointmentService.checkDoctorAvailability(selectedDoctorId, startAt, endAt, true);
        
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
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [doctorId, formData.appointmentDate, formData.startTime, formData.endTime, availabilityMessage?.type]);

  return {
    formData,
    setFormData,
    availableTimeSlots,
    loadingTimeSlots,
    checkingAvailability,
    availabilityMessage,
    handleInputChange,
    handleDateChange,
    resetForm
  };
}
