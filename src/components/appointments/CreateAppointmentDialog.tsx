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
import { serviceService } from '@/services/serviceService';
import { tenantSettingService } from '@/services/tenantSettingService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import patientService from '@/services/patientService';
import { toast } from 'sonner';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { Combobox } from '@/components/ui/Combobox';
import { useAuth } from '@/contexts/AuthContext';
import type { Service } from '@/types/service';
import type { PatientRegistrationDto } from '@/types';

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
    estimatedCost: 0
  });

  const patientSearch = usePatientSearch(tenantId);
  const doctorSearch = useDoctorSearch(tenantId);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [loadingServices, setLoadingServices] = useState(false);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(30);

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newPatientData, setNewPatientData] = useState<PatientRegistrationDto>({
    fullName: '',
    primaryPhoneE164: '',
    gender: '',
    dateOfBirth: undefined,
    address: ''
  });
  
  const [registrationErrors, setRegistrationErrors] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: ''
  });

  const createAppointmentWrapper = async (formData: AppointmentFormData) => {
    try {
      const createDto = appointmentService.convertFormDataToCreateDto(formData);      
      const result = await appointmentService.createAppointment(createDto);
      
      if (formData.type === AppointmentType.CLINIC && result.success && result.data) {
        try {
          const paymentData = {
            tenantId: formData.tenantId,
            patientId: formData.patientId,
            appointmentId: result.data.appointmentId,
            amount: formData.estimatedCost || 0,
            currency: 'VND',
            method: 'Cash',
          };
          
          await paymentTransactionService.createPaymentTransaction(paymentData);
        } catch (paymentError) {
          console.error('Failed to create payment transaction:', paymentError);

        }
      }
      
      return result;
    } catch (error: any) {
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
      estimatedCost: 0
    });
    patientSearch.setSearchTerm('');
    patientSearch.setSelectedPatientId('');
    doctorSearch.setSearchTerm('');
    doctorSearch.setSelectedDoctorId('');
    setAvailableTimeSlots([]);
    setAvailabilityMessage(null);
    setSelectedServiceId(0);
    setShowRegisterForm(false);
    setNewPatientData({
      fullName: '',
      primaryPhoneE164: '',
      gender: '',
      dateOfBirth: undefined,
      address: ''
    });
    setRegistrationErrors({
      fullName: '',
      phone: '',
      dateOfBirth: ''
    });
  };

  const validateField = (field: keyof typeof newPatientData, value: any) => {
    const errors = { ...registrationErrors };
    
    switch (field) {
      case 'fullName':
        if (!value || !value.trim()) {
          errors.fullName = 'Họ tên là bắt buộc';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        } else if (value.length > 200) {
          errors.fullName = 'Họ tên không được vượt quá 200 ký tự';
        } else {
          errors.fullName = '';
        }
        break;
        
      case 'primaryPhoneE164':
        if (!value || !value.trim()) {
          errors.phone = 'Số điện thoại là bắt buộc';
        } else {
          const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
          if (!phoneRegex.test(value.trim())) {
            errors.phone = 'Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx';
          } else {
            errors.phone = '';
          }
        }
        break;
        
      case 'dateOfBirth':
        if (value) {
          const dob = new Date(value);
          const today = new Date();
          if (dob > today) {
            errors.dateOfBirth = 'Ngày sinh không được là ngày tương lai';
          } else {
            const age = today.getFullYear() - dob.getFullYear();
            if (age > 150) {
              errors.dateOfBirth = 'Ngày sinh không hợp lệ';
            } else {
              errors.dateOfBirth = '';
            }
          }
        } else {
          errors.dateOfBirth = '';
        }
        break;
    }
    
    setRegistrationErrors(errors);
  };

  const updatePatientField = (field: keyof typeof newPatientData, value: any) => {
    setNewPatientData({ ...newPatientData, [field]: value });
    validateField(field, value);
  };

  const normalizePhoneToE164 = (phone: string): string => {
    const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
    
    if (cleaned.startsWith('+84')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('84')) {
      return '+' + cleaned;
    }
    
    if (cleaned.startsWith('0')) {
      return '+84' + cleaned.substring(1);
    }
    
    return cleaned;
  };

  const handleQuickRegister = async () => {
    if (!newPatientData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }
    
    if (newPatientData.fullName.trim().length < 2) {
      toast.error('Họ tên phải có ít nhất 2 ký tự');
      return;
    }
    
    if (newPatientData.fullName.length > 200) {
      toast.error('Họ tên không được vượt quá 200 ký tự');
      return;
    }

    if (!newPatientData.primaryPhoneE164.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    const phoneRegex = /^(\+84|84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(newPatientData.primaryPhoneE164.trim())) {
      toast.error('Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx');
      return;
    }

    const cleanPhone = newPatientData.primaryPhoneE164.trim();
    const validPrefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '099',
                          '070', '076', '077', '078', '079',
                          '088', '089',
                          '081', '082', '083', '084', '085',
                          '032', '033', '034', '035', '036', '037', '038', '039',
                          '056', '058',
                          '092', '059',
                          '086', '096', '097', '098',
                          '062', '063', '064', '065', '066', '067', '068', '069'];
    
    const phonePrefix = cleanPhone.startsWith('+84') 
      ? '0' + cleanPhone.substring(3, 5)
      : cleanPhone.startsWith('84')
      ? '0' + cleanPhone.substring(2, 4)
      : cleanPhone.substring(0, 3);
    
    if (!validPrefixes.includes(phonePrefix)) {
      toast.error('Đầu số điện thoại không hợp lệ');
      return;
    }

    if (newPatientData.gender && !['M', 'F', 'O'].includes(newPatientData.gender)) {
      toast.error('Giới tính không hợp lệ');
      return;
    }

    if (newPatientData.dateOfBirth) {
      const dob = new Date(newPatientData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        toast.error('Ngày sinh không được là ngày trong tương lai');
        return;
      }
      
      if (age > 150) {
        toast.error('Ngày sinh không hợp lệ');
        return;
      }
    }

    if (newPatientData.address && newPatientData.address.length > 300) {
      toast.error('Địa chỉ không được vượt quá 300 ký tự');
      return;
    }

    setIsRegistering(true);
    try {
      const normalizedData = {
        ...newPatientData,
        primaryPhoneE164: normalizePhoneToE164(newPatientData.primaryPhoneE164)
      };


      const registerResponse = await patientService.registerPatient(normalizedData);
      
      if (!registerResponse.success || !registerResponse.data) {
        toast.error(registerResponse.message || 'Không thể đăng ký bệnh nhân');
        return;
      }

      const newPatientId = registerResponse.data.patientId;

      const enrollResponse = await patientService.enrollPatientToClinic(newPatientId, tenantId);
      
      if (!enrollResponse.success) {
        toast.error('Đăng ký thành công nhưng không thể thêm vào phòng khám');
        return;
      }

      toast.success('Đăng ký bệnh nhân thành công!');
      
      patientSearch.setSelectedPatientId(newPatientId.toString());
      
      setShowRegisterForm(false);
      
      setNewPatientData({
        fullName: '',
        primaryPhoneE164: '',
        gender: '',
        dateOfBirth: undefined,
        address: ''
      });
    } catch (error: any) {
      console.error('Error registering patient:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký bệnh nhân');
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    if (open && tenantId) {
      loadServicesAndSettings();
    }
  }, [open, tenantId]);

  const loadServicesAndSettings = async () => {
    try {
      setLoadingServices(true);
      const servicesResponse = await serviceService.getTenantServices(tenantId);
      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      }

      const configResponse = await tenantSettingService.getBookingConfig(tenantId);
      if (configResponse.success && configResponse.data) {
        setSlotDurationMinutes(configResponse.data.defaultSlotDurationMinutes);
      }
    } catch (error) {
      console.error('Error loading services and settings:', error);
    } finally {
      setLoadingServices(false);
    }
  };
  useEffect(() => {
    if (selectedServiceId > 0) {
      const selectedService = services.find(s => s.serviceId === selectedServiceId);
      if (selectedService) {
        setFormData(prev => ({ ...prev, estimatedCost: selectedService.basePrice }));
      }
    }
  }, [selectedServiceId, services]);

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

    if (selectedServiceId === 0) {
      toast.error('Vui lòng chọn dịch vụ');
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
        
        const result = await appointmentService.getAvailableTimeSlots(
          doctorId, 
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
  }, [doctorSearch.selectedDoctorId, formData.appointmentDate, slotDurationMinutes]);

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
      minMinute = startMin + slotDurationMinutes;
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = minMinute % 60;
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
      for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
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
              const slotsNeeded = Math.ceil(durationMinutes / slotDurationMinutes); // Use tenant settings
              let allSlotsAvailable = true;
  
              for (let i = 0; i < slotsNeeded; i++) {
                const slotMinutes = startMinutes + i * slotDurationMinutes;
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

  const timeOptions = useMemo(() => generateTimeOptions(), [formData.appointmentDate, availableTimeSlots, slotDurationMinutes]);
  
  const endTimeOptions = useMemo(() => generateTimeOptions(true), [formData.appointmentDate, formData.startTime, availableTimeSlots, slotDurationMinutes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo lịch hẹn mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết để tạo lịch hẹn cho bệnh nhân
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
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
              
              {/* Show register button when search returns no results */}
              {patientSearch.hasSearched && 
               patientSearch.patients.length === 0 && 
               patientSearch.searchTerm.length >= 2 && 
               !patientSearch.isLoading &&
               !showRegisterForm && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowRegisterForm(true);
                    setNewPatientData(prev => ({
                      ...prev,
                      fullName: patientSearch.searchTerm,
                      primaryPhoneE164: patientSearch.searchTerm.match(/^(\+84|0)[0-9]{9,10}$/) ? patientSearch.searchTerm : ''
                    }));
                  }}
                  className="w-full mt-2 border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng ký bệnh nhân mới
                </Button>
              )}

              {/* Quick registration form */}
              {showRegisterForm && (
                <div className="mt-3 p-4 border rounded-lg bg-blue-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-blue-900">Đăng ký bệnh nhân mới</h4>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowRegisterForm(false)}
                      className="h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="newPatientName" className="text-xs">Họ và tên *</Label>
                      <span className="text-xs text-gray-400">{newPatientData.fullName.length}/200</span>
                    </div>
                    <Input
                      id="newPatientName"
                      placeholder="Nguyễn Văn A"
                      value={newPatientData.fullName}
                      onChange={(e) => updatePatientField('fullName', e.target.value)}
                      className={`h-9 ${registrationErrors.fullName ? 'border-red-500' : ''}`}
                      maxLength={200}
                    />
                    {registrationErrors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{registrationErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPatientPhone" className="text-xs">Số điện thoại *</Label>
                    <Input
                      id="newPatientPhone"
                      placeholder="+84xxxxxxxxx hoặc 0xxxxxxxxx"
                      value={newPatientData.primaryPhoneE164}
                      onChange={(e) => updatePatientField('primaryPhoneE164', e.target.value)}
                      className={`h-9 ${registrationErrors.phone ? 'border-red-500' : ''}`}
                    />
                    {registrationErrors.phone ? (
                      <p className="text-xs text-red-500 mt-1">{registrationErrors.phone}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Sẽ tự động chuyển sang định dạng +84...
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPatientGender" className="text-xs">Giới tính</Label>
                      <Select
                        value={newPatientData.gender}
                        onValueChange={(value) => setNewPatientData({...newPatientData, gender: value})}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Nam</SelectItem>
                          <SelectItem value="F">Nữ</SelectItem>
                          <SelectItem value="O">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPatientDob" className="text-xs">Ngày sinh</Label>
                      <Input
                        id="newPatientDob"
                        type="date"
                        value={newPatientData.dateOfBirth ? new Date(newPatientData.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const dateValue = e.target.value ? new Date(e.target.value).toISOString().split('T')[0] : undefined;
                          updatePatientField('dateOfBirth', dateValue);
                        }}
                        className={`h-9 ${registrationErrors.dateOfBirth ? 'border-red-500' : ''}`}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {registrationErrors.dateOfBirth && (
                        <p className="text-xs text-red-500 mt-1">{registrationErrors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="newPatientAddress" className="text-xs">Địa chỉ</Label>
                      <span className="text-xs text-gray-400">{newPatientData.address?.length || 0}/300</span>
                    </div>
                    <Input
                      id="newPatientAddress"
                      placeholder="123 Đường ABC, Quận XYZ"
                      value={newPatientData.address}
                      onChange={(e) => setNewPatientData({...newPatientData, address: e.target.value})}
                      className="h-9"
                      maxLength={300}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button"
                      onClick={handleQuickRegister} 
                      disabled={isRegistering || !!registrationErrors.fullName || !!registrationErrors.phone || !!registrationErrors.dateOfBirth}
                      className="flex-1 h-9"
                    >
                      {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setShowRegisterForm(false)}
                      disabled={isRegistering}
                      className="h-9"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
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
            <Label htmlFor="service">Dịch vụ / Gói khám *</Label>
            <Select
              value={selectedServiceId.toString()}
              onValueChange={(value) => setSelectedServiceId(parseInt(value))}
              disabled={loadingServices}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingServices ? "Đang tải..." : "Chọn dịch vụ"} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.serviceId} value={service.serviceId.toString()}>
                    {service.name} - {service.basePrice.toLocaleString('vi-VN')}đ
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
