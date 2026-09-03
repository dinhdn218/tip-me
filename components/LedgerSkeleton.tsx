"use client";

/**
 * Skeleton giữ ĐÚNG khung dòng của sổ nên không nhảy layout khi Firestore trả
 * dữ liệu. Không spinner, không chữ xám giữa màn.
 */
export default function LedgerSkeleton() {
  const block = "bg-paper-2 rounded-[2px]";

  return (
    <div aria-hidden className="animate-pulse">
      <div className="px-5 pt-[22px] pb-5">
        <div className={`${block} h-[13px] w-[42%]`} />
        <div className={`${block} h-[42px] w-[74%] mt-3.5`} />
        <div className={`${block} h-[15px] w-[56%] mt-3`} />
        <div className={`${block} h-[52px] w-full mt-4`} />
      </div>

      <div className="grid grid-cols-3 bg-paper-2 border-y border-rule-strong">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-3 py-3.5 border-r border-rule last:border-r-0">
            <div className="bg-rule rounded-[2px] h-[10px] w-[70%]" />
            <div className="bg-rule rounded-[2px] h-[15px] w-[85%] mt-[7px]" />
          </div>
        ))}
      </div>

      <div className="px-5 pt-[18px] pb-1">
        <div className={`${block} h-[11px] w-[26%]`} />
      </div>
      <div className="px-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[32px_minmax(0,1fr)_96px] items-center gap-3
                       py-[13px] min-h-14 border-b border-rule"
          >
            <div className={`${block} w-8 h-8`} />
            <div>
              <div className={`${block} h-[15px] w-[48%]`} />
              <div className={`${block} h-[11px] w-[34%] mt-2`} />
            </div>
            <div className={`${block} h-[17px] w-full`} />
          </div>
        ))}
      </div>
    </div>
  );
}
