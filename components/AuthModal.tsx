'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Users } from 'lucide-react';

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
    <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Chia Tiền Nhóm
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isFirstTime ? 'Thiết lập tài khoản quản trị' : 'Chọn chế độ truy cập'}
          </p>
        </div>

        {/* Admin Login Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">
                {isFirstTime ? 'Tạo mã PIN' : 'Chế độ Quản lý'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isFirstTime ? 'Thiết lập mã PIN để quản lý' : 'Thêm, sửa, xóa hoạt động'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isFirstTime && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tên của bạn
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {isFirstTime ? 'Tạo mã PIN (4-6 số)' : 'Nhập mã PIN'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={isFirstTime ? '1234' : '••••'}
                  maxLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all pr-12 text-lg font-semibold tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isFirstTime && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Ghi nhớ mã PIN này để quản lý ứng dụng
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              {isLoading ? 'Đang xử lý...' : (isFirstTime ? 'Tạo tài khoản' : 'Đăng nhập quản lý')}
            </button>
          </form>
        </div>

        {/* Viewer Mode Button */}
        {!isFirstTime && (
          <button
            onClick={onViewerMode}
            className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            <Users className="w-5 h-5 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-bold text-gray-800 dark:text-white">Chế độ Xem</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Chỉ xem dữ liệu, không chỉnh sửa</div>
            </div>
          </button>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isFirstTime 
              ? 'Mã PIN sẽ được lưu và dùng để xác thực sau này'
              : 'Bạn có thể chuyển đổi chế độ bất kỳ lúc nào'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
