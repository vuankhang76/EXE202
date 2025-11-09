import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Plus } from 'lucide-react';
import { Combobox } from '@/components/ui/Combobox';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApiCall } from '@/hooks/useApiCall';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { useDoctorSearch } from '@/hooks/useDoctorSearch';
import { useAppointmentForm } from '@/hooks/useAppointmentForm';
import { usePatientRegistration } from '@/hooks/usePatientRegistration';
import { PatientSelector } from './PatientSelector';
import { AppointmentScheduler } from './AppointmentScheduler';
import appointmentService from '@/services/appointmentService';
import { serviceService } from '@/services/serviceService';
import { tenantSettingService } from '@/services/tenantSettingService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import type { AppointmentFormData } from '@/types/appointment';
import { AppointmentType } from '@/types/appointment';
import type { Service } from '@/types/service';

interface CreateAppointmentDialogProps {
  onSuccess?: () => void;
}

export default function CreateAppointmentDialog({ onSuccess }: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;
  
  const patientSearch = usePatientSearch(tenantId);
  const doctorSearch = useDoctorSearch(tenantId);
  
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [loadingServices, setLoadingServices] = useState(false);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(30);

  const appointmentForm = useAppointmentForm({
    tenantId,
    doctorId: doctorSearch.selectedDoctorId,
    slotDurationMinutes
  });

  const patientRegistration = usePatientRegistration(tenantId);

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
    appointmentForm.resetForm();
    patientSearch.setSearchTerm('');
    patientSearch.setSelectedPatientId('');
    doctorSearch.setSearchTerm('');
    doctorSearch.setSelectedDoctorId('');
    setSelectedServiceId(0);
    patientRegistration.resetRegistrationForm();
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
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (selectedServiceId > 0) {
      const selectedService = services.find(s => s.serviceId === selectedServiceId);
      if (selectedService) {
        appointmentForm.setFormData(prev => ({ ...prev, estimatedCost: selectedService.basePrice }));
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
    
    if (!appointmentForm.formData.appointmentDate || !appointmentForm.formData.startTime || !appointmentForm.formData.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (appointmentForm.formData.startTime >= appointmentForm.formData.endTime) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    const submitData = {
      ...appointmentForm.formData,
      patientId: selectedPatientId,
      doctorId: selectedDoctorId
    };

    await createAppointment(submitData);
  };

  const handleQuickRegister = () => {
    patientRegistration.handleQuickRegister((newPatientId) => {
      patientSearch.setSelectedPatientId(newPatientId.toString());
    });
  };

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
            {/* Patient Selector */}
            <PatientSelector
              patientSearch={patientSearch}
              showRegisterForm={patientRegistration.showRegisterForm}
              onShowRegisterForm={patientRegistration.setShowRegisterForm}
              newPatientData={patientRegistration.newPatientData}
              registrationErrors={patientRegistration.registrationErrors}
              isRegistering={patientRegistration.isRegistering}
              onPatientFieldChange={patientRegistration.updatePatientField}
              onQuickRegister={handleQuickRegister}
            />
            
            {/* Doctor Selector */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Bác sĩ *</Label>
              <Combobox
                selectedValue={doctorSearch.selectedDoctorId}
                onSelectedValueChange={doctorSearch.setSelectedDoctorId}
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
            {/* Appointment Scheduler */}
            <AppointmentScheduler
              appointmentDate={appointmentForm.formData.appointmentDate}
              startTime={appointmentForm.formData.startTime}
              endTime={appointmentForm.formData.endTime}
              doctorSearch={doctorSearch}
              availableTimeSlots={appointmentForm.availableTimeSlots}
              loadingTimeSlots={appointmentForm.loadingTimeSlots}
              checkingAvailability={appointmentForm.checkingAvailability}
              availabilityMessage={appointmentForm.availabilityMessage}
              slotDurationMinutes={slotDurationMinutes}
              onDateChange={appointmentForm.handleDateChange}
              onStartTimeChange={(time) => appointmentForm.handleInputChange('startTime', time)}
              onEndTimeChange={(time) => appointmentForm.handleInputChange('endTime', time)}
            />
            
            {/* Appointment Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Loại hẹn</Label>
              <Select
                value={appointmentForm.formData.type}
                onValueChange={(value) => appointmentForm.handleInputChange('type', value)}
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

          {/* Service Selection */}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú <span className="text-md text-muted-foreground">(Lưu ý: ghi địa chỉ nhà với loại hẹn khám tại nhà)</span></Label>
            <Textarea
              id="notes"
              value={appointmentForm.formData.notes || ''}
              onChange={(e) => appointmentForm.handleInputChange('notes', e.target.value)}
              placeholder="Nhập ghi chú thêm"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
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
              disabled={isLoading || appointmentForm.checkingAvailability || (appointmentForm.availabilityMessage?.type === 'error')}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo lịch hẹn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
