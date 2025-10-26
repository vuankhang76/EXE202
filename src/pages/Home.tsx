import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import type { TenantDto, DoctorDto } from '@/types';
import tenantService from '@/services/tenantService';
import { tenantSettingService } from '@/services/tenantSettingService';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Footer from '@/components/Footer';
import HomeHeader from '@/components/home/HomeHeader';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import AboutSection from '@/components/home/AboutSection';
import {
  useAppDispatch,
  useHomeData,
  useHomeClinicLoading,
  useHomeDoctorLoading,
  isCacheValid,
} from '@/stores/hooks';
import {
  setClinicLoading,
  setDoctorLoading,
  setHomeData,
} from '@/stores/homeSlice';

// Skeleton components
const ClinicCardSkeleton = ({ itemsPerView }: { itemsPerView: number }) => (
  <div className="flex gap-4 h-full p-4">
    {Array.from({ length: itemsPerView }).map((_, i) => (
      <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}>
        <div className="bg-gray-200 h-48 rounded-t-lg"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ))}
  </div>
);

const DoctorCardSkeleton = ({ itemsPerView }: { itemsPerView: number }) => (
  <div className="flex gap-4 h-full p-4">
    {Array.from({ length: itemsPerView }).map((_, i) => (
      <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}>
        <div className="p-4 space-y-4 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const {
    clinics,
    doctors,
    weekendBookingSettings,
    lastUpdated,
    cacheExpiration,
  } = useHomeData();
  const clinicsLoading = useHomeClinicLoading();
  const doctorsLoading = useHomeDoctorLoading();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDoctorSlide, setCurrentDoctorSlide] = useState(0);
  const itemsPerView = 4;

  const maxSlide = Math.max(0, clinics.length - itemsPerView);
  const maxDoctorSlide = Math.max(0, doctors.length - itemsPerView);

  const loadClinics = useCallback(async () => {
    dispatch(setClinicLoading(true));
    try {
      const response = await tenantService.getTenants(1, 20);
      if (response.success && response.data) {
        const clinicsList = response.data.data || [];
        
        // Load weekend booking settings for each clinic
        const settingsPromises = clinicsList.map(async (clinic) => {
          try {
            const config = await tenantSettingService.getBookingConfig(clinic.tenantId);
            return {
              tenantId: clinic.tenantId,
              allowWeekendBooking: config.success && config.data ? config.data.allowWeekendBooking : true
            };
          } catch {
            return { tenantId: clinic.tenantId, allowWeekendBooking: true };
          }
        });
        
        const settings = await Promise.all(settingsPromises);
        const settingsMap = settings.reduce((acc, { tenantId, allowWeekendBooking }) => {
          acc[tenantId] = allowWeekendBooking;
          return acc;
        }, {} as Record<number, boolean>);
        
        dispatch(setHomeData({
          clinics: clinicsList,
          doctors,
          weekendBookingSettings: settingsMap,
        }));
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      dispatch(setClinicLoading(false));
    }
  }, [dispatch, doctors]);

  const loadDoctors = useCallback(async () => {
    dispatch(setDoctorLoading(true));
    try {
      const clinicsResponse = await tenantService.getTenants(1, 100);
      if (clinicsResponse.success && clinicsResponse.data) {
        const allClinics = clinicsResponse.data.data || [];
        const allDoctorsPromises = allClinics.map(clinic => 
          tenantService.getTenantDoctors(clinic.tenantId)
        );
        
        const doctorsResponses = await Promise.all(allDoctorsPromises);
        const allDoctors: DoctorDto[] = [];
        
        doctorsResponses.forEach(response => {
          if (response.success && response.data) {
            const doctorsList = response.data.data || [];
            allDoctors.push(...doctorsList);
          }
        });
        
        const verifiedDoctors = allDoctors.filter(doctor => doctor.isVerified === true);
        
        dispatch(setHomeData({
          clinics,
          doctors: verifiedDoctors,
          weekendBookingSettings,
        }));
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      dispatch(setDoctorLoading(false));
    }
  }, [dispatch, clinics, weekendBookingSettings]);

  useEffect(() => {
    // Check if we have valid cached data
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      return;
    }

    // Load fresh data if cache is invalid or expired
    loadClinics();
    loadDoctors();
  }, [lastUpdated, cacheExpiration, loadClinics, loadDoctors]);

  const formatSchedule = (clinic: TenantDto) => {
    const schedule = [];
    const allowWeekend = weekendBookingSettings[clinic.tenantId] ?? true;
    
    if (clinic.weekdayOpen && clinic.weekdayClose) {
      schedule.push({
        days: 'T2-T6',
        hours: `${clinic.weekdayOpen} - ${clinic.weekdayClose}`
      });
    }
    
    if (allowWeekend && clinic.weekendOpen && clinic.weekendClose) {
      schedule.push({
        days: 'T7-CN',
        hours: `${clinic.weekendOpen} - ${clinic.weekendClose}`
      });
    }
    
    return schedule;
  };

  const nextSlide = () => setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
  const prevSlide = () => setCurrentSlide(prev => prev <= 0 ? maxSlide : prev - 1);
  const nextDoctorSlide = () => setCurrentDoctorSlide(prev => prev >= maxDoctorSlide ? 0 : prev + 1);
  const prevDoctorSlide = () => setCurrentDoctorSlide(prev => prev <= 0 ? maxDoctorSlide : prev - 1);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomeHeader />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />

        {/* Clinics Section */}
        <section id="clinics" className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Đặt khám phòng khám
                </h2>
              </div>
              <Button 
                variant="default"
                onClick={() => navigate('/login')}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                Xem thêm
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-red-500 transition-colors group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              )}
              
              {currentSlide < maxSlide && (
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-red-500 transition-colors group"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              )}

              <div className="overflow-hidden h-[420px]">
                {clinicsLoading ? (
                  <ClinicCardSkeleton itemsPerView={itemsPerView} />
                ) : clinics.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-600">Chưa có phòng khám nào</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex transition-transform duration-300 ease-in-out gap-4 h-full p-4"
                    style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}
                  >
                    {clinics.map((clinic) => {
                      const schedule = formatSchedule(clinic);
                      return (
                        <div 
                          key={clinic.tenantId} 
                          className="flex-shrink-0 h-full cursor-pointer" 
                          style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
                          onClick={() => navigate(`/clinics/${clinic.tenantId}`)}
                        >
                          <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden h-full flex flex-col py-0 gap-0">
                            <div className="relative h-48 flex-shrink-0">
                              <img 
                                src={clinic.coverImageUrl || clinic.thumbnailUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80'} 
                                alt={clinic.name}
                                className="w-full h-full object-cover"
                              />
                              {clinic.thumbnailUrl && (
                                <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-md">
                                  <img 
                                    src={clinic.thumbnailUrl} 
                                    alt={`${clinic.name} logo`}
                                    className="w-16 h-16 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4 flex flex-col flex-grow">
                              <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {clinic.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 h-10 line-clamp-2">
                                {clinic.address || 'Địa chỉ đang cập nhật'}
                              </p>
                              <div className="space-y-1 border-t border-gray-100 pt-3 mt-auto">
                                {schedule.length > 0 ? (
                                  schedule.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span className="text-gray-600">{item.days}</span>
                                      <span className="text-gray-900 font-medium">{item.hours}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 text-center">Giờ làm việc đang cập nhật</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section id="doctors" className="bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Đặt khám với bác sĩ
                </h2>
                <p className="text-gray-600">
                  Tìm kiếm và đặt lịch với các bác sĩ chuyên khoa hàng đầu
                </p>
              </div>
              <Button 
                variant="default"
                onClick={() => navigate('/login')}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                Xem thêm
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              {currentDoctorSlide > 0 && (
                <button
                  onClick={prevDoctorSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-red-500 transition-colors group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              )}
              
              {currentDoctorSlide < maxDoctorSlide && (
                <button
                  onClick={nextDoctorSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-red-500 transition-colors group"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              )}

              <div className="overflow-hidden">
                {doctorsLoading ? (
                  <DoctorCardSkeleton itemsPerView={itemsPerView} />
                ) : doctors.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa có bác sĩ nào</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex transition-transform duration-300 ease-in-out gap-4 h-full p-4"
                    style={{ transform: `translateX(-${currentDoctorSlide * (100 / itemsPerView)}%)` }}
                  >
                    {doctors.map((doctor) => (
                      <div 
                        key={doctor.doctorId} 
                        className="flex-shrink-0 h-full cursor-pointer"
                        style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
                        onClick={() => navigate(`/clinics/${doctor.tenantId}`)}
                      >
                        <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden  flex flex-col py-0">
                          <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-4">
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
                                  {doctor.title}{' '}
                                </span>
                              )}
                              {doctor.fullName}
                            </h3>

                            <div className="space-y-1 text-sm text-gray-600 mb-1">
                              {doctor.specialty && (
                                <p className="text-red-500">{doctor.specialty}</p>
                              )}
                              {doctor.yearStarted && (
                                <p className="text-gray-500">
                                  {new Date().getFullYear() - doctor.yearStarted} năm kinh nghiệm
                                </p>
                              )}
                            </div>

                            {doctor.tenantName && (
                              <p className="text-sm text-gray-500 mb-4">
                                {doctor.tenantName}
                              </p>
                            )}

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/clinics/${doctor.tenantId}`);
                              }}
                              className="w-full bg-white border border-gray-300 text-black hover:bg-red-500 hover:text-white"
                            >
                              Đặt lịch khám
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
