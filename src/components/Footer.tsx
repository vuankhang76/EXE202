import Logo from '../assets/Logo_RemoveBg1.png';

export default function Footer() {
  return (
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
  );
}
