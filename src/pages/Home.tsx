import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Shield, Stethoscope, Activity, Heart, ArrowRight, CheckCircle2, Users, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Logo from '../assets/Logo_RemoveBg1.png';
import HeroImage from '../assets/Untitled_design.png';
import { useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();

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

  const clinics = [
    {
      name: 'Bệnh viện Ung Bướu TPHCM',
      address: '47 Nguyễn Huy Lượng, Phường Bình Thạnh, TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      logo: 'https://via.placeholder.com/100x100?text=UB',
      schedule: [
        { days: 'Thứ 2 - Thứ 6:', hours: '7h30 - 16h30' },
        { days: 'Thứ 7 - CN:', hours: '7h30 - 11h30' }
      ]
    },
    {
      name: 'Bệnh viện Quân Y 175',
      address: 'Số 786 Nguyễn Kiệm, Phường Hạnh Thông, TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80',
      logo: 'https://via.placeholder.com/100x100?text=QY175',
      schedule: [
        { days: 'Thứ 2 - Thứ 6:', hours: '7h - 16h30' },
        { days: 'Thứ 7:', hours: '7h - 16h' }
      ]
    },
    {
      name: 'Bệnh viện Y Học Cổ Truyền TP.HCM',
      address: '179 -187 Nam Kỳ Khởi Nghĩa, Phường Xuân Hoà, TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
      logo: 'https://via.placeholder.com/100x100?text=YHCT',
      schedule: [
        { days: 'Thứ 2 - Thứ 7:', hours: '7h - 19h' },
        { days: 'Chủ nhật:', hours: '7h - 11h30' }
      ]
    },
    {
      name: 'Bệnh Viện Đa Khoa Thủ Đức',
      address: '29 Phú Châu, Phường Tam Bình, TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=800&q=80',
      logo: 'https://via.placeholder.com/100x100?text=BVTD',
      schedule: [
        { days: 'Thứ 2 - Thứ 6:', hours: '7h - 16h30' }
      ]
    },
    {
      name: 'Bệnh viện Nhân Dân Gia Định',
      address: '1 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. HCM',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80',
      logo: 'https://via.placeholder.com/100x100?text=GD',
      schedule: [
        { days: 'Thứ 2 - Thứ 7:', hours: '7h - 17h' },
        { days: 'Chủ nhật:', hours: '7h - 12h' }
      ]
    }
  ];

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      setItemsPerView(newItemsPerView);
      setCurrentSlide(0); // Reset slide when screen size changes
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
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
              <Button 
                onClick={() => navigate('/login')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Đăng nhập
              </Button>
            </nav>
            <Button 
              onClick={() => navigate('/login')}
              className="md:hidden bg-red-500 hover:bg-red-600 text-white"
              size="sm"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
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
                  onClick={() => navigate('/login')}
                  className="bg-red-500 hover:bg-red-600 text-white text-base px-8"
                >
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
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

      {/* Clinics Section */}
      <section id="clinics" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Đặt khám bệnh viện
              </h2>
              <p className="text-gray-600">
                Đặt khám và thanh toán dễ có phiếu khám (thời gian, số thứ tự) trước khi đi khám các bệnh viện kết nối chính thức với SavePlus.
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
            {/* Navigation Buttons */}
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
              <div 
                className="flex transition-transform duration-300 ease-in-out gap-4 h-full p-4"
                style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}
              >
                {clinics.map((clinic, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 h-full" 
                    style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
                  >
                    <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden h-full flex flex-col py-0">
                      <div className="relative h-48 flex-shrink-0">
                        <img 
                          src={clinic.image} 
                          alt={clinic.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-md">
                          <img 
                            src={clinic.logo} 
                            alt={`${clinic.name} logo`}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                          {clinic.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 h-10 line-clamp-2">
                          {clinic.address}
                        </p>
                        <div className="space-y-1 border-t border-gray-100 pt-3 mt-auto">
                          {clinic.schedule.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.days}</span>
                              <span className="text-gray-900 font-medium">{item.hours}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
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
      <section id="about" className="py-20 bg-white">
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

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="SavePlus" className="h-8 w-auto" />
                <span className="text-xl font-bold text-black">SavePlus</span>
              </div>
              <p className="text-sm text-gray-600">
                Nền tảng đặt lịch khám y tế tin cậy, kết nối bạn với các chuyên gia sức khỏe hàng đầu.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Đặt lịch khám</a></li>
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Tư vấn trực tuyến</a></li>
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Xét nghiệm</a></li>
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Quản lý hồ sơ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Trung tâm hỗ trợ</a></li>
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-red-500 text-gray-600 transition-colors">Chính sách bảo mật</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-600">Email: contact@saveplus.vn</li>
                <li className="text-gray-600">Hotline: 1900-xxxx</li>
                <li className="text-gray-600">Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p className="font-semibold">&copy; 2024 SavePlus. Công Ty TNHH SavePlus.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


