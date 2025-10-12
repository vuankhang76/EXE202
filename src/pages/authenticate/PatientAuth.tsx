import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PatientLoginForm from '@/components/patient/PatientLoginForm';
import PatientRegisterForm from '@/components/patient/PatientRegisterForm';
import Logo from '@/assets/Logo_RemoveBg1.png';

export default function PatientAuth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleLoginSuccess = (token: string, user: any) => {
    console.log('Login successful:', { token, user });
    navigate('/');
  };

  const handleRegisterSuccess = () => {
    setMode('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Button>
          <div className="flex items-center gap-2">
            <img src={Logo} alt="SavePlus" className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-900">SavePlus</span>
          </div>
        </div>

        <Card className="w-full shadow-xl border-gray-200">
          <CardContent className="pt-6">
            {mode === 'login' ? (
              <PatientLoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setMode('register')}
                onForgotPassword={() => {
                  console.log('Forgot password clicked');
                }}
              />
            ) : (
              <PatientRegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <a href="#" className="text-red-500 hover:underline">Điều khoản dịch vụ</a>
          {' '}và{' '}
          <a href="#" className="text-red-500 hover:underline">Chính sách bảo mật</a>
          {' '}của SavePlus
        </p>
      </div>
    </div>
  );
}
