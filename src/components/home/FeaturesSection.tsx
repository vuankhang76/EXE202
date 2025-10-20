import { Calendar, Clock, Shield, Stethoscope, Activity, Heart, Award } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

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

export default function FeaturesSection() {
  return (
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
  );
}
