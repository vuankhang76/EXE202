import { Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { DoctorDto } from '@/types';

interface DoctorListProps {
  doctors: DoctorDto[];
}

export default function DoctorList({ doctors }: DoctorListProps) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Đội ngũ bác sĩ
          </h2>
          <p className="text-gray-600">
            Chọn bác sĩ phù hợp với nhu cầu khám chữa bệnh của bạn
          </p>
        </div>

        {doctors.length === 0 ? (
          <Card className="bg-white p-8 text-center">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Hiện tại phòng khám chưa có thông tin bác sĩ
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor.doctorId}
                className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-red-300"
              >
                <CardContent className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      {doctor.avatarUrl ? (
                        <img
                          src={doctor.avatarUrl}
                          alt={doctor.fullName}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-red-50"
                        /> 
                      ) : (
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-16 h-16 text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 text-lg mb-1">
                    {doctor.title && (
                      <span className="font-medium text-gray-900 text-lg">
                        {doctor.title}
                      </span>
                    )}
                    {doctor.title ? ' ' : ''}{doctor.fullName}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-1">
                    {doctor.specialty && (
                      <p className="text-red-500">{doctor.specialty}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
