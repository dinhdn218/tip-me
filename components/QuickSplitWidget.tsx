"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  Equal,
  Percent,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";
import {
  Activity,
  ActivityCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/types";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SplitMode = "equal" | "percentage" | "exact";

interface ParticipantEntry {
  name: string;
  share: number; // % or exact amount depending on mode
}

interface QuickSplitWidgetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (activity: Activity) => void;
  existingParticipants: string[];
}

const CATEGORIES: ActivityCategory[] = [
  "dining",
  "travel",
  "bills",
  "entertainment",
  "groceries",
  "other",
];

export default function QuickSplitWidget({
  open,
  onClose,
  onAdd,
  existingParticipants,
}: QuickSplitWidgetProps) {
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("dining");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
  const [newName, setNewName] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setTitle("");
      setTotalAmount("");
      setCategory("dining");
      setSplitMode("equal");
      setParticipants([]);
      setNewName("");
    }
  }, [open]);

  const total = parseFloat(totalAmount) || 0;
  const count = participants.length;

  // Live preview calculation
  const preview = (): { name: string; owes: number }[] => {
    if (count === 0 || total === 0) return [];
    if (splitMode === "equal") {
      const each = total / count;
      return participants.map((p) => ({ name: p.name, owes: each }));
    }
    if (splitMode === "percentage") {
      const sumPct = participants.reduce((s, p) => s + p.share, 0);
      return participants.map((p) => ({
        name: p.name,
        owes: sumPct > 0 ? (p.share / sumPct) * total : 0,
      }));
    }
    // exact
    return participants.map((p) => ({ name: p.name, owes: p.share }));
  };

  const livePreview = preview();

  const shareSum = participants.reduce((s, p) => s + p.share, 0);
  const exactValid = splitMode !== "exact" || Math.abs(shareSum - total) < 0.5;
  const pctValid = splitMode !== "percentage" || Math.abs(shareSum - 100) < 0.1;
  const canSubmit =
    title.trim() && total > 0 && count >= 2 && exactValid && pctValid;

  const addParticipant = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || participants.some((p) => p.name === trimmed)) return;
    setParticipants((prev) => [
      ...prev,
      {
        name: trimmed,
        share:
          splitMode === "percentage" ? Math.round(100 / (prev.length + 1)) : 0,
      },
    ]);
    setNewName("");
  };

  const removeParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p.name !== name));
  };

  const updateShare = (name: string, value: string) => {
    const num = parseFloat(value) || 0;
    setParticipants((prev) =>
      prev.map((p) => (p.name === name ? { ...p, share: num } : p)),
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const pv = livePreview;
    const amountPerPerson =
      splitMode === "equal" ? total / count : total / count; // for display fallback

    const activity: Activity = {
      id: Date.now().toString(),
      title: title.trim(),
      totalAmount: total,
      amountPerPerson: pv.length > 0 ? total / pv.length : total / count,
      date: new Date().toISOString(),
      category,
      participants: participants.map((p) => {
        const found = pv.find((x) => x.name === p.name);
        return {
          name: p.name,
          paid: false,
          shareAmount: found?.owes ?? amountPerPerson,
        };
      }),
    };
    onAdd(activity);
    onClose();
  };

  const fmt = (n: number) =>
    n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Thêm nhanh chi phí
              </p>
              <p className="text-[11px] text-muted-foreground">
                Chia bill thông minh
              </p>
            </div>
          </div>
          <SheetClose
            render={
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            }
          />
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Title */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Tên hoạt động
            </Label>
            <Input
              placeholder="VD: Ăn tối nhóm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Amount */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Tổng số tiền (đ)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="pl-8 h-9"
                min={0}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Danh mục
            </Label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:border-border",
                  )}
                >
                  <span role="img" aria-hidden>
                    {CATEGORY_ICONS[cat]}
                  </span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Split mode */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Cách chia
            </Label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-xl">
              {(
                [
                  {
                    mode: "equal" as SplitMode,
                    icon: Equal,
                    label: "Đều nhau",
                  },
                  {
                    mode: "percentage" as SplitMode,
                    icon: Percent,
                    label: "Theo %",
                  },
                  {
                    mode: "exact" as SplitMode,
                    icon: DollarSign,
                    label: "Chính xác",
                  },
                ] as const
              ).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setSplitMode(mode)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 rounded-lg text-[11px] font-semibold transition-all",
                    splitMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Người tham gia ({count})
            </Label>

            {/* Add participant */}
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Tên người tham gia"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addParticipant(newName)}
                className="h-8 text-sm flex-1"
                list="participant-suggestions"
              />
              <datalist id="participant-suggestions">
                {existingParticipants
                  .filter((n) => !participants.some((p) => p.name === n))
                  .map((n) => (
                    <option key={n} value={n} />
                  ))}
              </datalist>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParticipant(newName)}
                className="h-8 px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Participant list */}
            <div className="space-y-1.5">
              {participants.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">
                    {p.name}
                  </span>
                  {splitMode !== "equal" && (
                    <Input
                      type="number"
                      value={p.share || ""}
                      onChange={(e) => updateShare(p.name, e.target.value)}
                      className="w-20 h-7 text-xs text-right"
                      placeholder={splitMode === "percentage" ? "%" : "đ"}
                      min={0}
                    />
                  )}
                  <button
                    onClick={() => removeParticipant(p.name)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    aria-label={`Xóa ${p.name}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Validation hint */}
            {splitMode === "percentage" && count > 0 && (
              <p
                className={cn(
                  "text-[11px] mt-1.5",
                  Math.abs(shareSum - 100) < 0.1
                    ? "text-emerald-600"
                    : "text-orange-500",
                )}
              >
                Tổng %: {shareSum.toFixed(1)}%{" "}
                {Math.abs(shareSum - 100) < 0.1 ? "✓" : "(cần đủ 100%)"}
              </p>
            )}
            {splitMode === "exact" && count > 0 && total > 0 && (
              <p
                className={cn(
                  "text-[11px] mt-1.5",
                  Math.abs(shareSum - total) < 0.5
                    ? "text-emerald-600"
                    : "text-orange-500",
                )}
              >
                Tổng: {fmt(shareSum)}đ / {fmt(total)}đ{" "}
                {Math.abs(shareSum - total) < 0.5 ? "✓" : "(chưa khớp)"}
              </p>
            )}
          </div>

          {/* Live preview */}
          {livePreview.length > 0 && (
            <div className="bg-muted/40 rounded-xl p-3 border border-border/60">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Xem trước phân chia
              </p>
              <div className="space-y-1.5">
                {livePreview.map(({ name, owes }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{name}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {fmt(owes)}đ
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <Button
            className="w-full gap-2 font-semibold"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <Zap className="w-4 h-4" />
            Thêm chi phí
            {total > 0 && ` — ${fmt(total)}đ`}
          </Button>
          {count < 2 && (
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Cần ít nhất 2 người tham gia
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
