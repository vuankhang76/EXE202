import { Search, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const steps = [
  {
    icon: Search,
    title: 'Tìm kiếm bác sĩ',
    description: 'Tìm bác sĩ phù hợp theo chuyên khoa, địa điểm và đánh giá',
    step: '01'
  },
  {
    icon: Calendar,
    title: 'Đặt lịch hẹn',
    description: 'Chọn thời gian phù hợp và đặt lịch hẹn ngay lập tức',
    step: '02'
  },
  {
    icon: FileText,
    title: 'Xác nhận thông tin',
    description: 'Kiểm tra và xác nhận thông tin cuộc hẹn của bạn',
    step: '03'
  },
  {
    icon: CheckCircle,
    title: 'Hoàn thành',
    description: 'Nhận xác nhận và đến khám đúng giờ đã hẹn',
    step: '04'
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <CheckCircle className="w-4 h-4" />
            Quy trình
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Cách thức hoạt động
          </h2>
          <p className="text-lg text-gray-600">
            Chỉ với 4 bước đơn giản, bạn đã có thể đặt lịch khám với bác sĩ
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 group bg-white relative">
              <CardContent className="">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500 group-hover:bg-red-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg transition-colors">
                  {step.step}
                </div>
                <div className="w-14 h-14 bg-gray-100 group-hover:bg-red-50 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                  <step.icon className="w-7 h-7 text-gray-700 group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
