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
            borderRadius: '12px',
            padding: '16px',
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            <span className="text-lg font-semibold text-gray-800 dark:text-white">Đang xử lý...</span>
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

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          <header className="mb-6 sm:mb-8 lg:mb-10 animate-fade-in">
            {/* Mobile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg">
                  <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Chia Tiền Nhóm
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Quản lý chi phí thông minh
                  </p>
                </div>
              </div>
              
              {/* User Info & Actions */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Export Button */}
                <div className="hidden sm:block">
                  <ExportButton activities={activities} />
                </div>
                
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex-1 sm:flex-none">
                  {isAdmin ? (
                    <>
                      <Shield className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white truncate">{adminName}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Chế độ xem</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="hidden sm:inline text-sm">Thoát</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Export Button */}
            <div className="sm:hidden mb-4">
              <ExportButton activities={activities} />
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md w-fit mx-auto">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Realtime sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Mất kết nối</span>
                </>
              )}
            </div>
          </header>

          {/* Tabs Navigation */}
          <nav className="mb-6 sm:mb-8">
            {/* Desktop Tabs */}
            <div className="hidden sm:flex gap-2 lg:gap-3 flex-wrap justify-center">
              <button
                onClick={() => setActiveTab('overview')}
                className={`group flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm'
                }`}
              >
                <HomeIcon className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'overview' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                <span>Tổng quan</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('add')}
                  className={`group flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'add'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm'
                  }`}
                >
                  <Plus className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:rotate-90 ${activeTab === 'add' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                  <span>Thêm mới</span>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('list')}
                className={`group flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'list'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm'
                }`}
              >
                <List className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'list' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                <span>Chi tiết</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'list' ? 'bg-white/20' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
                }`}>
                  {activities.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('summary')}
                className={`group flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'summary'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm'
                }`}
              >
                <BarChart3 className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'summary' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                <span>Công nợ</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`group flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'qr'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-md backdrop-blur-sm'
                  }`}
                >
                  <QrCode className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === 'qr' ? '' : 'text-violet-600 dark:text-violet-400'}`} />
                  <span>QR Code</span>
                </button>
              )}
            </div>

            {/* Mobile Tabs - Scrollable */}
            <div className="sm:hidden overflow-x-auto pb-2 -mx-3 px-3">
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>Tổng quan</span>
                </button>
                
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('add')}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                      activeTab === 'add'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Thêm</span>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('list')}
                  className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'list'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                  <span>Chi tiết</span>
                  {activities.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activities.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'summary'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Công nợ</span>
                </button>
                
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                      activeTab === 'qr'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>QR</span>
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* Content */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
            {activeTab === 'overview' && (
              <div className="p-6 sm:p-8">
                <Overview activities={activities} />
              </div>
            )}
            
            {activeTab === 'add' && isAdmin && (
              <div className="p-6 sm:p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                      Thêm hoạt động mới
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Điền thông tin chi tiết về hoạt động</p>
                  </div>
                  <AddActivity onAdd={addActivity} existingParticipants={getAllParticipants()} />
                </div>
              </div>
            )}
            
            {activeTab === 'list' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Danh sách hoạt động</h2>
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
              <div className="p-6 sm:p-8">
                <DebtSummary activities={activities} />
              </div>
            )}
            
            {activeTab === 'qr' && isAdmin && (
              <div className="p-6 sm:p-8">
                <div className="max-w-2xl mx-auto">
                  <QRCodeManager paymentQR={paymentQR} onUpdate={updatePaymentQR} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
