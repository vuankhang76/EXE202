import { useState, useEffect } from 'react';
import type { TenantDto, DoctorDto } from '@/types';
import tenantService from '@/services/tenantService';
import doctorService from '@/services/doctorService';
import Footer from '@/components/Footer';
import HomeHeader from '@/components/home/HomeHeader';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ClinicsSection from '@/components/home/ClinicsSection';
import DoctorsSection from '@/components/home/DoctorsSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import AboutSection from '@/components/home/AboutSection';

export default function Home() {
  const [clinics, setClinics] = useState<TenantDto[]>([]);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    loadClinics();
    loadDoctors();
  }, []);

  const loadClinics = async () => {
      try {
        const response = await tenantService.getTenants(1, 100);
        if (response.success && response.data) {
          const verifiedClinics = response.data.data.filter((tenant: TenantDto) => tenant.isActive === true);
          setClinics(verifiedClinics);
        }
      } catch (error) {
        console.error('Error loading clinics:', error);
      } finally {
        setClinicsLoading(false);
      }
    };

  const loadDoctors = async () => {
      try {
        const response = await doctorService.getAllDoctors(1, 100);
        if (response.success && response.data) {
          const allDoctors = response.data.data;
          const verifiedDoctors = allDoctors.filter((doctor: DoctorDto) => doctor.isVerified === true);
          setDoctors(verifiedDoctors);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
      } finally {
        setDoctorsLoading(false);
      }
    };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomeHeader />
      
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <ClinicsSection clinics={clinics} loading={clinicsLoading} />
        <DoctorsSection doctors={doctors} loading={doctorsLoading} />
        <HowItWorksSection />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}
