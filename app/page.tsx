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

  const markAllPaidForPerson = async (personName: string) => {
    setIsLoading(true);
    try {
      // Find all activities where this person hasn't paid
      const activitiesToUpdate = activities.filter(activity => 
        activity.participants.some(p => p.name === personName && !p.paid)
      );

      // Update each activity
      for (const activity of activitiesToUpdate) {
        const updatedActivity = {
          ...activity,
          participants: activity.participants.map(p =>
            p.name === personName ? { ...p, paid: true } : p
          ),
        };
        await firebaseService.updateActivity(activity.id, updatedActivity);
      }

      toast.success(`✅ Đã đánh dấu tất cả khoản nợ của ${personName} là đã thanh toán!`);
    } catch (error) {
      console.error('Error marking all paid:', error);
      toast.error('Lỗi khi cập nhật. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllActivities = async () => {
    setIsLoading(true);
    try {
      // Delete all activities
      for (const activity of activities) {
        await firebaseService.deleteActivity(activity.id);
      }
      toast.success('🗑️ Đã xóa tất cả hoạt động!');
    } catch (error) {
      console.error('Error deleting all activities:', error);
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-violet-600 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Chia Tiền Nhóm
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Quản lý chi phí thông minh
                  </p>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Connection Status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">Online</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">Offline</span>
                    </>
                  )}
                </div>

                {/* Export Button */}
                <div className="hidden md:block">
                  <ExportButton activities={activities} />
                </div>

                {/* User Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 text-white">
                  {isAdmin ? (
                    <>
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-semibold hidden sm:inline">{adminName}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-semibold hidden sm:inline">Xem</span>
                    </>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                  <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">Thoát</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-30">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors w-full ${
                activeTab === 'overview'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Tổng quan</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors w-full ${
                  activeTab === 'add'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>Thêm mới</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors w-full ${
                activeTab === 'list'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="flex-1 text-left">Hoạt động</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                activeTab === 'list' ? 'bg-white/20' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
              }`}>
                {activities.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors w-full ${
                activeTab === 'summary'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Công nợ</span>
            </button>
            
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors w-full ${
                activeTab === 'qr'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>QR Code</span>
            </button>
          </nav>
        </aside>

        {/* Bottom Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe">
          <div className="flex items-center justify-around px-1 py-1.5 sm:py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1.5 sm:px-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none">Tổng quan</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('add')}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1.5 sm:px-2 rounded-lg font-medium transition-all ${
                  activeTab === 'add'
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs leading-none">Thêm</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('list')}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1.5 sm:px-2 rounded-lg font-medium transition-all ${
                activeTab === 'list'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="relative">
                <List className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                {activities.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                    {activities.length > 99 ? '99+' : activities.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs leading-none">Danh sách</span>
            </button>
            
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1.5 sm:px-2 rounded-lg font-medium transition-all ${
                activeTab === 'summary'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none">Công nợ</span>
            </button>
            
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1.5 sm:px-2 rounded-lg font-medium transition-all ${
                activeTab === 'qr'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none">QR</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-16 pb-20 lg:pb-0 lg:pl-64 min-h-screen">
          <div className="mx-auto">
            <div className="lg:min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800">
              {activeTab === 'overview' && (
                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Tổng quan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Xem thống kê và báo cáo tổng hợp</p>
                  </div>
                  <Overview activities={activities} />
                </div>
              )}
              
              {activeTab === 'add' && isAdmin && (
                <div className="p-4 sm:p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Thêm hoạt động mới
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Điền thông tin chi tiết về hoạt động chi tiêu</p>
                    </div>
                    <AddActivity onAdd={addActivity} existingParticipants={getAllParticipants()} />
                  </div>
                </div>
              )}
              
              {activeTab === 'list' && (
                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Danh sách hoạt động</h2>
                    <SearchFilter
                      activities={activities}
                      onFilteredResults={setFilteredActivities}
                    />
                  </div>
                  <ActivityList
                    activities={filteredActivities}
                    onUpdate={updateActivity}
                    onDelete={deleteActivity}
                    onDeleteAll={deleteAllActivities}
                    paymentQR={paymentQR}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
              
              {activeTab === 'summary' && (
                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Báo cáo công nợ
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Theo dõi chi tiết các khoản phải thu</p>
                  </div>
                  <DebtSummary activities={activities} onMarkAllPaid={markAllPaidForPerson} isAdmin={isAdmin} />
                </div>
              )}
              
              {activeTab === 'qr' && (
                <div className="p-4 sm:p-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {isAdmin ? 'Quản lý QR Code' : 'Thông tin thanh toán'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isAdmin ? 'Cập nhật thông tin thanh toán' : 'Xem thông tin chuyển khoản'}
                      </p>
                    </div>
                    <QRCodeManager paymentQR={paymentQR} onUpdate={updatePaymentQR} isAdmin={isAdmin} />
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
