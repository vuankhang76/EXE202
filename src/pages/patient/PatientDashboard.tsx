import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, User, LogOut, Home, Stethoscope, Heart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/assets/Logo_RemoveBg1.png';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const quickActions = [
    {
      icon: Calendar,
      title: 'Đặt lịch khám',
      description: 'Tìm bác sĩ và đặt lịch hẹn',
      color: 'bg-blue-50 text-blue-600',
      action: () => navigate('/')
    },
    {
      icon: FileText,
      title: 'Hồ sơ sức khỏe',
      description: 'Xem lịch sử khám bệnh',
      color: 'bg-green-50 text-green-600',
      action: () => {}
    },
    {
      icon: Activity,
      title: 'Theo dõi sức khỏe',
      description: 'Chỉ số sức khỏe của bạn',
      color: 'bg-purple-50 text-purple-600',
      action: () => {}
    },
    {
      icon: Stethoscope,
      title: 'Tư vấn trực tuyến',
      description: 'Chat với bác sĩ',
      color: 'bg-orange-50 text-orange-600',
      action: () => {}
    }
  ];

  const upcomingAppointments = [
    // Mock data - sẽ thay bằng API call
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="SavePlus" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">SavePlus</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Trang chủ</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xin chào, {currentUser?.fullName}! 👋
          </h1>
          <p className="text-gray-600">
            Chào mừng bạn đến với bảng điều khiển cá nhân
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all border-gray-200 hover:border-red-300"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Lịch hẹn sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Bạn chưa có lịch hẹn nào</p>
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Đặt lịch ngay
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Appointment items will be rendered here */}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-medium text-gray-900">{currentUser?.fullName}</p>
                  </div>
                </div>
                {currentUser?.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{currentUser.email}</p>
                    </div>
                  </div>
                )}
                {currentUser?.phoneE164 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium text-gray-900">{currentUser.phoneE164}</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {}}
                >
                  Chỉnh sửa thông tin
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

