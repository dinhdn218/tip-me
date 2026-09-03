/**
 * lib/identity.ts — "tôi là ai", lưu trên máy, luôn tùy chọn.
 * Không đồng bộ Firestore: đây là lựa chọn của thiết bị, không phải dữ liệu nhóm.
 */

const KEY = 'so-chung:me';

export function getMe(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
}

export function setMe(name: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (name) window.localStorage.setItem(KEY, name);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* private mode: bỏ qua, app vẫn chạy đủ chức năng */
  }
}

/**
 * Đọc trong useEffect, KHÔNG đọc khi render lần đầu — nếu đọc lúc render
 * server/client sẽ khác nhau và gây hydration warning.
 *
 *   const [me, setMeState] = useState<string | null>(null);
 *   useEffect(() => { setMeState(getMe()); }, []);
 */
