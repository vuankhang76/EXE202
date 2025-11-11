import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Wallet, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import appointmentService from '@/services/appointmentService';
import type { PaymentTransactionCreateDto } from '@/types/paymentTransaction';
import type { AppointmentCreateDto } from '@/types/appointment';
import type { TenantDto, DoctorDto } from '@/types';
import type { Service } from '@/types/service';
import { toast } from 'sonner';

interface PaymentPageState {
  appointmentData: AppointmentCreateDto;
  tenantId: number;
  patientId: number;
  amount: number;
  clinic: TenantDto;
  doctor: DoctorDto;
  service: Service;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentPageState;

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state || !state.appointmentData) {
      toast.error('Không tìm thấy thông tin đặt lịch');
      navigate('/patient/appointments');
    }
  }, [state, navigate]);

  const handlePayment = async () => {
    if (!state) return;

    setLoading(true);
    try {
      const appointmentResponse = await appointmentService.createAppointment(state.appointmentData);
      
      if (!appointmentResponse.success || !appointmentResponse.data) {
        toast.error(appointmentResponse.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.');
        return;
      }

      const createdAppointment = appointmentResponse.data;

      const paymentData: PaymentTransactionCreateDto = {
        tenantId: state.tenantId,
        patientId: state.patientId,
        appointmentId: createdAppointment.appointmentId,
        amount: state.amount,
        currency: 'VND',
        method: paymentMethod === 'cash' 
          ? 'CASH' 
          : 'BANK_TRANSFER'
      };

      const paymentResponse = await paymentTransactionService.createPaymentTransaction(paymentData);
      
      if (!paymentResponse.success) {
        toast.error('Lịch hẹn đã được tạo nhưng không thể tạo giao dịch thanh toán. Vui lòng thanh toán tại phòng khám.');
        navigate('/patient/appointments');
        return;
      }

      toast.success('Đặt lịch thành công!');
      navigate('/patient/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt lịch và thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (!state) {
    return null;
  }

  const { clinic, doctor, service, appointmentDate, appointmentTime, appointmentType } = state;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-red-500" />
              Thanh toán
            </h1>
            <p className="text-gray-600 mt-2">
              Chọn phương thức thanh toán cho lịch khám của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setPaymentMethod('cash');
                    }}
                    className={`w-full p-5 border-2 rounded-lg transition-all text-left ${
                      paymentMethod === 'cash'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            Tiền mặt
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Thanh toán trực tiếp tại phòng khám khi đến khám
                          </p>
                        </div>
                      </div>
                      {paymentMethod === 'cash' && (
                        <Check className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`border-2 rounded-lg transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setPaymentMethod('bank_transfer');
                      }}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              Chuyển khoản ngân hàng
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Chuyển khoản trực tiếp qua ngân hàng
                            </p>
                          </div>
                        </div>
                        {paymentMethod === 'bank_transfer' && (
                          <Check className="w-6 h-6 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="px-5 pb-5">
                        <label className="block text-sm font-medium text-gray-700">Lưu ý: Thanh toán tại phòng khám sau khi khám.</label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b">
                    Chi tiết đặt lịch
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Clinic */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phòng khám</p>
                      <div className="flex items-center gap-3">
                        {clinic.thumbnailUrl && (
                          <img
                            src={clinic.thumbnailUrl}
                            alt={clinic.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{clinic.name}</p>
                          <p className="text-xs text-gray-600">{clinic.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Dịch vụ</p>
                      <p className="font-medium text-gray-900">{service.name}</p>
                    </div>

                    {/* Doctor */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Bác sĩ</p>
                      <div className="flex items-center gap-2">
                        {doctor.avatarUrl && (
                          <img
                            src={doctor.avatarUrl}
                            alt={doctor.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doctor.fullName}</p>
                          {doctor.specialty && (
                            <p className="text-xs text-gray-600">{doctor.specialty}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Thời gian</p>
                      <p className="font-medium text-gray-900 text-sm">{appointmentDate}</p>
                      <p className="text-sm text-gray-600">{appointmentTime}</p>
                    </div>

                    {/* Appointment Type */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Hình thức</p>
                      <p className="font-medium text-gray-900 text-sm">{appointmentType}</p>
                    </div>

                    {/* Total Amount */}
                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Tổng tiền:</p>
                        <p className="text-2xl font-bold text-red-600">
                          {state.amount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white"
                    size="lg"
                  >
                    {loading ? (
                      <>Đang xử lý...</>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Xác nhận thanh toán
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Bằng việc xác nhận, bạn đồng ý với các điều khoản và điều kiện của chúng tôi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
