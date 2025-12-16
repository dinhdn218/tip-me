# 🔥 Hướng dẫn cấu hình Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Tạo dự án"**
3. Đặt tên project: `tip-me` (hoặc tên bạn muốn)
4. Tắt Google Analytics (không bắt buộc)
5. Click **"Create project"**

## Bước 2: Tạo Web App

1. Trong Firebase Console, click vào icon **Web** (`</>`)
2. Đặt tên app: `Chia Tiền Nhóm`
3. **KHÔNG** chọn Firebase Hosting
4. Click **"Register app"**
5. Copy toàn bộ config object

## Bước 3: Cấu hình Firestore Database

1. Trong menu bên trái, chọn **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (cho development)
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)
5. Click **"Enable"**

### Rules cho Firestore (Test Mode):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ CHÚ Ý**: Đây là rules cho test, cho phép mọi người đọc/ghi. Sau này cần thêm authentication để bảo mật!

## Bước 4: Lấy Firebase Config

Quay lại **Project Overview > Project Settings**

Trong phần **"Your apps"**, bạn sẽ thấy config như sau:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tip-me-xxxxx.firebaseapp.com",
  projectId: "tip-me-xxxxx",
  storageBucket: "tip-me-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx",
};
```

## Bước 5: Cập nhật .env.local

Mở file `.env.local` và điền các giá trị:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tip-me-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tip-me-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tip-me-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx
```

## Bước 6: Khởi động ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`

## ✅ Kiểm tra kết nối

- Nếu thấy **"Đã kết nối - Dữ liệu realtime"** màu xanh → Thành công! 🎉
- Nếu thấy **"Mất kết nối"** màu đỏ → Kiểm tra lại config

## 🧪 Test thử

1. Thêm một hoạt động mới
2. Mở tab mới cùng URL → Sẽ thấy hoạt động vừa thêm
3. Cập nhật từ tab 1 → Tab 2 tự động cập nhật (realtime!)

## 📱 Chia sẻ với người khác

- Deploy app lên Vercel/Netlify
- Hoặc chia sẻ URL local qua ngrok
- Mọi người truy cập cùng URL sẽ thấy dữ liệu giống nhau

## 🔒 Bảo mật (Production)

Sau khi test xong, nên:

1. Thêm Firebase Authentication
2. Cập nhật Firestore Rules để kiểm soát quyền truy cập
3. Tạo nhóm/phòng riêng cho mỗi nhóm bạn

## ❓ Troubleshooting

### Lỗi: "Firebase: Error (auth/...)"

→ Kiểm tra lại API Key và các biến môi trường

### Lỗi: "Missing or insufficient permissions"

→ Kiểm tra Firestore Rules đã set thành test mode chưa

### Dữ liệu không sync

→ Kiểm tra Network tab, xem có lỗi kết nối Firebase không
→ Refresh trang và kiểm tra lại

## 📚 Tài liệu tham khảo

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Get Started](https://firebase.google.com/docs/firestore/quickstart)
