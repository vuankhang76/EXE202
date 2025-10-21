import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import type { TenantDto } from '@/types';
import { formatPhoneNumber } from '@/utils/formatPhone';

interface ClinicHeaderProps {
  clinic: TenantDto;
}

interface ScheduleItem {
  days: string;
  hours: string;
}

export default function ClinicHeader({ clinic }: ClinicHeaderProps) {
  const formatSchedule = (): ScheduleItem[] => {
    const schedule: ScheduleItem[] = [];
    
    if (clinic.weekdayOpen && clinic.weekdayClose) {
      schedule.push({
        days: 'Thứ 2 - Thứ 6:',
        hours: `${clinic.weekdayOpen} - ${clinic.weekdayClose}`
      });
    }
    
    if (clinic.weekendOpen && clinic.weekendClose) {
      schedule.push({
        days: 'Thứ 7 - CN:',
        hours: `${clinic.weekendOpen} - ${clinic.weekendClose}`
      });
    }
    
    return schedule;
  };

  const schedule = formatSchedule();

  return (
    <section className="bg-white py-4">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:col-span-1">
            <div className="relative rounded-2xl overflow-hidden items-center justify-center flex">
              <img
                src={clinic.thumbnailUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80'}
                alt={clinic.name}
                className="w-56 h-56 object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {clinic.name}
              </h1>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {clinic.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Địa chỉ</p>
                    <p className="text-gray-600 text-sm">{clinic.address}</p>
                  </div>
                </div>
              )}

              {clinic.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Điện thoại</p>
                    <p className="text-gray-600 text-sm">{formatPhoneNumber(clinic.phone)}</p>
                  </div>
                </div>
              )}

              {clinic.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600 text-sm">{clinic.email}</p>
                  </div>
                </div>
              )}

              {schedule.length > 0 && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    {schedule.map((item, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        <span className="font-semibold mr-1">{item.days}</span>
                        {item.hours}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
