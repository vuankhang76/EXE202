import { useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/Dropdown-menu';
import Logo from '../assets/Logo_RemoveBg1.png';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, userType, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="SavePlus" className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-900">
              SavePlus
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
              Tính năng
            </Link>
            <Link to="/#clinics" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
              Phòng khám
            </Link>
            <Link to="/#how-it-works" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
              Cách thức
            </Link>
            <Link to="/#about" className="text-gray-600 hover:text-red-500 transition-colors font-medium">
              Về chúng tôi
            </Link>
            {userType !== 'patient' && (
              <Link to={'/tenant/auth'} className="text-gray-600 hover:text-red-500 transition-colors font-medium">
                Dành cho đối tác
              </Link>
            )}
            
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
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Lịch hẹn</span>
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
                onClick={() => navigate('/patient/auth')}
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
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Lịch hẹn</span>
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
              <>
                <Button 
                  onClick={() => navigate('/patient/auth')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  size="sm"
                >
                  Bệnh nhân
                </Button>
                <Button 
                  onClick={() => navigate('/tenant/auth')}
                  variant="outline"
                  size="sm"
                >
                  Nhân viên
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
