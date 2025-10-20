import { Stethoscope, Award, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { DoctorDto } from '@/types';

interface DoctorSelectorProps {
  doctors: DoctorDto[];
  selectedDoctorId?: number;
  onDoctorSelect: (doctor: DoctorDto) => void;
}

export default function DoctorSelector({
  doctors,
  selectedDoctorId,
  onDoctorSelect
}: DoctorSelectorProps) {
  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có bác sĩ nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-red-500" />
        Chọn bác sĩ ({doctors.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doctor) => {
          const isSelected = selectedDoctorId === doctor.doctorId;
          const experience = doctor.yearStarted
            ? new Date().getFullYear() - doctor.yearStarted
            : 0;

          return (
            <Card
              key={doctor.doctorId}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-100 shadow-md'
                  : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
              }`}
              onClick={() => onDoctorSelect(doctor)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.fullName}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-50"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-red-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {doctor.title && (
                        <span className="text-sm font-normal text-gray-600 mr-1">
                          {doctor.title}
                        </span>
                      )}
                      {doctor.fullName}
                    </h4>

                    {doctor.specialty && (
                      <p className="text-sm text-red-500 mb-2 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {doctor.specialty}
                      </p>
                    )}

                    {experience > 0 && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {experience} năm kinh nghiệm
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
