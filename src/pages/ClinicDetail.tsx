import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClinicHeader from '@/components/clinic/ClinicHeader';
import ClinicIntroBooking from '@/components/clinic/ClinicIntroBooking';
import DoctorList from '@/components/clinic/DoctorList';
import ClinicDetailSkeleton from '@/components/clinic/ClinicDetailSkeleton';
import tenantService from '@/services/tenantService';
import conversationService from '@/services/conversationService';
import type { TenantDto, DoctorDto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClinicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, userType } = useAuth();

    const [clinic, setClinic] = useState<TenantDto | null>(null);
    const [doctors, setDoctors] = useState<DoctorDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingChat, setCreatingChat] = useState(false);

    useEffect(() => {
        if (id) {
            loadClinicData();
        }
    }, [id]);

    const loadClinicData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const clinicResponse = await tenantService.getTenantById(parseInt(id));
            if (clinicResponse.success && clinicResponse.data) {
                setClinic(clinicResponse.data);

                const doctorsResponse = await tenantService.getTenantDoctors(parseInt(id), 1, 50);
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

    const handleBookAppointment = () => {
        if (!currentUser || userType !== 'patient') {
            navigate('/login', {
                state: {
                    from: `/clinics/${id}`,
                    message: 'Vui lòng đăng nhập để đặt lịch hẹn'
                }
            });
            return;
        }

        const selectedDoctor = doctors[0];
        if (!selectedDoctor) {
            alert('Phòng khám chưa có bác sĩ nào');
            return;
        }

        const patientIdNum = currentUser.userId ? parseInt(currentUser.userId) : null;
        
        if (!patientIdNum) {
            alert('Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.');
            return;
        }

        navigate('/patient/appointments/create', {
            state: {
                clinicId: parseInt(id!),
                clinicName: clinic?.name,
                doctorId: selectedDoctor.doctorId,
                doctorName: selectedDoctor.fullName,
                specialty: selectedDoctor.specialty,
                patientId: patientIdNum
            }
        });
    };

    const handleStartChat = async () => {
        if (!currentUser || userType !== 'patient') {
            navigate('/login', {
                state: {
                    from: `/clinics/${id}`,
                    message: 'Vui lòng đăng nhập để chat với phòng khám'
                }
            });
            return;
        }

        if (!id) return;

        const patientIdNum = currentUser.userId ? parseInt(currentUser.userId) : null;
        
        if (!patientIdNum) {
            toast.error('Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.');
            return;
        }

        setCreatingChat(true);
        try {
            const response = await conversationService.createPatientConversationWithClinic(
                patientIdNum,
                parseInt(id)
            );

            if (response.success && response.data) {
                toast.success('Đã tạo cuộc trò chuyện');
                navigate(`/patient/chat/${response.data.conversationId}`);
            } else {
                toast.error(response.message || 'Không thể tạo cuộc trò chuyện');
            }
        } catch (error: any) {
            console.error('Error creating chat:', error);
            toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
        } finally {
            setCreatingChat(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <ClinicDetailSkeleton />
                <Footer />
            </>
        );
    }

    if (!clinic) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Kh�ng t�m th?y th�ng tin ph�ng kh�m</p>
                    <Button onClick={() => navigate('/')}>Quay l?i trang ch?</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <ClinicHeader clinic={clinic} />
            <ClinicIntroBooking 
                clinic={clinic} 
                onBookAppointment={handleBookAppointment}
                onStartChat={handleStartChat}
                creatingChat={creatingChat}
            />
            <DoctorList doctors={doctors} />
            <Footer />
        </div>
    );
}
