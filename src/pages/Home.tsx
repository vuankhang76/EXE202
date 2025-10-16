import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Shield, Stethoscope, Activity, Heart, ArrowRight, CheckCircle2, Users, Award, ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/Dropdown-menu';
import Logo from '../assets/Logo_RemoveBg1.png';
import HeroImage from '../assets/Untitled_design.png';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import tenantService from '@/services/tenantService';
import type { TenantDto, DoctorDto } from '@/types';
import Footer from '@/components/Footer';
import ClinicCardSkeleton from '@/components/clinic/ClinicCardSkeleton';
import DoctorCardSkeleton from '@/components/doctor/DoctorCardSkeleton';
export default function Home() {
  const navigate = useNavigate();
  const { currentUser, userType, logout } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Đặt lịch dễ dàng',
      description: 'Đặt lịch hẹn nhanh chóng với bác sĩ và phòng khám chỉ trong vài bước đơn giản'
    },
    {
      icon: Clock,
      title: 'Tiết kiệm thời gian',
      description: 'Không cần chờ đợi, xem lịch trống và chọn khung giờ phù hợp với bạn'
    },
    {
      icon: Stethoscope,
      title: 'Bác sĩ chuyên nghiệp',
      description: 'Đội ngũ bác sĩ giàu kinh nghiệm, được chứng nhận và tận tâm'
    },
    {
      icon: Shield,
      title: 'Bảo mật thông tin',
      description: 'Thông tin sức khỏe của bạn được bảo vệ an toàn tuyệt đối'
    },
    {
      icon: Activity,
      title: 'Theo dõi sức khỏe',
      description: 'Quản lý hồ sơ sức khỏe, đơn thuốc và kết quả xét nghiệm tập trung'
    },
    {
      icon: Heart,
      title: 'Chăm sóc tận tình',
      description: 'Nhận lời khuyên và hỗ trợ sức khỏe từ đội ngũ chuyên gia y tế'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Đăng ký tài khoản',
      description: 'Tạo tài khoản miễn phí chỉ trong vài giây với thông tin cơ bản'
    },
    {
      number: '02',
      title: 'Chọn bác sĩ',
      description: 'Tìm kiếm và chọn bác sĩ phù hợp với chuyên khoa bạn cần'
    },
    {
      number: '03',
      title: 'Đặt lịch hẹn',
      description: 'Chọn ngày giờ thuận tiện và xác nhận cuộc hẹn của bạn'
    },
    {
      number: '04',
      title: 'Nhận chăm sóc',
      description: 'Đến khám đúng giờ và nhận dịch vụ chăm sóc sức khỏe tốt nhất'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [clinics, setClinics] = useState<TenantDto[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  
  const [currentDoctorSlide, setCurrentDoctorSlide] = useState(0);
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    loadClinics();
    loadDoctors();
  }, []);

  const loadClinics = async () => {
    setClinicsLoading(true);
    try {
      const response = await tenantService.getTenants(1, 20);
      if (response.success && response.data) {
        setClinics(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setClinicsLoading(false);
    }
  };

  const loadDoctors = async () => {
    setDoctorsLoading(true);
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
        setDoctors(verifiedDoctors);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const formatSchedule = (clinic: TenantDto) => {
    const schedule = [];
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

  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 4;
    }
    return 4;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  const maxSlide = Math.max(0, clinics.length - itemsPerView);
  const maxDoctorSlide = Math.max(0, doctors.length - itemsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const nextDoctorSlide = () => {
    setCurrentDoctorSlide((prev) => (prev >= maxDoctorSlide ? 0 : prev + 1));
  };

  const prevDoctorSlide = () => {
    setCurrentDoctorSlide((prev) => (prev <= 0 ? maxDoctorSlide : prev - 1));
  };

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      setItemsPerView(newItemsPerView);
      setCurrentSlide(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="SavePlus" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">
                SavePlus
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
                Tính năng
              </a>
              <a href="#clinics" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
                Phòng khám
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
                Cách thức
              </a>
              <a href="#about" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
                Về chúng tôi
              </a>
              {userType !== 'patient' && (
              <Link to={'/tenant/auth'} className="text-gray-600 hover:text-red-500 transition-colors font-medium">
                  Dành cho đối tác
                </Link>
              )}
              
              {currentUser && userType === 'patient' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {currentUser.fullName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/patient/dashboard')}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Bảng điều khiển</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/patient/appointments')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Lịch hẹn</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => navigate('/patient/auth')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Đăng nhập
                </Button>
              )}
            </nav>
            <div className="md:hidden flex gap-2">
              {currentUser && userType === 'patient' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/patient/dashboard')}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Bảng điều khiển</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/patient/appointments')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Lịch hẹn</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/patient/auth')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    Bệnh nhân
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {currentUser && userType === 'patient' ? (
                <>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã đăng nhập
                  </div>
                  <h1 className="text-4xl md:text-4xl font-bold text-gray-900 leading-tight">
                    Chào mừng,{' '}
                    <span className="text-red-500">
                      {currentUser.fullName}
                    </span>!
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Sẵn sàng chăm sóc sức khỏe của bạn hôm nay? Đặt lịch khám với bác sĩ hoặc xem lại các cuộc hẹn sắp tới.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg"
                      onClick={() => navigate('/patient/dashboard')}
                      className="bg-red-500 hover:bg-red-600 text-white text-base px-8"
                    >
                      Vào bảng điều khiển
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="text-base px-8"
                      onClick={() => navigate('/patient/dashboard')}
                    >
                      Xem lịch hẹn
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    Nền tảng đặt lịch khám y tế hàng đầu
                  </div>
                  <h1 className="text-4xl md:text-4xl font-bold text-gray-900 leading-tight">
                    Chăm sóc sức khỏe{' '}
                    <span className="text-gray-900">
                      dễ dàng hơn
                    </span>{' '}
                    bao giờ hết
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Đặt lịch hẹn với bác sĩ, phòng khám và bệnh viện uy tín chỉ trong vài phút. 
                    Quản lý sức khỏe thông minh, tiện lợi và an toàn.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg"
                      onClick={() => navigate('/patient/auth')}
                      className="bg-red-500 hover:bg-red-600 text-white text-base px-8"
                    >
                      Đăng ký ngay
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/patient/auth')}
                      className="text-base px-8"
                    >
                      Đăng nhập
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <img 
                src={HeroImage} 
                alt="Healthcare" 
                className="relative rounded-2xl h-130 w-130 ml-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
              <Award className="w-4 h-4" />
              Tính năng nổi bật
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Tại sao chọn SavePlus?
            </h2>
            <p className="text-lg text-gray-600">
              Chúng tôi mang đến giải pháp toàn diện cho việc quản lý và chăm sóc sức khỏe của bạn
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 group bg-white">
                <CardContent className="">
                  <div className="w-14 h-14 bg-gray-100 group-hover:bg-red-50 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                    <feature.icon className="w-7 h-7 text-gray-700 group-hover:text-red-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
              onClick={() => navigate('/patient/auth')}
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
              onClick={() => navigate('/patient/auth')}
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

      <section id="how-it-works" className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
              <CheckCircle2 className="w-4 h-4" />
              Quy trình đơn giản
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Cách thức hoạt động
            </h2>
            <p className="text-lg text-gray-600">
              Chỉ với 4 bước đơn giản, bạn đã có thể bắt đầu hành trình chăm sóc sức khỏe
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative h-full">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gray-200"></div>
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900 text-2xl font-bold mb-6 flex-shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                Về SavePlus
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Đối tác tin cậy cho sức khỏe của bạn
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                SavePlus là nền tảng công nghệ y tế hàng đầu, kết nối bệnh nhân với các bác sĩ, 
                phòng khám và bệnh viện uy tín trên toàn quốc.
              </p>
              <div className="space-y-4">
                {[
                  'Đội ngũ bác sĩ được kiểm chứng và chứng nhận',
                  'Hệ thống đặt lịch thông minh, tối ưu thời gian',
                  'Bảo mật thông tin theo tiêu chuẩn quốc tế',
                  'Hỗ trợ khách hàng 24/7 tận tình'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col">
                <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
                <div className="text-gray-500 font-medium">Năm kinh nghiệm</div>
              </Card>
              <Card className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col">
                <div className="text-3xl font-bold text-gray-900 mb-2">30+</div>
                <div className="text-gray-500 font-medium">Chuyên khoa</div>
              </Card>
              <Card className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col">
                <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-gray-500 font-medium">Hỗ trợ</div>
              </Card>
              <Card className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col">
                <div className="text-3xl font-bold text-gray-900 mb-2">ISO</div>
                <div className="text-gray-500 font-medium">Chứng nhận</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}




