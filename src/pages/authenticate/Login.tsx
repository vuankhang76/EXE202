import React from 'react';
import { Heart, Users, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import LoginForm from '@/components/LoginForm';
import logo from '@/assets/Logo_RemoveBg1.png';
export default function Login() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-200 to-red-50">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="logo" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">SavePlus</h1>
                <p className="text-sm text-muted-foreground">Nền tảng quản lý y tế thông minh</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Bảo mật cấp y tế</span>
            </div>
          </div>
        </div>
      </header>
      <div className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-start h-full">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập vào hệ thống</h2>
                </div>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-col justify-center min-h-[470px]">
              <div className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xl bg-card/60 p-6 border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-foreground">Quản lý bệnh nhân</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Theo dõi thông tin bệnh nhân, lịch sử khám chữa bệnh và kết quả xét nghiệm.
                    </p>
                  </div>

                  <div className="rounded-xl bg-card/60 p-6 border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Heart className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-foreground">Chăm sóc thông minh</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI hỗ trợ chẩn đoán và đưa ra khuyến nghị điều trị phù hợp.
                    </p>
                  </div>

                  <div className="rounded-xl bg-card/60 p-6 border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-foreground">Bảo mật tối đa</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tuân thủ HIPAA và các tiêu chuẩn bảo mật y tế quốc tế.
                    </p>
                  </div>

                  <div className="rounded-xl bg-card/60 p-6 border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-foreground">Báo cáo chi tiết</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Thống kê và phân tích dữ liệu y tế để cải thiện chất lượng dịch vụ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
