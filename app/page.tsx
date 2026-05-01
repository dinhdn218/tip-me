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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-2xl shadow-2xl flex items-center gap-3 border border-border">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm font-semibold text-foreground">Đang xử lý...</span>
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

      <div className="min-h-screen bg-muted/30 dark:bg-background">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Logo & Brand */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <Wallet className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground leading-none">Chia Tiền Nhóm</h1>
                  <p className="text-[10px] text-muted-foreground hidden sm:block leading-none mt-0.5">Quản lý chi phí thông minh</p>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Connection Status */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium">
                  {isConnected ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Online</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                      <WifiOff className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-destructive">Offline</span>
                    </>
                  )}
                </div>

                {/* Export Button */}
                <div className="hidden md:block">
                  <ExportButton activities={activities} />
                </div>

                {/* User Badge */}
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="flex items-center gap-1.5 px-2.5 py-1 h-auto">
                  {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-xs">{isAdmin ? adminName : 'Xem'}</span>
                </Badge>

                {/* Logout Button */}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-2 hover:text-destructive" title="Đăng xuất">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">Thoát</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-56 bg-background border-r border-border overflow-y-auto z-30">
          <nav className="p-3 space-y-1">
            <Separator className="my-2" />
            {[
              { tab: 'overview', icon: HomeIcon, label: 'Tổng quan' },
              ...(isAdmin ? [{ tab: 'add', icon: Plus, label: 'Thêm mới' }] : []),
              { tab: 'list', icon: List, label: 'Hoạt động', badge: activities.length },
              { tab: 'summary', icon: BarChart3, label: 'Công nợ' },
              { tab: 'qr', icon: QrCode, label: 'QR Code' },
            ].map(({ tab, icon: Icon, label, badge }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors w-full ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <Badge variant={activeTab === tab ? 'outline' : 'secondary'} className={`text-[10px] px-1.5 h-4 ${activeTab === tab ? 'border-primary-foreground/50 text-primary-foreground' : ''}`}>
                    {badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Bottom Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border pb-safe">
          <div className="flex items-center justify-around px-1 py-1.5">
            {[
              { tab: 'overview', icon: HomeIcon, label: 'Tổng quan' },
              ...(isAdmin ? [{ tab: 'add', icon: Plus, label: 'Thêm' }] : []),
              { tab: 'list', icon: List, label: 'Danh sách', badge: activities.length },
              { tab: 'summary', icon: BarChart3, label: 'Công nợ' },
              { tab: 'qr', icon: QrCode, label: 'QR' },
            ].map(({ tab, icon: Icon, label, badge }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 shrink-0" />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-none">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-14 pb-20 lg:pb-0 lg:pl-56 min-h-screen">
          <div className="mx-auto">
            <div className="lg:min-h-[calc(100vh-3.5rem)] bg-background">
              {activeTab === 'overview' && (
                <div className="p-4 sm:p-6">
                  <Overview activities={activities} isAdmin={isAdmin} onNavigate={(tab) => setActiveTab(tab as 'summary' | 'list' | 'add' | 'overview' | 'qr')} />
                </div>
              )}
              
              {activeTab === 'add' && isAdmin && (
                <div className="p-4 sm:p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-xl font-bold text-foreground mb-0.5">Thêm hoạt động mới</h2>
                      <p className="text-muted-foreground text-sm">Điền thông tin chi tiết về hoạt động chi tiêu</p>
                    </div>
                    <AddActivity onAdd={addActivity} existingParticipants={getAllParticipants()} />
                  </div>
                </div>
              )}
              
              {activeTab === 'list' && (
                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-3">Danh sách hoạt động</h2>
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
                    <h2 className="text-xl font-bold text-foreground mb-0.5">Báo cáo công nợ</h2>
                    <p className="text-muted-foreground text-sm">Theo dõi chi tiết các khoản phải thu</p>
                  </div>
                  <DebtSummary activities={activities} onMarkAllPaid={markAllPaidForPerson} isAdmin={isAdmin} />
                </div>
              )}
              
              {activeTab === 'qr' && (
                <div className="p-4 sm:p-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-xl font-bold text-foreground mb-0.5">
                        {isAdmin ? 'Quản lý QR Code' : 'Thông tin thanh toán'}
                      </h2>
                      <p className="text-muted-foreground text-sm">
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
