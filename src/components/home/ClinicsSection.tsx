import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { TenantDto } from '@/types';

interface ClinicsSectionProps {
  clinics: TenantDto[];
  loading: boolean;
}

export default function ClinicsSection({ clinics, loading }: ClinicsSectionProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerView = 3;
  const maxSlide = Math.max(0, clinics.length - itemsPerView);

  const handleNext = () => {
    setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => prev <= 0 ? maxSlide : prev - 1);
  };

  if (loading) {
    return (
      <section id="clinics" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
              <Building2 className="w-4 h-4" />
              Phòng khám
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Phòng khám uy tín
            </h2>
            <p className="text-lg text-gray-600">
              Đang tải dữ liệu phòng khám...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (clinics.length === 0) {
    return (
      <section id="clinics" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
              <Building2 className="w-4 h-4" />
              Phòng khám
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Phòng khám uy tín
            </h2>
            <p className="text-lg text-gray-600">
              Hiện chưa có phòng khám nào hoạt động
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="clinics" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <Building2 className="w-4 h-4" />
            Phòng khám
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Phòng khám uy tín
          </h2>
          <p className="text-lg text-gray-600">
            Hợp tác với các phòng khám hàng đầu trên toàn quốc
          </p>
        </div>
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}
            >
              {clinics.map((clinic) => (
                <div key={clinic.tenantId} className="min-w-[calc(33.333%-1rem)] flex-shrink-0">
                  <Card 
                    className="border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white h-full"
                    onClick={() => navigate(`/clinic/${clinic.tenantId}`)}
                  >
                    <CardContent className="">
                      <div className="aspect-video bg-gray-100 rounded-xl mb-6 overflow-hidden">
                        <img 
                          src={clinic.coverImageUrl || clinic.thumbnailUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80'} 
                          alt={clinic.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-500 transition-colors">
                        {clinic.name}
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{clinic.address || 'Địa chỉ đang cập nhật'}</span>
                        </div>
                        {(clinic.weekdayOpen && clinic.weekdayClose) && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>T2-T6: {clinic.weekdayOpen} - {clinic.weekdayClose}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          {clinics.length > itemsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 border-gray-200 shadow-lg"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 border-gray-200 shadow-lg"
                onClick={handleNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
