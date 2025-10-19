import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { DoctorDto } from '@/types';

interface DoctorsSectionProps {
  doctors: DoctorDto[];
  loading: boolean;
}

export default function DoctorsSection({ doctors, loading }: DoctorsSectionProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerView = 4;
  const maxSlide = Math.max(0, doctors.length - itemsPerView);

  const handleNext = () => {
    setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => prev <= 0 ? maxSlide : prev - 1);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
              <UserRound className="w-4 h-4" />
              Bác sĩ
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Đội ngũ bác sĩ
            </h2>
            <p className="text-lg text-gray-600">
              Đang tải dữ liệu bác sĩ...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (doctors.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
              <UserRound className="w-4 h-4" />
              Bác sĩ
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Đội ngũ bác sĩ chuyên nghiệp
            </h2>
            <p className="text-lg text-gray-600">
              Hiện chưa có bác sĩ nào đã được xác thực
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <UserRound className="w-4 h-4" />
            Bác sĩ
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Đội ngũ bác sĩ chuyên nghiệp
          </h2>
          <p className="text-lg text-gray-600">
            Các bác sĩ giàu kinh nghiệm, được chứng nhận và tận tâm
          </p>
        </div>
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}
            >
              {doctors.map((doctor) => (
                <div key={doctor.doctorId} className="min-w-[calc(25%-1.125rem)] flex-shrink-0">
                  <Card 
                    className="border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white h-full"
                    onClick={() => navigate(`/doctor/${doctor.doctorId}`)}
                  >
                    <CardContent className="">
                      <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                        <img 
                          src={doctor.avatarUrl || '/api/placeholder/300/300'} 
                          alt={doctor.fullName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-500 transition-colors">
                        {doctor.title && <span>{doctor.title} </span>}
                        {doctor.fullName}
                      </h3>
                      {doctor.specialty && (
                        <p className="text-sm text-gray-600 mb-3">{doctor.specialty}</p>
                      )}
                      {doctor.tenantName && (
                        <p className="text-xs text-gray-500">{doctor.tenantName}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          {doctors.length > itemsPerView && (
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
