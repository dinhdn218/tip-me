"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { money, signed } from "@/lib/ledgerSelectors";

gsap.registerPlugin(useGSAP);

interface MoneyProps {
  value: number;
  /** 'out' thêm dấu −, 'in' thêm dấu +, bỏ trống thì không dấu */
  direction?: "out" | "in";
  /** Đếm số khi giá trị realtime đổi — chỉ dùng cho con số chủ đạo */
  animate?: boolean;
  className?: string;
}

/**
 * Mọi con số tiền đi qua đây: mono + tabular-nums (class .tnum trong globals.css)
 * nên các cột tiền luôn thẳng hàng.
 */
export default function Money({
  value,
  direction,
  animate = false,
  className,
}: MoneyProps) {
  const el = useRef<HTMLSpanElement>(null);
  const counter = useRef({ n: value });
  const reduced = useReducedMotion();

  const render = (n: number) =>
    direction ? signed(n, direction) : money(n);

  useGSAP(
    () => {
      if (!animate || reduced || !el.current) return;
      gsap.to(counter.current, {
        n: value,
        duration: 0.4,
        ease: "power2.out",
        onUpdate() {
          if (el.current) el.current.textContent = render(counter.current.n);
        },
      });
    },
    { dependencies: [value, animate, reduced] },
  );

  return (
    <span ref={el} className={cn("tnum", className)}>
      {render(value)}
    </span>
  );
}
