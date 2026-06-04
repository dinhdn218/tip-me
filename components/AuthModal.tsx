'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  onAdminLogin: (pin: string) => void;
  onViewerMode: () => void;
  isFirstTime?: boolean;
}

export default function AuthModal({ onAdminLogin, onViewerMode, isFirstTime }: AuthModalProps) {
  const [pin, setPin] = useState('');
  const [adminName, setAdminName] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Lock background scroll while the login screen is shown (the app shell
  // renders behind it). Keeps the login at exactly one viewport, no scrollbar.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      alert('Vui lòng nhập mã PIN!');
      return;
    }
    if (isFirstTime && !adminName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }
    setIsLoading(true);
    await onAdminLogin(pin);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-hidden">
      {/* Animated mesh background — matches the app shell */}
      <div className="app-bg" aria-hidden>
        <div className="blob" style={{ width: '46vw', height: '46vw', top: '-10vh', left: '-8vw', background: 'oklch(0.62 0.20 280)' }} />
        <div className="blob" style={{ width: '40vw', height: '40vw', top: '-6vh', right: '-10vw', left: 'auto', background: 'oklch(0.64 0.18 320)', animationDelay: '-7s' }} />
        <div className="blob" style={{ width: '44vw', height: '44vw', bottom: '-12vh', right: '2vw', left: 'auto', background: 'oklch(0.66 0.15 210)', animationDelay: '-13s' }} />
        <div className="blob" style={{ width: '34vw', height: '34vw', bottom: '-8vh', left: '-6vw', background: 'oklch(0.66 0.17 350)', animationDelay: '-3s' }} />
      </div>

      <div className="max-w-md w-full space-y-4 animate-rise">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gradient rounded-2xl mb-4 ring-brand">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-1 text-brand-gradient">Chia Tiền Nhóm</h1>
          <p className="text-sm text-muted-foreground">
            {isFirstTime ? 'Thiết lập tài khoản quản trị' : 'Chọn chế độ truy cập'}
          </p>
        </div>

        {/* Admin Login Card */}
        <Card className="border-border/50 card-float bg-card/75 backdrop-blur-xl rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-gradient rounded-lg flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-base text-foreground">
                  {isFirstTime ? 'Tạo mã PIN' : 'Chế độ Quản lý'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isFirstTime ? 'Thiết lập mã PIN để quản lý' : 'Thêm, sửa, xóa hoạt động'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isFirstTime && (
                <div className="space-y-2">
                  <Label htmlFor="adminName">Tên của bạn</Label>
                  <Input
                    id="adminName"
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="pin">{isFirstTime ? 'Tạo mã PIN (4-6 số)' : 'Nhập mã PIN'}</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isFirstTime ? '1234' : '••••'}
                    maxLength={6}
                    className="pr-10 text-base font-semibold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isFirstTime && (
                  <p className="text-xs text-muted-foreground">Ghi nhớ mã PIN này để quản lý ứng dụng</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-brand-gradient text-white border-0 ring-brand hover:opacity-90">
                <Lock className="w-4 h-4" />
                {isLoading ? 'Đang xử lý...' : (isFirstTime ? 'Tạo tài khoản' : 'Đăng nhập quản lý')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Viewer Mode */}
        {!isFirstTime && (
          <button
            onClick={onViewerMode}
            className="w-full px-5 py-4 bg-card/70 backdrop-blur-xl rounded-2xl border border-border/50 card-float hover:border-primary/50 hover:bg-card transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-foreground">Chế độ Xem</p>
              <p className="text-xs text-muted-foreground">Chỉ xem dữ liệu, không chỉnh sửa</p>
            </div>
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {isFirstTime
            ? 'Mã PIN sẽ được lưu và dùng để xác thực sau này'
            : 'Bạn có thể chuyển đổi chế độ bất kỳ lúc nào'}
        </p>
      </div>
    </div>
  );
}
