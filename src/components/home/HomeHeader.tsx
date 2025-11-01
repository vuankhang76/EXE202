import { useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/Dropdown-menu';
import Logo_RemoveBg1 from '../../assets/Logo_RemoveBg1.png';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeHeader() {
  const navigate = useNavigate();
  const { currentUser, userType, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Logo = Logo_RemoveBg1;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={Logo} alt="SavePlus" className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-900">SavePlus</span>
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
                  <DropdownMenuItem 
                    onClick={() => navigate('/patient/conversations')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Hội thoại</span>
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
                onClick={() => navigate('/login')}
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
                  <DropdownMenuItem 
                    onClick={() => navigate('/patient/conversations')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Hội thoại</span>
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
                onClick={() => navigate('/login')}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
