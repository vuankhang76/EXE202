import { Users, Building2, Calendar, Heart } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Bệnh nhân tin dùng' },
  { value: '100+', label: 'Phòng khám' },
  { value: '500+', label: 'Bác sĩ chuyên môn' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' }
];

const benefits = [
  'Đặt lịch nhanh chóng và tiện lợi',
  'Hệ thống đánh giá minh bạch',
  'Nhắc nhở lịch hẹn tự động',
  'Quản lý hồ sơ sức khỏe điện tử'
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
                <Heart className="w-4 h-4" />
                Về chúng tôi
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Đồng hành cùng sức khỏe của bạn
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                SavePlus là nền tảng đặt lịch khám bệnh trực tuyến hàng đầu, kết nối bệnh nhân 
                với các bác sĩ và phòng khám uy tín trên toàn quốc. Chúng tôi cam kết mang đến 
                trải nghiệm chăm sóc sức khỏe tiện lợi, an toàn và hiệu quả.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-red-300 hover:shadow-lg transition-all duration-300">
                <div className="mb-3">
                  {index === 0 && <Users className="w-10 h-10 text-red-500 mx-auto" />}
                  {index === 1 && <Building2 className="w-10 h-10 text-red-500 mx-auto" />}
                  {index === 2 && <Calendar className="w-10 h-10 text-red-500 mx-auto" />}
                  {index === 3 && <Heart className="w-10 h-10 text-red-500 mx-auto" />}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
