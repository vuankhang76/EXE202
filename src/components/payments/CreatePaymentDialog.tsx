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
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Plus } from 'lucide-react';
import { useApiCall } from '@/hooks/useApiCall';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import appointmentService from '@/services/appointmentService';
import { Combobox } from '@/components/ui/Combobox';
import { useAuth } from '@/contexts/AuthContext';
import { PAYMENT_METHODS } from '@/types/paymentTransaction';
import type { PaymentTransactionCreateDto } from '@/types/paymentTransaction';
import type { AppointmentDto } from '@/types/appointment';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CreatePaymentDialogProps {
  onSuccess?: () => void;
}

export default function CreatePaymentDialog({ onSuccess }: CreatePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [formData, setFormData] = useState<PaymentTransactionCreateDto>({
    tenantId: tenantId,
    patientId: 0,
    appointmentId: undefined,
    amount: 0,
    currency: 'VND',
    method: 'BANK_TRANSFER', // Only bank transfer available
    providerRef: '',
  });

  const patientSearch = usePatientSearch(tenantId);
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');

  // Load appointments when patient is selected
  useEffect(() => {
    const loadAppointments = async () => {
      if (!formData.patientId || formData.patientId === 0 || !tenantId) {
        setAppointments([]);
        return;
      }

      try {
        setLoadingAppointments(true);

        const appointmentsResult = await appointmentService.getPatientAppointments(formData.patientId, tenantId);

        const paymentsResult = await paymentTransactionService.getPatientPaymentTransactions(formData.patientId, tenantId);

        if (appointmentsResult.success && appointmentsResult.data) {
          const paidAppointmentIds = new Set<number>();
          if (paymentsResult.success && paymentsResult.data) {
            paymentsResult.data.forEach((payment: any) => {
              if (payment.appointmentId && (payment.status === 'COMPLETED' || payment.status === 'PENDING')) {
                paidAppointmentIds.add(payment.appointmentId);
              }
            });
          }
          const filteredAppointments = appointmentsResult.data.filter(apt =>
            apt.tenantId === tenantId &&
            (apt.status === 'Scheduled' || apt.status === 'Confirmed' || apt.status === 'InProgress') &&
            !paidAppointmentIds.has(apt.appointmentId)
          );

          setAppointments(filteredAppointments);
        }
      } catch (error) {
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [formData.patientId, tenantId]);

  const createPaymentWrapper = async (data: PaymentTransactionCreateDto) => {
    const result = await paymentTransactionService.processPayment(data);
    return result;
  };

  const { execute: createPayment, isLoading } = useApiCall(
    createPaymentWrapper,
    {
      successMessage: 'Tạo giao dịch thanh toán thành công!',
      showSuccessToast: true,
      showErrorToast: true,
      onSuccess: () => {
        setOpen(false);
        resetForm();
        onSuccess?.();
      },
    }
  );

  const age = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  const resetForm = () => {
    setFormData({
      tenantId: tenantId,
      patientId: 0,
      appointmentId: undefined,
      amount: 0,
      currency: 'VND',
      method: 'CASH',
      providerRef: '',
    });
    patientSearch.setSearchTerm('');
    patientSearch.setSelectedPatientId('');
    setAppointments([]);
    setSelectedAppointment('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      return;
    }

    if (formData.amount <= 0) {
      return;
    }

    await createPayment(formData);
  };

  const handlePatientSelect = (patientId: string) => {
    patientSearch.setSelectedPatientId(patientId);
    setFormData(prev => ({
      ...prev,
      patientId: parseInt(patientId),
      appointmentId: undefined
    }));
    setSelectedAppointment('');
  };

  const handleAppointmentSelect = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setFormData(prev => ({
      ...prev,
      appointmentId: appointmentId ? parseInt(appointmentId) : undefined
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo giao dịch mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo giao dịch thanh toán mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết để tạo giao dịch thanh toán cho bệnh nhân
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              1️⃣ Thông tin bệnh nhân
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="required">Bệnh nhân</Label>
                <Combobox
                  items={patientSearch.patients.map(p => ({ value: p.patientId.toString(), label: `${p.fullName} - ${age(p.dateOfBirth)} tuổi (${p.primaryPhoneE164})`}))}
                  selectedValue={patientSearch.selectedPatientId}
                  onSelectedValueChange={handlePatientSelect}
                  searchValue={patientSearch.searchTerm}
                  onSearchValueChange={patientSearch.setSearchTerm}
                  placeholder="Chọn bệnh nhân..."
                  emptyMessage="Không tìm thấy bệnh nhân"
                  searchPlaceholder="Tìm bệnh nhân..."
                />
              </div>

              <div className="space-y-2">
                <Label>Lịch hẹn (tùy chọn)</Label>
                {formData.patientId === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">
                    Vui lòng chọn bệnh nhân trước
                  </p>
                ) : loadingAppointments ? (
                  <p className="text-sm text-muted-foreground py-2">Đang tải lịch hẹn...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">
                    Bệnh nhân chưa có lịch hẹn nào
                  </p>
                ) : (
                  <Combobox
                    items={appointments.map(apt => ({
                      value: apt.appointmentId.toString(),
                      label: `#${apt.appointmentId} - ${format(new Date(apt.startAt), 'dd/MM/yyyy HH:mm', { locale: vi })} ${apt.doctorName ? `(${apt.doctorName})` : ''}`
                    }))}
                    selectedValue={selectedAppointment}
                    onSelectedValueChange={handleAppointmentSelect}
                    placeholder="Chọn lịch hẹn..."
                    emptyMessage="Không tìm thấy lịch hẹn"
                    searchPlaceholder="Tìm lịch hẹn..."
                  />
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              2️⃣ Thông tin thanh toán
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="required">Số tiền</Label>
                <Input
                  className='h-9'
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Nhập số tiền..."
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              {/* Method is fixed to BANK_TRANSFER - no selection needed */}
              <div className="space-y-2">
                <Label>Phương thức thanh toán</Label>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-2xl">🏦</span>
                  <span className="font-medium text-blue-900">Chuyển khoản ngân hàng</span>
                </div>
                <p className="text-xs text-gray-500">Phương thức duy nhất được hỗ trợ</p>
              </div>

              <div className="space-y-2">
                <Label>Loại tiền tệ</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại tiền..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND (₫)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Tạo giao dịch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

