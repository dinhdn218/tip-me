"use client";

import { useState, useRef, useEffect } from "react";
import {
  Activity,
  ActivityCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/types";
import {
  UserPlus,
  X,
  CheckCircle,
  Equal,
  Percent,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SplitMode = "equal" | "percentage" | "exact";

interface ParticipantEntry {
  name: string;
  share: number;
}

interface AddActivityProps {
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

const formatCurrency = (value: string) => {
  const n = value.replace(/\D/g, "");
  return n ? new Intl.NumberFormat("vi-VN").format(parseInt(n)) : "";
};
const fmt = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

export default function AddActivity({
  onAdd,
  existingParticipants,
}: AddActivityProps) {
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [category, setCategory] = useState<ActivityCategory>("dining");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const total = parseFloat(totalAmount) || 0;
  const count = participants.length;

  const livePreview = (): { name: string; owes: number }[] => {
    if (count === 0 || total === 0) return [];
    if (splitMode === "equal")
      return participants.map((p) => ({ name: p.name, owes: total / count }));
    if (splitMode === "percentage") {
      const sumPct = participants.reduce((s, p) => s + p.share, 0);
      return participants.map((p) => ({
        name: p.name,
        owes: sumPct > 0 ? (p.share / sumPct) * total : 0,
      }));
    }
    return participants.map((p) => ({ name: p.name, owes: p.share }));
  };

  const preview = livePreview();
  const shareSum = participants.reduce((s, p) => s + p.share, 0);
  const pctValid = splitMode !== "percentage" || Math.abs(shareSum - 100) < 0.1;
  const exactValid = splitMode !== "exact" || Math.abs(shareSum - total) < 1;
  const canSubmit =
    title.trim().length > 0 &&
    total > 0 &&
    count >= 1 &&
    pctValid &&
    exactValid;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "");
    setTotalAmount(numeric);
    setDisplayAmount(formatCurrency(numeric));
  };

  const handleParticipantInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setParticipantInput(value);
    if (value.trim()) {
      const filtered = existingParticipants.filter(
        (name) =>
          name.toLowerCase().includes(value.toLowerCase()) &&
          !participants.some((p) => p.name === name),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };

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
    setParticipantInput("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const removeParticipant = (name: string) =>
    setParticipants((prev) => prev.filter((p) => p.name !== name));

  const updateShare = (name: string, value: string) => {
    const num = parseFloat(value) || 0;
    setParticipants((prev) =>
      prev.map((p) => (p.name === name ? { ...p, share: num } : p)),
    );
  };

  const scrollIntoView = (index: number) => {
    (
      listRef.current?.children[index] as HTMLElement | undefined
    )?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        addParticipant(participantInput);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const n = prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
        scrollIntoView(n);
        return n;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const n = prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
        scrollIntoView(n);
        return n;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      highlightedIndex >= 0
        ? addParticipant(filteredSuggestions[highlightedIndex])
        : addParticipant(participantInput);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const pv = preview;
    const activity: Activity = {
      id: Date.now().toString(),
      title: title.trim(),
      totalAmount: total,
      category,
      date: new Date(selectedDate).toISOString(),
      amountPerPerson: count > 0 ? total / count : total,
      participants: participants.map((p) => {
        const found = pv.find((x) => x.name === p.name);
        return {
          name: p.name,
          paid: false,
          shareAmount: found?.owes ?? total / count,
        };
      }),
    };
    onAdd(activity);
    setTitle("");
    setTotalAmount("");
    setDisplayAmount("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setCategory("dining");
    setSplitMode("equal");
    setParticipants([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2 space-y-1.5">
          <Label
            htmlFor="title"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            Tên hoạt động
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Ăn tối nhóm, Du lịch Đà Lạt..."
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="amount"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            Tổng tiền (VNĐ)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="500,000"
              className="pl-8 h-10 text-base font-semibold"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="date"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1"
          >
            <Calendar className="w-3 h-3" /> Ngày diễn ra
          </Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="h-10"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Danh mục
        </Label>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                category === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-transparent hover:border-border hover:text-foreground",
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
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Cách chia tiền
        </Label>
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted rounded-xl">
          {(
            [
              {
                mode: "equal" as SplitMode,
                icon: Equal,
                label: "Chia đều",
                desc: "Mỗi người trả như nhau",
              },
              {
                mode: "percentage" as SplitMode,
                icon: Percent,
                label: "Theo %",
                desc: "Tự chọn phần trăm",
              },
              {
                mode: "exact" as SplitMode,
                icon: DollarSign,
                label: "Chính xác",
                desc: "Nhập số tiền cụ thể",
              },
            ] as const
          ).map(({ mode, icon: Icon, label, desc }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSplitMode(mode)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-center transition-all",
                splitMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] leading-tight hidden sm:block opacity-70">
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Người tham gia
          {count > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {count}
            </Badge>
          )}
        </Label>
        <div className="flex gap-2">
          <div ref={wrapperRef} className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={participantInput}
              onChange={handleParticipantInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên rồi nhấn Enter..."
              className="h-10"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `suggestion-${highlightedIndex}`
                  : undefined
              }
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={listRef}
                className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-52 overflow-y-auto"
              >
                {filteredSuggestions.map((name, index) => (
                  <button
                    key={name}
                    id={`suggestion-${index}`}
                    type="button"
                    onClick={() => addParticipant(name)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left flex items-center gap-3 border-b border-border last:border-0 transition-colors text-sm",
                      index === highlightedIndex
                        ? "bg-accent"
                        : "hover:bg-accent/60",
                    )}
                  >
                    <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Đã từng tham gia
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addParticipant(participantInput)}
            className="h-10 gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Thêm
          </Button>
        </div>

        {count > 0 && (
          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3 py-2.5 border border-border/60"
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-medium truncate">
                  {p.name}
                </span>
                {splitMode !== "equal" && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Input
                      type="number"
                      value={p.share || ""}
                      onChange={(e) => updateShare(p.name, e.target.value)}
                      placeholder={splitMode === "percentage" ? "%" : "đ"}
                      className="w-24 h-7 text-sm text-right"
                      min={0}
                    />
                    <span className="text-xs text-muted-foreground w-4">
                      {splitMode === "percentage" ? "%" : "đ"}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeParticipant(p.name)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  aria-label={`Xóa ${p.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {splitMode === "percentage" && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  Math.abs(shareSum - 100) < 0.1
                    ? "text-emerald-600"
                    : "text-orange-500",
                )}
              >
                Tổng %: {shareSum.toFixed(1)}%
                {Math.abs(shareSum - 100) < 0.1 ? " ✓" : " — cần đủ 100%"}
              </p>
            )}
            {splitMode === "exact" && total > 0 && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  Math.abs(shareSum - total) < 1
                    ? "text-emerald-600"
                    : "text-orange-500",
                )}
              >
                Tổng: {fmt(shareSum)}đ / {fmt(total)}đ
                {Math.abs(shareSum - total) < 1 ? " ✓" : " — chưa khớp"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Live preview */}
      {preview.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-primary/10 flex items-center justify-between">
            <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
              Xem trước phân chia
            </p>
            <p className="text-xs font-bold text-primary">{fmt(total)}đ</p>
          </div>
          <div className="divide-y divide-primary/10">
            {preview.map(({ name, owes }) => (
              <div
                key={name}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs tabular-nums"
                >
                  {fmt(owes)}đ
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-11 gap-2 font-semibold text-sm"
        disabled={!canSubmit}
      >
        <CheckCircle className="w-4 h-4" />
        Tạo hoạt động{total > 0 && count > 0 && ` — ${fmt(total)}đ`}
      </Button>
    </form>
  );
}
