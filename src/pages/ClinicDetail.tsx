import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClinicHeader from '@/components/clinic/ClinicHeader';
import ClinicIntroBooking from '@/components/clinic/ClinicIntroBooking';
import DoctorList from '@/components/clinic/DoctorList';
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
            navigate('/patient/auth', {
                state: {
                    from: `/clinics/`,
                    message: 'Vui l�ng dang nh?p d? d?t l?ch kh�m'
                }
            });
            return;
        }

        const selectedDoctor = doctors[0];
        if (!selectedDoctor) return;

        navigate('/patient/appointments/create', {
            state: {
                clinicId: parseInt(id!),
                clinicName: clinic?.name,
                doctorId: selectedDoctor.doctorId,
                doctorName: selectedDoctor.fullName,
                specialty: selectedDoctor.specialty
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">�ang t?i th�ng tin ph�ng kh�m...</p>
                </div>
            </div>
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
            <ClinicIntroBooking clinic={clinic} onBookAppointment={handleBookAppointment} />
            <DoctorList doctors={doctors} />
            <Footer />
        </div>
    );
}
