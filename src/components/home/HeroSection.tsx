import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Heart, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import HeroImage from '../../assets/Untitled_design.png';
import { useAuth } from '@/contexts/AuthContext';

export default function HeroSection() {
  const navigate = useNavigate();
  const { currentUser, userType } = useAuth();

  return (
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
  );
}
