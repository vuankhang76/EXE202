import { Calendar, Clock, Shield, ArrowLeft, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import LoginForm from '@/components/LoginForm';
import logo from '@/assets/Logo_RemoveBg1.png';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="SavePlus" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">
                SavePlus
              </span>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Trang chủ
            </Button>
          </div>
        </div>
      </header>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-start h-full">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">Đăng nhập SavePlus</h2>
                  <p className="mt-2 text-gray-600">Quản lý sức khỏe dễ dàng hơn</p>
                </div>
                <Card className="border-gray-200 bg-white shadow-xl">
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-col justify-center min-h-[470px]">
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng bạn đến với SavePlus</h3>
                  <p className="text-gray-600">Nền tảng đặt lịch khám y tế hàng đầu Việt Nam</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-6 border border-gray-200 hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Đặt lịch nhanh</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Đặt lịch khám với bác sĩ và phòng khám uy tín chỉ trong vài phút.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-6 border border-gray-200 hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Tiết kiệm thời gian</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Không cần chờ đợi, xem lịch trống và chọn khung giờ phù hợp.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-6 border border-gray-200 hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Bác sĩ chuyên nghiệp</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Đội ngũ bác sĩ giàu kinh nghiệm, được chứng nhận và tận tâm.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-6 border border-gray-200 hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <Shield className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Bảo mật thông tin</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Thông tin sức khỏe của bạn được bảo vệ an toàn tuyệt đối.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
