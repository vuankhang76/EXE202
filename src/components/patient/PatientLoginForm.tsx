import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/AuthContext';

interface PatientLoginFormProps {
  onSuccess?: (token: string, user: any) => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export default function PatientLoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }: PatientLoginFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');

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

  const onEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !emailPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password: emailPassword, userType: 'patient' });
      onSuccess?.('', {});
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!phone || !phonePassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      await login({ phone: normalizedPhone, password: phonePassword, userType: 'patient' });
      onSuccess?.('', {});
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Đăng nhập bệnh nhân</h2>
        <p className="text-muted-foreground mt-2">Đăng nhập để đặt lịch và quản lý sức khỏe</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            loginMethod === 'email'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            loginMethod === 'phone'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Số điện thoại
        </button>
      </div>

      {loginMethod === 'email' && (
        <form onSubmit={onEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="email-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {onForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
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
      )}

      {loginMethod === 'phone' && (
        <form onSubmit={onPhoneLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="phone-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={phonePassword}
                onChange={(e) => setPhonePassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {onForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
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
      )}

      {onSwitchToRegister && (
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-medium"
          >
            Đăng ký ngay
          </button>
        </div>
      )}
    </div>
  );
}
