import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, MapPin, Phone, Mail,
    ChevronRight, Stethoscope, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import tenantService from '@/services/tenantService';
import type { TenantDto, DoctorDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ClinicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, userType } = useAuth();

    const [clinic, setClinic] = useState<TenantDto | null>(null);
    const [doctors, setDoctors] = useState<DoctorDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadClinicData();
        }
    }, [id]);

    const loadClinicData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            // Load clinic info
            const clinicResponse = await tenantService.getTenantById(parseInt(id));
            if (clinicResponse.success && clinicResponse.data) {
                setClinic(clinicResponse.data);

                // Load doctors in this clinic using tenant API
                const doctorsResponse = await tenantService.getTenantDoctors(
                    parseInt(id),
                    1,
                    50
                );
                if (doctorsResponse.success && doctorsResponse.data) {
                    setDoctors(doctorsResponse.data.data);
                }
            }
        } catch (error) {
            console.error('Error loading clinic data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (doctor: DoctorDto) => {
        if (!currentUser || userType !== 'patient') {
            // Redirect to login
            navigate('/patient/auth', {
                state: {
                    from: `/clinics/${id}`,
                    message: 'Vui lòng đăng nhập để đặt lịch khám'
                }
            });
            return;
        }

        // Navigate to appointment booking page
        navigate('/patient/appointments/create', {
            state: {
                clinicId: parseInt(id!),
                clinicName: clinic?.name,
                doctorId: doctor.doctorId,
                doctorName: doctor.fullName,
                specialty: doctor.specialty
            }
        });
    };

    const formatSchedule = (weekdayOpen?: string, weekdayClose?: string, weekendOpen?: string, weekendClose?: string) => {
        const schedule = [];
        if (weekdayOpen && weekdayClose) {
            schedule.push({
                days: 'Thứ 2 - Thứ 6:',
                hours: `${weekdayOpen} - ${weekdayClose}`
            });
        }
        if (weekendOpen && weekendClose) {
            schedule.push({
                days: 'Thứ 7 - CN:',
                hours: `${weekendOpen} - ${weekendClose}`
            });
        }
        return schedule;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin phòng khám...</p>
                </div>
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không tìm thấy thông tin phòng khám</p>
                    <Button onClick={() => navigate('/')}>
                        Quay lại trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    const schedule = formatSchedule(
        clinic.weekdayOpen,
        clinic.weekdayClose,
        clinic.weekendOpen,
        clinic.weekendClose
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <section className="bg-white py-4">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
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
                                            <p className="text-gray-600 text-sm">{clinic.phone}</p>
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
                                                    <span className="font-semibold mr-1">{item.days}</span>{item.hours}
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

            <section className="py-12">
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
                            {doctors.map((doctor) => {
                                const experience = doctor.yearStarted 
                                    ? new Date().getFullYear() - doctor.yearStarted 
                                    : null;
                                
                                return (
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
                                                {""} {doctor.fullName}
                                            </h3>

                                            <div className="space-y-1 text-sm text-gray-600 mb-1">
                                                {doctor.specialty && (
                                                    <p className="text-red-500">{doctor.specialty}</p>
                                                )}
                                            </div>

                                            {clinic && (
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {clinic.name}
                                                </p>
                                            )}

                                            <Button
                                                onClick={() => handleBookAppointment(doctor)}
                                                className="w-full bg-white border border-gray-300 text-black hover:bg-red-500 hover:text-white"
                                            >
                                                Đặt lịch khám
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
