'use client';

import { useState, useEffect } from 'react';
import { Activity, PaymentQR, AdminConfig } from '@/types';
import ActivityList from '@/components/ActivityList';
import AddActivity from '@/components/AddActivity';
import DebtSummary from '@/components/DebtSummary';
import QRCodeManager from '@/components/QRCodeManager';
import AuthModal from '@/components/AuthModal';
import Overview from '@/components/Overview';
import SearchFilter from '@/components/SearchFilter';
import ExportButton from '@/components/ExportButton';
import { Plus, List, BarChart3, QrCode, Wallet, Wifi, WifiOff, Home as HomeIcon, LogOut, Shield, Eye, Loader2 } from 'lucide-react';
import * as firebaseService from '@/lib/firebaseService';
import toast, { Toaster } from 'react-hot-toast';
import { hashPin, verifyPin } from '@/lib/securityUtils';

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [paymentQR, setPaymentQR] = useState<PaymentQR | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'list' | 'summary' | 'qr'>('overview');
  const [isConnected, setIsConnected] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [adminName, setAdminName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  // Update filtered activities when activities change
  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  // Load admin config on mount
  useEffect(() => {
    const loadAdminConfig = async () => {
      try {
        const config = await firebaseService.getAdminConfig();
        setAdminConfig(config);
      } catch (error) {
        console.error('Error loading admin config:', error);
      }
    };
    loadAdminConfig();
  }, []);

  // Subscribe to Firebase realtime updates
  useEffect(() => {
    let unsubscribeActivities: (() => void) | undefined;
    let unsubscribeQR: (() => void) | undefined;

    try {
      // Subscribe to activities
      unsubscribeActivities = firebaseService.subscribeToActivities((data) => {
        setActivities(data);
        setIsConnected(true);
      });

      // Subscribe to payment QR
      unsubscribeQR = firebaseService.subscribeToPaymentQR((data) => {
        setPaymentQR(data);
      });
    } catch (error) {
      console.error('Firebase connection error:', error);
      setIsConnected(false);
    }

    return () => {
      unsubscribeActivities?.();
      unsubscribeQR?.();
    };
  }, []);

  const addActivity = async (activity: Activity) => {
    setIsLoading(true);
    try {
      await firebaseService.addActivity(activity);
      toast.success('✅ Thêm hoạt động thành công!');
      setActiveTab('list');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Lỗi khi thêm hoạt động. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (updatedActivity: Activity) => {
    setIsLoading(true);
    try {
      await firebaseService.updateActivity(updatedActivity.id, updatedActivity);
      toast.success('🔄 Cập nhật thành công!');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Lỗi khi cập nhật. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    setIsLoading(true);
    try {
      await firebaseService.deleteActivity(id);
      toast.success('🗑️ Xóa thành công!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Lỗi khi xóa. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentQR = async (qr: PaymentQR) => {
    setIsLoading(true);
    try {
      await firebaseService.savePaymentQR(qr);
      toast.success('💾 Lưu QR code thành công!');
    } catch (error) {
      console.error('Error saving QR:', error);
      toast.error('Lỗi khi lưu QR code. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin login
  const handleAdminLogin = async (pin: string) => {
    if (!adminConfig) {
      // First time setup
      try {
        setIsLoading(true);
        const hashedPin = await hashPin(pin);
        const newConfig: AdminConfig = {
          pin: hashedPin,
          name: adminName || 'Admin',
        };
        await firebaseService.saveAdminConfig(newConfig);
        setAdminConfig(newConfig);
        setIsAdmin(true);
        setShowAuthModal(false);
        setAdminName(newConfig.name);
        toast.success(`🎉 Chào mừng ${newConfig.name}! Tài khoản đã được tạo.`);
      } catch (error) {
        toast.error('Lỗi khi tạo tài khoản!');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Verify PIN
      try {
        setIsLoading(true);
        
        // Try hash verification first (new format)
        let isValid = await verifyPin(pin, adminConfig.pin);
        
        // If hash verification fails, try plain text (legacy support)
        if (!isValid && pin === adminConfig.pin) {
          isValid = true;
          
          // Migrate to hashed PIN
          const hashedPin = await hashPin(pin);
          const updatedConfig = { ...adminConfig, pin: hashedPin };
          await firebaseService.saveAdminConfig(updatedConfig);
          setAdminConfig(updatedConfig);
          toast.success(`👋 Chào ${adminConfig.name}! (PIN đã được nâng cấp bảo mật)`);
        } else if (isValid) {
          toast.success(`👋 Chào ${adminConfig.name}!`);
        } else {
          toast.error('❌ Mã PIN không chính xác!');
        }
        
        if (isValid) {
          setIsAdmin(true);
          setShowAuthModal(false);
          setAdminName(adminConfig.name);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle viewer mode
  const handleViewerMode = () => {
    setIsAdmin(false);
    setShowAuthModal(false);
    setAdminName('');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAdmin(false);
    setShowAuthModal(true);
    setAdminName('');
    setActiveTab('overview');
  };

  // Get unique participant names from all activities
  const getAllParticipants = (): string[] => {
    const participantSet = new Set<string>();
    activities.forEach(activity => {
      activity.participants.forEach(p => {
        participantSet.add(p.name);
      });
    });
    return Array.from(participantSet).sort();
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '16px',
            padding: '16px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-violet-200 dark:border-violet-700">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
            <span className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Đang xử lý...</span>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onAdminLogin={handleAdminLogin}
          onViewerMode={handleViewerMode}
          isFirstTime={!adminConfig}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-fuchsia-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-600 rounded-2xl shadow-lg">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                    Chia Tiền Nhóm
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-tight hidden sm:block">
                    Quản lý chi phí thông minh
                  </p>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Connection Status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">Online</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">Offline</span>
                    </>
                  )}
                </div>

                {/* Export Button */}
                <div className="hidden md:block">
                  <ExportButton activities={activities} />
                </div>

                {/* User Badge */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg">
                  {isAdmin ? (
                    <>
                      <Shield className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-black tracking-tight hidden sm:inline">{adminName}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-black tracking-tight hidden sm:inline">Xem</span>
                    </>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all hover:scale-105 shadow-md group"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-500" />
                  <span className="hidden lg:inline text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-red-500 tracking-tight">Thoát</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-30">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all duration-300 w-full ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/50 scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              <HomeIcon className={`w-6 h-6 ${activeTab === 'overview' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
              <span className="tracking-tight">Tổng quan</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('add')}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all duration-300 w-full ${
                  activeTab === 'add'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/50 scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                }`}
              >
                <Plus className={`w-6 h-6 transition-transform group-hover:rotate-90 ${activeTab === 'add' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                <span className="tracking-tight">Thêm mới</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('list')}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all duration-300 w-full ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/50 scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              <List className={`w-6 h-6 ${activeTab === 'list' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
              <span className="flex-1 text-left tracking-tight">Hoạt động</span>
              <span className={`px-3 py-1 rounded-full text-sm font-black ${
                activeTab === 'list' ? 'bg-white/20' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
              }`}>
                {activities.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('summary')}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all duration-300 w-full ${
                activeTab === 'summary'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/50 scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              <BarChart3 className={`w-6 h-6 ${activeTab === 'summary' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
              <span className="tracking-tight">Công nợ</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('qr')}
                className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all duration-300 w-full ${
                  activeTab === 'qr'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/50 scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                }`}
              >
                <QrCode className={`w-6 h-6 ${activeTab === 'qr' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                <span className="tracking-tight">QR Code</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Bottom Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'overview'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <HomeIcon className="w-6 h-6" />
              <span className="tracking-tight">Tổng quan</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('add')}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'add'
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Plus className="w-6 h-6" />
                <span className="tracking-tight">Thêm</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('list')}
              className={`relative flex flex-col items-center gap-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'list'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="w-6 h-6" />
              <span className="tracking-tight">Danh sách</span>
              {activities.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full flex items-center justify-center font-black shadow-lg">
                  {activities.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                activeTab === 'summary'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="tracking-tight">Công nợ</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all ${
                  activeTab === 'qr'
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span className="tracking-tight">QR</span>
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 pb-20 lg:pb-8 lg:pl-72 min-h-screen">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="lg:min-h-[calc(100vh-11rem)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 overflow-hidden">
              {activeTab === 'overview' && (
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
                      Tổng quan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Xem thống kê và báo cáo tổng hợp</p>
                  </div>
                  <Overview activities={activities} />
                </div>
              )}
              
              {activeTab === 'add' && isAdmin && (
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                      <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 tracking-tight">
                        Thêm hoạt động mới
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 font-semibold">Điền thông tin chi tiết về hoạt động chi tiêu</p>
                    </div>
                    <AddActivity onAdd={addActivity} existingParticipants={getAllParticipants()} />
                  </div>
                </div>
              )}
              
              {activeTab === 'list' && (
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-4 tracking-tight">Danh sách hoạt động</h2>
                    <SearchFilter
                      activities={activities}
                      onFilteredResults={setFilteredActivities}
                    />
                  </div>
                  <ActivityList
                    activities={filteredActivities}
                    onUpdate={updateActivity}
                    onDelete={deleteActivity}
                    paymentQR={paymentQR}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
              
              {activeTab === 'summary' && (
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
                      Báo cáo công nợ
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Theo dõi chi tiết các khoản phải thu</p>
                  </div>
                  <DebtSummary activities={activities} />
                </div>
              )}
              
              {activeTab === 'qr' && isAdmin && (
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                      <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 tracking-tight">
                        Quản lý QR Code
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 font-semibold">Cập nhật thông tin thanh toán</p>
                    </div>
                    <QRCodeManager paymentQR={paymentQR} onUpdate={updatePaymentQR} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
