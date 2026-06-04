"use client";

import { useState, useEffect } from "react";
import { Activity, PaymentQR, AdminConfig } from "@/types";
import ActivityList from "@/components/ActivityList";
import DebtSummary from "@/components/DebtSummary";
import QRCodeManager from "@/components/QRCodeManager";
import AuthModal from "@/components/AuthModal";
import Overview from "@/components/Overview";
import SearchFilter from "@/components/SearchFilter";
import TopBar from "@/components/TopBar";
import NavDock from "@/components/NavDock";
import QuickSplitWidget from "@/components/QuickSplitWidget";
import { Loader2 } from "lucide-react";
import * as firebaseService from "@/lib/firebaseService";
import toast, { Toaster } from "react-hot-toast";
import { hashPin, verifyPin } from "@/lib/securityUtils";

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [paymentQR, setPaymentQR] = useState<PaymentQR | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "list" | "summary" | "qr"
  >("overview");
  const [isConnected, setIsConnected] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [showQuickSplit, setShowQuickSplit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  // Sync theme state with the class applied by the anti-FOUC script in layout.
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  };

  const handleGlobalSearch = (value: string) => {
    setSearchQuery(value);
    if (value && activeTab !== "list") setActiveTab("list");
  };

  useEffect(() => {
    const loadAdminConfig = async () => {
      try {
        const config = await firebaseService.getAdminConfig();
        setAdminConfig(config);
      } catch (error) {
        console.error("Error loading admin config:", error);
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
    return () => {
      unsubscribeActivities?.();
      unsubscribeQR?.();
    };
  }, []);

  const addActivity = async (activity: Activity) => {
    setIsLoading(true);
    try {
      await firebaseService.addActivity(activity);
      toast.success("✅ Thêm hoạt động thành công!");
      setActiveTab("list");
    } catch {
      toast.error("Lỗi khi thêm hoạt động. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (updatedActivity: Activity) => {
    setIsLoading(true);
    try {
      await firebaseService.updateActivity(updatedActivity.id, updatedActivity);
      toast.success("🔄 Cập nhật thành công!");
    } catch {
      toast.error("Lỗi khi cập nhật. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    setIsLoading(true);
    try {
      await firebaseService.deleteActivity(id);
      toast.success("🗑️ Xóa thành công!");
    } catch {
      toast.error("Lỗi khi xóa. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const markAllPaidForPerson = async (personName: string) => {
    setIsLoading(true);
    try {
      const toUpdate = activities.filter((a) =>
        a.participants.some((p) => p.name === personName && !p.paid),
      );
      for (const activity of toUpdate) {
        await firebaseService.updateActivity(activity.id, {
          ...activity,
          participants: activity.participants.map((p) =>
            p.name === personName ? { ...p, paid: true } : p,
          ),
        });
      }
      toast.success(
        `✅ Đã đánh dấu tất cả khoản nợ của ${personName} là đã thanh toán!`,
      );
    } catch {
      toast.error("Lỗi khi cập nhật. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllActivities = async () => {
    setIsLoading(true);
    try {
      for (const activity of activities)
        await firebaseService.deleteActivity(activity.id);
      toast.success("🗑️ Đã xóa tất cả hoạt động!");
    } catch {
      toast.error("Lỗi khi xóa. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentQR = async (qr: PaymentQR) => {
    setIsLoading(true);
    try {
      await firebaseService.savePaymentQR(qr);
      toast.success("💾 Lưu QR code thành công!");
    } catch {
      toast.error("Lỗi khi lưu QR code. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (pin: string) => {
    if (!adminConfig) {
      try {
        setIsLoading(true);
        const hashedPin = await hashPin(pin);
        const newConfig: AdminConfig = {
          pin: hashedPin,
          name: adminName || "Admin",
        };
        await firebaseService.saveAdminConfig(newConfig);
        setAdminConfig(newConfig);
        setIsAdmin(true);
        setShowAuthModal(false);
        setAdminName(newConfig.name);
        toast.success(`🎉 Chào mừng ${newConfig.name}! Tài khoản đã được tạo.`);
      } catch {
        toast.error("Lỗi khi tạo tài khoản!");
      } finally {
        setIsLoading(false);
      }
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
          toast.success(
            `👋 Chào ${adminConfig.name}! (PIN đã được nâng cấp bảo mật)`,
          );
        } else if (isValid) {
          toast.success(`👋 Chào ${adminConfig.name}!`);
        } else {
          toast.error("❌ Mã PIN không chính xác!");
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

  const handleViewerMode = () => {
    setIsAdmin(false);
    setShowAuthModal(false);
    setAdminName("");
  };
  const handleLogout = () => {
    setIsAdmin(false);
    setShowAuthModal(true);
    setAdminName("");
    setActiveTab("overview");
  };

  const getAllParticipants = (): string[] => {
    const s = new Set<string>();
    activities.forEach((a) => a.participants.forEach((p) => s.add(p.name)));
    return Array.from(s).sort();
  };

  const pendingCount = activities.reduce(
    (n, a) => n + a.participants.filter((p) => !p.paid).length,
    0,
  );

  const TAB_META: Record<
    typeof activeTab,
    { title: string; subtitle: string }
  > = {
    overview: {
      title: "Tổng quan",
      subtitle: "Bức tranh chi tiêu & công nợ của cả nhóm",
    },
    list: {
      title: "Hoạt động",
      subtitle: "Tất cả các khoản chi tiêu của nhóm",
    },
    summary: {
      title: "Công nợ",
      subtitle: "Theo dõi chi tiết các khoản phải thu",
    },
    qr: {
      title: isAdmin ? "Quản lý QR Code" : "Thông tin thanh toán",
      subtitle: isAdmin
        ? "Cập nhật thông tin chuyển khoản"
        : "Quét mã hoặc chuyển khoản",
    },
  };
  const meta = TAB_META[activeTab];

  return (
    <>
      {/* Animated mesh background */}
      <div className="app-bg" aria-hidden>
        <div
          className="blob"
          style={{
            width: "42vw",
            height: "42vw",
            top: "-8vh",
            left: "-6vw",
            background: "oklch(0.62 0.20 280)",
          }}
        />
        <div
          className="blob"
          style={{
            width: "36vw",
            height: "36vw",
            top: "-4vh",
            right: "-8vw",
            left: "auto",
            background: "oklch(0.64 0.18 320)",
            animationDelay: "-7s",
          }}
        />
        <div
          className="blob"
          style={{
            width: "40vw",
            height: "40vw",
            bottom: "-10vh",
            right: "4vw",
            left: "auto",
            background: "oklch(0.66 0.15 210)",
            animationDelay: "-13s",
          }}
        />
        <div
          className="blob"
          style={{
            width: "30vw",
            height: "30vw",
            bottom: "-6vh",
            left: "-4vw",
            background: "oklch(0.66 0.17 350)",
            animationDelay: "-3s",
          }}
        />
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e1b3a",
            color: "#fff",
            borderRadius: "16px",
            padding: "16px",
            fontWeight: "600",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
        }}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl shadow-2xl flex items-center gap-3 border border-border">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm font-semibold">Đang xử lý...</span>
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

      <TopBar
        isAdmin={isAdmin}
        adminName={adminName}
        isConnected={isConnected}
        activities={activities}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={handleGlobalSearch}
        onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <QuickSplitWidget
        open={showQuickSplit}
        onClose={() => setShowQuickSplit(false)}
        onAdd={addActivity}
        existingParticipants={getAllParticipants()}
      />

      <NavDock
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
        isAdmin={isAdmin}
        onQuickAdd={() => setShowQuickSplit(true)}
        activitiesCount={activities.length}
        pendingCount={pendingCount}
      />

      {/* Main content — centered floating column */}
      <main className="min-h-screen pt-20 pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Page heading */}
          <div className="mb-5 sm:mb-7">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {meta.title}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {meta.subtitle}
            </p>
          </div>

          <div key={activeTab} className="animate-rise">
            {activeTab === "overview" && (
              <Overview
                activities={activities}
                isAdmin={isAdmin}
                onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
                onQuickAdd={() => setShowQuickSplit(true)}
              />
            )}

            {activeTab === "list" && (
              <>
                <SearchFilter
                  activities={activities}
                  onFilteredResults={setFilteredActivities}
                  searchTerm={searchQuery}
                  onSearchTermChange={setSearchQuery}
                />
                <ActivityList
                  activities={filteredActivities}
                  onUpdate={updateActivity}
                  onDelete={deleteActivity}
                  onDeleteAll={deleteAllActivities}
                  paymentQR={paymentQR}
                  isAdmin={isAdmin}
                />
              </>
            )}

            {activeTab === "summary" && (
              <DebtSummary
                activities={activities}
                onMarkAllPaid={markAllPaidForPerson}
                onUpdate={updateActivity}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "qr" && (
              <div className="max-w-2xl mx-auto bg-card/70 backdrop-blur rounded-3xl border border-border/60 card-float p-5 sm:p-7">
                <QRCodeManager
                  paymentQR={paymentQR}
                  onUpdate={updatePaymentQR}
                  isAdmin={isAdmin}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
