/**
 * lib/useReducedMotion.ts
 * Một nơi duy nhất tắt mọi chuyển động: CSS đã có @media trong globals.css,
 * hook này lo phần GSAP.
 */
'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = () => {
      setReduced(mq.matches);
      // 0 = đứng yên hoàn toàn; 1 = bình thường
      gsap.globalTimeline.timeScale(mq.matches ? 0 : 1);
    };

    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return reduced;
}

/**
 * Dùng trong component có animation:
 *
 *   const reduced = useReducedMotion();
 *   useGSAP(() => {
 *     if (reduced) return;                 // không set transform ban đầu
 *     gsap.from(el.current, { y: 8, opacity: 0, duration: 0.22 });
 *   }, [reduced]);
 *
 * Ba chỗ duy nhất được phép animate:
 *   1. Sheet trượt lên            220ms  cubic-bezier(.2,.8,.2,1)
 *   2. Số tiền đếm khi realtime đổi 400ms  power2.out
 *   3. Con dấu "ĐÃ TRẢ" dập xuống  180ms  scale + rotate nhẹ
 */
