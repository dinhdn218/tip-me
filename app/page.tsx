"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { Activity, ActivityCategory, PaymentQR, AdminConfig } from "@/types";
import * as firebaseService from "@/lib/firebaseService";
import { hashPin, verifyPin } from "@/lib/securityUtils";
import { getMe, setMe as persistMe } from "@/lib/identity";
import {
  buildLedger,
  filterActivities,
  monthGroups,
  plain,
} from "@/lib/ledgerSelectors";

import AppHeader from "@/components/AppHeader";
import ActionBar from "@/components/ActionBar";
import Ledger from "@/components/Ledger";
import ActivityList from "@/components/ActivityList";
import ActivitySheet from "@/components/ActivitySheet";
import PaySheet from "@/components/PaySheet";
import PersonSheet from "@/components/PersonSheet";
import PinSheet from "@/components/PinSheet";
import NotebookMenu from "@/components/NotebookMenu";
import QuickSplitWidget from "@/components/QuickSplitWidget";
import EmptyLedger from "@/components/EmptyLedger";
import LedgerSkeleton from "@/components/LedgerSkeleton";

type Sheet =
  | null
  | { kind: "pay" }
  | { kind: "activity"; id: string }
  | { kind: "person"; name: string }
  | { kind: "split" }
  | { kind: "pin" }
  | { kind: "menu" };

export default function Home() {
  /* ---- dữ liệu ---------------------------------------------------------- */
  const [activities, setActivities] = useState<Activity[]>([]);
  const [paymentQR, setPaymentQR] = useState<PaymentQR | null>(null);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  /* ---- vai trò & danh tính ---------------------------------------------- */
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [me, setMeState] = useState<string | null>(null);

  /* ---- điều hướng -------------------------------------------------------- */
  const [tab, setTab] = useState<"so" | "hd">("so");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  /* ---- bộ lọc màn Hoạt động ---------------------------------------------- */
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActivityCategory | "all">("all");

  /* ---- khởi tạo ---------------------------------------------------------- */
  // localStorage và class .dark chỉ đọc được sau khi mount: đọc lúc render sẽ
  // lệch giữa server và client và gây hydration warning.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeState(getMe());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  useEffect(() => {
    firebaseService
      .getAdminConfig()
      .then(setAdminConfig)
      .catch((error) => console.error("Error loading admin config:", error));
  }, []);

  useEffect(() => {
    let unsubscribeActivities: (() => void) | undefined;
    let unsubscribeQR: (() => void) | undefined;
    try {
      unsubscribeActivities = firebaseService.subscribeToActivities((data) => {
        setActivities(data);
        setLoaded(true);
      });
      unsubscribeQR = firebaseService.subscribeToPaymentQR(setPaymentQR);
    } catch {
      // Không nối được Firestore → thoát skeleton để hiện sổ trống thay vì treo.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true);
    }
    return () => {
      unsubscribeActivities?.();
      unsubscribeQR?.();
    };
  }, []);

  /* ---- giá trị dẫn xuất — một useMemo, không lưu trùng vào state --------- */
  const payerName = adminConfig?.name ?? adminName ?? "";

  const ledger = useMemo(
    () => buildLedger(activities, payerName, me),
    [activities, payerName, me],
  );

  const groups = useMemo(
    () => monthGroups(filterActivities(activities, { query, category })),
    [activities, query, category],
  );

  const roster = useMemo(() => {
    const s = new Set<string>();
    activities.forEach((a) => a.participants.forEach((p) => s.add(p.name)));
    return Array.from(s).sort();
  }, [activities]);

  /* ---- theme -------------------------------------------------------------- */
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

  /* ---- danh tính ---------------------------------------------------------- */
  const pickMe = (name: string) => {
    persistMe(name);
    setMeState(name);
    toast.success(`Xin chào ${name}`);
  };

  const clearMe = () => {
    persistMe(null);
    setMeState(null);
  };

  /* ---- ghi dữ liệu (giữ nguyên chữ ký & luồng) ---------------------------- */
  const addActivity = async (activity: Activity) => {
    try {
      await firebaseService.addActivity(activity);
      toast.success("Đã ghi vào sổ");
    } catch {
      toast.error("Lỗi khi ghi khoản. Vui lòng thử lại!");
    }
  };

  const updateActivity = async (updated: Activity) => {
    try {
      await firebaseService.updateActivity(updated.id, updated);
    } catch {
      toast.error("Lỗi khi cập nhật. Vui lòng thử lại!");
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await firebaseService.deleteActivity(id);
      toast.success("Đã xóa khoản");
    } catch {
      toast.error("Lỗi khi xóa. Vui lòng thử lại!");
    }
  };

  const togglePaid = (activity: Activity, name: string) =>
    updateActivity({
      ...activity,
      participants: activity.participants.map((p) =>
        p.name === name ? { ...p, paid: !p.paid } : p,
      ),
    });

  const markAllPaidForPerson = async (personName: string) => {
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
      toast.success(`Đã tick tất cả khoản của ${personName}`);
    } catch {
      toast.error("Lỗi khi cập nhật. Vui lòng thử lại!");
    }
  };

  const updatePaymentQR = async (qr: PaymentQR) => {
    try {
      await firebaseService.savePaymentQR(qr);
      toast.success("Đã lưu thông tin chuyển khoản");
    } catch {
      toast.error("Lỗi khi lưu QR. Vui lòng thử lại!");
    }
  };

  /* ---- PIN: hash + tự nâng cấp PIN plaintext cũ (giữ nguyên) -------------- */
  const handleAdminLogin = async (pin: string): Promise<boolean> => {
    if (!adminConfig) {
      try {
        const hashedPin = await hashPin(pin);
        const newConfig: AdminConfig = {
          pin: hashedPin,
          name: adminName.trim() || "Admin",
        };
        await firebaseService.saveAdminConfig(newConfig);
        setAdminConfig(newConfig);
        setIsAdmin(true);
        setAdminName(newConfig.name);
        setSheet(null);
        toast.success(`Chào ${newConfig.name} — sổ đã sẵn sàng`);
        return true;
      } catch {
        toast.error("Lỗi khi tạo tài khoản!");
        return false;
      }
    }

    let isValid = await verifyPin(pin, adminConfig.pin);
    if (!isValid && pin === adminConfig.pin) {
      isValid = true;
      const hashedPin = await hashPin(pin);
      const updatedConfig = { ...adminConfig, pin: hashedPin };
      await firebaseService.saveAdminConfig(updatedConfig);
      setAdminConfig(updatedConfig);
      toast.success(`Chào ${adminConfig.name} (PIN đã được nâng cấp bảo mật)`);
    } else if (isValid) {
      toast.success(`Chào ${adminConfig.name}`);
    }

    if (isValid) {
      setIsAdmin(true);
      setAdminName(adminConfig.name);
      setSheet(null);
    }
    return isValid;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    toast.success("Đã thoát quản trị");
  };

  /* ---- thanh hành động: một nút, nhãn theo trạng thái --------------------- */
  const action: { label: string; onClick: () => void; variant: "primary" | "outline" } =
    isAdmin
      ? {
          label: "+ GHI KHOẢN MỚI",
          onClick: () => setSheet({ kind: "split" }),
          variant: "primary",
        }
      : !me
        ? {
            label: "ĐĂNG NHẬP QUẢN TRỊ",
            onClick: () => setSheet({ kind: "pin" }),
            variant: "outline",
          }
        : ledger.myOwed > 0 && !ledger.iAmPayer
          ? {
              label: `TRẢ ${plain(ledger.myOwed)}đ →`,
              onClick: () => setSheet({ kind: "pay" }),
              variant: "primary",
            }
          : {
              label: "XEM QR CHUYỂN KHOẢN",
              onClick: () => setSheet({ kind: "pay" }),
              variant: "primary",
            };

  const openActivity = (activity: Activity) =>
    setSheet({ kind: "activity", id: activity.id });

  const sheetActivity =
    sheet?.kind === "activity"
      ? (activities.find((a) => a.id === sheet.id) ?? null)
      : null;

  const empty = loaded && activities.length === 0;

  /* ---- các mảnh dùng chung cho cả mobile và desktop ------------------------ */
  const ledgerPane = !loaded ? (
    <LedgerSkeleton />
  ) : empty ? (
    <EmptyLedger isAdmin={isAdmin} onAdd={() => setSheet({ kind: "split" })} />
  ) : (
    <Ledger
      ledger={ledger}
      me={me}
      isAdmin={isAdmin}
      payerName={payerName}
      onPickMe={pickMe}
      onClearMe={clearMe}
      onOpenPerson={(name) => setSheet({ kind: "person", name })}
      onOpenActivity={openActivity}
      onOpenPay={() => setSheet({ kind: "pay" })}
      onGoActivities={() => setTab("hd")}
    />
  );

  const activityPane = (
    <ActivityList
      groups={groups}
      all={activities}
      query={query}
      onQuery={setQuery}
      category={category}
      onCategory={setCategory}
      onOpen={openActivity}
    />
  );

  return (
    <div className="relative z-10 min-h-dvh flex flex-col lg:bg-paper-2">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          style: {
            background: "var(--ink)",
            color: "var(--on-ink)",
            borderRadius: "3px",
            padding: "12px 16px",
            fontSize: "14px",
          },
        }}
      />

      <div className="flex-1 flex flex-col lg:max-w-[1160px] lg:w-full lg:mx-auto lg:bg-paper lg:border-x lg:border-rule-strong">
        <AppHeader
          count={activities.length}
          isAdmin={isAdmin}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMenu={() => setSheet({ kind: "menu" })}
          tab={tab}
          onTab={setTab}
        />

        {/* Mobile / tablet: một cột, đổi bằng segmented control */}
        <main className="flex-1 overflow-y-auto lg:hidden">
          <div className="mx-auto w-full max-w-[560px] border-x border-rule min-h-full">
            {tab === "so" ? ledgerPane : activityPane}
          </div>
        </main>

        {/* Desktop ≥1024px: hai cột cùng lúc, không cần segmented control */}
        <main className="hidden lg:grid flex-1 min-h-0 grid-cols-[560px_1fr]">
          <div className="overflow-y-auto border-r border-rule-strong">
            {ledgerPane}
            {loaded && !empty && (
              <div className="px-5 pb-6">
                <ActionBar
                  label={action.label}
                  onClick={action.onClick}
                  variant={action.variant}
                  inline
                />
              </div>
            )}
          </div>
          <div className="overflow-y-auto">{activityPane}</div>
        </main>
      </div>

      {/* Thanh dưới = HÀNH ĐỘNG, không phải điều hướng. Ẩn ở desktop. */}
      <div className="lg:hidden">
        <ActionBar
          label={action.label}
          onClick={action.onClick}
          variant={action.variant}
        />
      </div>

      {/* ---- Lớp phủ: Sheet cho mọi nội dung ---------------------------- */}
      <PaySheet
        open={sheet?.kind === "pay"}
        onClose={() => setSheet(null)}
        amount={ledger.payTarget}
        payerName={payerName || "người ứng tiền"}
        paymentQR={paymentQR}
      />

      <ActivitySheet
        activity={sheetActivity}
        onClose={() => setSheet(null)}
        onToggle={togglePaid}
        onDelete={deleteActivity}
        onOpenPay={() => setSheet({ kind: "pay" })}
        isAdmin={isAdmin}
        me={me}
      />

      <PersonSheet
        name={sheet?.kind === "person" ? sheet.name : null}
        activities={activities}
        onClose={() => setSheet(null)}
        onOpenActivity={openActivity}
        onOpenPay={() => setSheet({ kind: "pay" })}
        onMarkAllPaid={markAllPaidForPerson}
        me={me}
        isAdmin={isAdmin}
        isPayer={sheet?.kind === "person" && sheet.name === payerName}
      />

      <QuickSplitWidget
        key={sheet?.kind === "split" ? "split-open" : "split-closed"}
        open={sheet?.kind === "split"}
        onClose={() => setSheet(null)}
        onAdd={addActivity}
        existingParticipants={roster}
        payerName={payerName}
      />

      <PinSheet
        key={sheet?.kind === "pin" ? "pin-open" : "pin-closed"}
        open={sheet?.kind === "pin"}
        onClose={() => setSheet(null)}
        onSubmit={handleAdminLogin}
        isFirstTime={!adminConfig}
        adminName={adminName}
        onAdminNameChange={setAdminName}
      />

      <NotebookMenu
        open={sheet?.kind === "menu"}
        onClose={() => setSheet(null)}
        me={me}
        onClearMe={clearMe}
        isAdmin={isAdmin}
        onLogin={() => setSheet({ kind: "pin" })}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        activities={activities}
        paymentQR={paymentQR}
        onUpdateQR={updatePaymentQR}
      />
    </div>
  );
}
