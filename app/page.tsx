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
import Sidebar from '@/components/Sidebar';
import AppHeader from '@/components/AppHeader';
import QuickSplitWidget from '@/components/QuickSplitWidget';
import { Plus, List, BarChart3, QrCode, Home as HomeIcon, Loader2 } from 'lucide-react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQuickSplit, setShowQuickSplit] = useState(false);

  useEffect(() => { setFilteredActivities(activities); }, [activities]);

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

  useEffect(() => {
    let unsubscribeActivities: (() => void) | undefined;
    let unsubscribeQR: (() => void) | undefined;
    try {
      unsubscribeActivities = firebaseService.subscribeToActivities((data) => {
        setActivities(data);
        setIsConnected(true);
      });
      unsubscribeQR = firebaseService.subscribeToPaymentQR((data) => {
        setPaymentQR(data);
      });
    } catch {
      setIsConnected(false);
    }
    return () => { unsubscribeActivities?.(); unsubscribeQR?.(); };
  }, []);

  const addActivity = async (activity: Activity) => {
    setIsLoading(true);
    try {
      await firebaseService.addActivity(activity);
      toast.success('✅ Thêm hoạt động thành công!');
      setActiveTab('list');
    } catch {
      toast.error('Lỗi khi thêm hoạt động. Vui lòng thử lại!');
    } finally { setIsLoading(false); }
  };

  const updateActivity = async (updatedActivity: Activity) => {
    setIsLoading(true);
    try {
      await firebaseService.updateActivity(updatedActivity.id, updatedActivity);
      toast.success('🔄 Cập nhật thành công!');
    } catch { toast.error('Lỗi khi cập nhật. Vui lòng thử lại!'); }
    finally { setIsLoading(false); }
  };

  const deleteActivity = async (id: string) => {
    setIsLoading(true);
    try {
      await firebaseService.deleteActivity(id);
      toast.success('🗑️ Xóa thành công!');
    } catch { toast.error('Lỗi khi xóa. Vui lòng thử lại!'); }
    finally { setIsLoading(false); }
  };

  const markAllPaidForPerson = async (personName: string) => {
    setIsLoading(true);
    try {
      const toUpdate = activities.filter(a => a.participants.some(p => p.name === personName && !p.paid));
      for (const activity of toUpdate) {
        await firebaseService.updateActivity(activity.id, {
          ...activity,
          participants: activity.participants.map(p =>
            p.name === personName ? { ...p, paid: true } : p
          ),
        });
      }
      toast.success(`✅ Đã đánh dấu tất cả khoản nợ của ${personName} là đã thanh toán!`);
    } catch { toast.error('Lỗi khi cập nhật. Vui lòng thử lại!'); }
    finally { setIsLoading(false); }
  };

  const deleteAllActivities = async () => {
    setIsLoading(true);
    try {
      for (const activity of activities) await firebaseService.deleteActivity(activity.id);
      toast.success('🗑️ Đã xóa tất cả hoạt động!');
    } catch { toast.error('Lỗi khi xóa. Vui lòng thử lại!'); }
    finally { setIsLoading(false); }
  };

  const updatePaymentQR = async (qr: PaymentQR) => {
    setIsLoading(true);
    try {
      await firebaseService.savePaymentQR(qr);
      toast.success('💾 Lưu QR code thành công!');
    } catch { toast.error('Lỗi khi lưu QR code. Vui lòng thử lại!'); }
    finally { setIsLoading(false); }
  };

  const handleAdminLogin = async (pin: string) => {
    if (!adminConfig) {
      try {
        setIsLoading(true);
        const hashedPin = await hashPin(pin);
        const newConfig: AdminConfig = { pin: hashedPin, name: adminName || 'Admin' };
        await firebaseService.saveAdminConfig(newConfig);
        setAdminConfig(newConfig);
        setIsAdmin(true);
        setShowAuthModal(false);
        setAdminName(newConfig.name);
        toast.success(`🎉 Chào mừng ${newConfig.name}! Tài khoản đã được tạo.`);
      } catch { toast.error('Lỗi khi tạo tài khoản!'); }
      finally { setIsLoading(false); }
    } else {
      try {
        setIsLoading(true);
        let isValid = await verifyPin(pin, adminConfig.pin);
        if (!isValid && pin === adminConfig.pin) {
          isValid = true;
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
        if (isValid) { setIsAdmin(true); setShowAuthModal(false); setAdminName(adminConfig.name); }
      } finally { setIsLoading(false); }
    }
  };

  const handleViewerMode = () => { setIsAdmin(false); setShowAuthModal(false); setAdminName(''); };
  const handleLogout = () => { setIsAdmin(false); setShowAuthModal(true); setAdminName(''); setActiveTab('overview'); };

  const getAllParticipants = (): string[] => {
    const s = new Set<string>();
    activities.forEach(a => a.participants.forEach(p => s.add(p.name)));
    return Array.from(s).sort();
  };

  const pendingCount = activities.reduce((n, a) => n + a.participants.filter(p => !p.paid).length, 0);
  const sidebarWidth = sidebarCollapsed ? 60 : 224;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#333', color: '#fff', borderRadius: '16px', padding: '16px', fontWeight: '600' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-2xl shadow-2xl flex items-center gap-3 border border-border">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm font-semibold">Đang xử lý...</span>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal onAdminLogin={handleAdminLogin} onViewerMode={handleViewerMode} isFirstTime={!adminConfig} />
      )}

      {/* Collapsible desktop sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
        isAdmin={isAdmin}
        adminName={adminName}
        activitiesCount={activities.length}
        pendingCount={pendingCount}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      {/* Sticky glassmorphic header */}
      <AppHeader
        isAdmin={isAdmin}
        adminName={adminName}
        isConnected={isConnected}
        activities={activities}
        onLogout={handleLogout}
        onQuickAdd={() => setShowQuickSplit(true)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Quick split drawer */}
      <QuickSplitWidget
        open={showQuickSplit}
        onClose={() => setShowQuickSplit(false)}
        onAdd={addActivity}
        existingParticipants={getAllParticipants()}
      />

      {/* Bottom mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border pb-safe">
        <div className="flex items-center justify-around px-1 py-1.5">
          {[
            { tab: 'overview', icon: HomeIcon, label: 'Tổng quan' },
            ...(isAdmin ? [{ tab: 'add', icon: Plus, label: 'Thêm', badge: undefined as number | undefined }] : []),
            { tab: 'list', icon: List, label: 'Danh sách', badge: activities.length },
            { tab: 'summary', icon: BarChart3, label: 'Công nợ', badge: pendingCount > 0 ? pendingCount : undefined },
            { tab: 'qr', icon: QrCode, label: 'QR' },
          ].map(({ tab, icon: Icon, label, badge }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg font-medium transition-all ${
                activeTab === tab ? 'text-primary' : 'text-muted-foreground'
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

      {/* Main content */}
      <main
        className="pt-14 pb-20 lg:pb-0 min-h-screen transition-[padding-left] duration-[220ms]"
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        {/* On mobile reset the inline padding */}
        <style>{`@media (max-width: 1023px) { main { padding-left: 0 !important; } }`}</style>

        <div className="bg-muted/30 dark:bg-background min-h-full">
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-6">
              <Overview
                activities={activities}
                isAdmin={isAdmin}
                onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
                onQuickAdd={() => setShowQuickSplit(true)}
              />
            </div>
          )}

          {activeTab === 'add' && isAdmin && (
            <div className="p-4 sm:p-6 max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-0.5">Thêm hoạt động mới</h2>
                <p className="text-muted-foreground text-sm">Điền thông tin chi tiết về hoạt động chi tiêu</p>
              </div>
              <AddActivity onAdd={addActivity} existingParticipants={getAllParticipants()} />
            </div>
          )}

          {activeTab === 'list' && (
            <div className="p-4 sm:p-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Danh sách hoạt động</h2>
                <SearchFilter activities={activities} onFilteredResults={setFilteredActivities} />
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
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-0.5">Báo cáo công nợ</h2>
                <p className="text-muted-foreground text-sm">Theo dõi chi tiết các khoản phải thu</p>
              </div>
              <DebtSummary activities={activities} onMarkAllPaid={markAllPaidForPerson} isAdmin={isAdmin} />
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="p-4 sm:p-6 max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-0.5">
                  {isAdmin ? 'Quản lý QR Code' : 'Thông tin thanh toán'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isAdmin ? 'Cập nhật thông tin thanh toán' : 'Xem thông tin chuyển khoản'}
                </p>
              </div>
              <QRCodeManager paymentQR={paymentQR} onUpdate={updatePaymentQR} isAdmin={isAdmin} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
