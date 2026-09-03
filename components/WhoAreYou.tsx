"use client";

interface WhoAreYouProps {
  roster: string[];
  onPick: (name: string) => void;
}

/** Dải mảnh "Bạn là ai?" — chỉ hiện khi chưa chọn tên. Một chạm là xong. */
export default function WhoAreYou({ roster, onPick }: WhoAreYouProps) {
  if (roster.length === 0) return null;

  return (
    <div className="px-5 py-3 border-b border-rule bg-paper-2 flex items-center gap-2.5 flex-wrap">
      <span className="font-mono text-eyebrow tracking-[0.1em] text-ink-2">
        BẠN LÀ AI?
      </span>
      {roster.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onPick(name)}
          className="font-mono text-[12px] border border-rule-strong rounded-ctl px-[11px] py-2
                     min-h-9 text-ink hover:border-ink hover:bg-paper transition-colors"
        >
          {name}
        </button>
      ))}
    </div>
  );
}
