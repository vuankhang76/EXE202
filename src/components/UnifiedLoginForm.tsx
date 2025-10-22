import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import patientAccountService from '@/services/patientAccountService';
import authService from '@/services/authService';

type LoginMethod = 'email' | 'phone';

interface UnifiedLoginFormProps {
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export default function UnifiedLoginForm({ onSwitchToRegister, onForgotPassword }: UnifiedLoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => setErrors({}), 10000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    setErrors({});
  }, [loginMethod]);

  const normalizePhoneNumber = (phone: string): string => {
    phone = phone.trim().replace(/\s/g, '');
    
    if (phone.startsWith('0')) {
      return '+84' + phone.substring(1);
    }
    if (phone.startsWith('84') && !phone.startsWith('+84')) {
      return '+' + phone;
    }
    if (phone.startsWith('+84')) {
      return phone;
    }
    if (/^\d+$/.test(phone)) {
      return '+84' + phone;
    }
    return phone;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (loginMethod === 'email') {
      if (!email) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    } else if (loginMethod === 'phone') {
      if (!phone) {
        newErrors.phone = 'Số điện thoại là bắt buộc';
      } else if (!/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(phone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }
    
    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const tryPatientLogin = async (identifier: string, pass: string, isEmail: boolean): Promise<boolean> => {
    try {
      const response = isEmail 
        ? await patientAccountService.login({ email: identifier, password: pass })
        : await patientAccountService.loginByPhone({ phoneE164: identifier, password: pass });
      
      if (response.success && response.data) {
        await login({ 
          ...(isEmail ? { email: identifier } : { phone: identifier }), 
          password: pass, 
          userType: 'patient' 
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const tryTenantLogin = async (identifier: string, pass: string, isEmail: boolean): Promise<boolean> => {
    try {
      if (!isEmail) return false;
      
      const response = await authService.staffLogin(identifier, pass);
      
      if (response.success && response.data) {
        await login({ 
          email: identifier, 
          password: pass, 
          userType: 'tenant' 
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const identifier = loginMethod === 'email' ? email : normalizePhoneNumber(phone);
      const isEmail = loginMethod === 'email';

      const patientSuccess = await tryPatientLogin(identifier, password, isEmail);
      if (patientSuccess) {
        navigate('/');
        return;
      }

      if (isEmail) {
        const tenantSuccess = await tryTenantLogin(identifier, password, isEmail);
        if (tenantSuccess) {
          navigate('/clinic/dashboard');
          return;
        }
      }

      setErrors({
        general: loginMethod === 'email' 
          ? 'Email hoặc mật khẩu không đúng'
          : 'Số điện thoại hoặc mật khẩu không đúng'
      });
      toast.error('Thông tin đăng nhập không chính xác');
    } catch (error: any) {
      setErrors({
        general: error.message || 'Có lỗi xảy ra khi đăng nhập'
      });
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Đăng nhập</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            loginMethod === 'email'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            loginMethod === 'phone'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Phone className="h-4 w-4" />
          Số điện thoại
        </button>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {loginMethod === 'email' && (
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        )}

        {loginMethod === 'phone' && (
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Số điện thoại
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0xxxxxxxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={errors.phone ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              Quên mật khẩu?
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </Button>
      </form>

      {/* Register Link */}
      {onSwitchToRegister && (
        <div className="mt-6 text-center text-sm">
          Chưa có tài khoản?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary font-medium hover:underline"
            disabled={isLoading}
          >
            Đăng ký ngay
          </button>
        </div>
      )}
    </div>
  );
}
