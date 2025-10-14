import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Logo from '@/assets/Logo_RemoveBg1.png';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="SavePlus" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">SavePlus</span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-[150px] md:text-[200px] font-bold text-gray-200 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-16 h-16 md:w-24 md:h-24 text-red-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Không tìm thấy trang
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2 min-w-[200px]"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 min-w-[200px]"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Có thể bạn đang tìm kiếm:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/patient/auth')}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Đăng nhập bệnh nhân
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/tenant/auth')}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Đăng nhập đối tác
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/#clinics')}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Danh sách phòng khám
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/#about')}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Về chúng tôi
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2024 SavePlus. Công Ty TNHH SavePlus.</p>
        </div>
      </footer>
    </div>
  );
}

