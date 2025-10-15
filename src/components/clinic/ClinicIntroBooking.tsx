import { Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { TenantDto } from '@/types';
import { formatPhoneNumber } from '@/utils/formatPhone';

interface ClinicIntroBookingProps {
  clinic: TenantDto;
  onBookAppointment: () => void;
}

export default function ClinicIntroBooking({ clinic, onBookAppointment }: ClinicIntroBookingProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8">
        {/* Introduction Section */}
        {clinic.description && (
          <div className="p-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Giới thiệu
            </h2>
            <div 
              className="clinic-description"
              dangerouslySetInnerHTML={{ __html: clinic.description }}
            />
          </div>
        )}

        {/* Booking CTA Section */}
        <div className="p-4 md:p-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sẵn sàng đặt lịch khám?
            </h2>
            <p className="text-gray-600 mb-6">
              Đặt lịch hẹn với bác sĩ chuyên khoa tại {clinic.name} ngay hôm nay. 
              Chúng tôi luôn sẵn sàng chăm sóc sức khỏe của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onBookAppointment}
                className="bg-red-500 hover:bg-red-600 text-white px-8"
                size="lg"
              >
                Đặt lịch khám ngay
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              {clinic.phone && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="px-8"
                >
                  <a href={`tel:${clinic.phone}`}>
                    <Phone className="w-5 h-5 mr-2" />
                    Gọi ngay: {formatPhoneNumber(clinic.phone)}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
