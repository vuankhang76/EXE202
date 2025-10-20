import { Calendar, Clock, Shield, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import UnifiedLoginForm from '@/components/UnifiedLoginForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Login() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-start h-full">
              <div className="mx-auto w-full max-w-md">
                <Card className="border-gray-200 bg-white shadow-xl">
                  <CardContent className="pt-6">
                    <UnifiedLoginForm />
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
      <Footer />
    </main>
  );
}
