import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import PatientLoginForm from '@/components/patient/PatientLoginForm';
import PatientRegisterForm from '@/components/patient/PatientRegisterForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 p-4 py-16">
        <div className="w-full max-w-lg">
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
      
      <Footer />
    </main>
  );
}
