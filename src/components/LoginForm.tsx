import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading, LOADING_KEYS } from '@/contexts/LoadingContext';
import { useNavigate } from 'react-router-dom';
import OtpForm from './OtpForm';

type LoginMode = 'staff-email' | 'staff-otp';
type LoginStep = 'login' | 'otp';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('staff-email');
  const [loginStep, setLoginStep] = useState<LoginStep>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    rememberMe: false
  });
  
  const { login, requestOtp } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect (() => {
    if (errors) {
      const timer = setTimeout(() => setErrors({}), 10000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect (() => {
    setErrors({});
  }, [loginMode]);

  useEffect (() => {
    setErrors({});
  }, [loginStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (loginMode === 'staff-email') {
      if (!formData.email) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      
      if (!formData.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    } else if (loginMode === 'staff-otp') {
      if (!formData.phone) {
        newErrors.phone = 'Số điện thoại là bắt buộc';
      } else if (!/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(formData.phone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const loadingKey = loginMode === 'staff-email' ? LOADING_KEYS.LOGIN : LOADING_KEYS.REQUEST_OTP;
    startLoading(loadingKey);
    setErrors({});

    try {
      if (loginMode === 'staff-email') {
        await login({ email: formData.email, password: formData.password, userType: 'tenant' });
        navigate('/dashboard');
      } else if (loginMode === 'staff-otp') {
        const phone = normalizePhoneNumber(formData.phone);
        await requestOtp(phone);
        setPhoneNumber(phone);
        setLoginStep('otp');
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'Có lỗi xảy ra khi đăng nhập'
      });
    } finally {
      stopLoading(loadingKey);
    }
  };

  const normalizePhoneNumber = (phone: string): string => {
    if (phone.startsWith('0')) {
      return '+84' + phone.substring(1);
    }
    if (phone.startsWith('84')) {
      return '+' + phone;
    }
    if (phone.startsWith('+84')) {
      return phone;
    }
    return '+84' + phone;
  };

  const handleBackToLogin = () => {
    setLoginStep('login');
    setPhoneNumber('');
    setErrors({});
  };

  if (loginStep === 'otp') {
    return (
      <OtpForm
        phoneNumber={phoneNumber}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setLoginMode('staff-email')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            loginMode === 'staff-email'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Email & Mật khẩu
        </button>
        <button
          type="button"
          onClick={() => setLoginMode('staff-otp')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            loginMode === 'staff-otp'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          OTP (Số điện thoại)
        </button>
      </div>

      {loginMode === 'staff-email' && (
        <>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 ${errors.email ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
        </>
      )}

      {loginMode === 'staff-otp' && (
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              className={`pl-10 ${errors.phone ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''}`}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      )}

      {loginMode === 'staff-email' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked: boolean) => 
                setFormData(prev => ({ ...prev, rememberMe: !!checked }))
              }
            />
            <label htmlFor="rememberMe" className="text-sm text-foreground cursor-pointer">
              Ghi nhớ đăng nhập
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Quên mật khẩu?
          </button>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading(loginMode === 'staff-email' ? LOADING_KEYS.LOGIN : LOADING_KEYS.REQUEST_OTP)}
      >
        {isLoading(loginMode === 'staff-email' ? LOADING_KEYS.LOGIN : LOADING_KEYS.REQUEST_OTP) ? (
          <>
            <ButtonLoadingSpinner />
            {loginMode === 'staff-email' ? 'Đang đăng nhập...' : 'Đang gửi OTP...'}
          </>
        ) : (
          loginMode === 'staff-email' ? 'Đăng nhập' : 'Gửi mã OTP'
        )}
      </Button>
    </form>
  );
}
