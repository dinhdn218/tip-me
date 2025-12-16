# 🚀 Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị

1. Tạo tài khoản tại [Vercel](https://vercel.com) (dùng GitHub account)
2. Cài đặt Vercel CLI (tùy chọn):

```bash
npm install -g vercel
```

## Bước 2: Deploy qua Vercel Dashboard (Khuyến nghị)

### Cách 1: Import từ Git Repository

1. Push code lên GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

2. Truy cập [Vercel Dashboard](https://vercel.com/new)
3. Click "Add New Project"
4. Import repository GitHub của bạn
5. Vercel sẽ tự động phát hiện Next.js project

### Cách 2: Deploy trực tiếp từ máy

```bash
# Trong thư mục tip-me
vercel
```

## Bước 3: Cấu hình Environment Variables

Trong Vercel Dashboard > Project Settings > Environment Variables, thêm:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAi45IndJWPCdSh3QqcUbxZ_gWzPdo5YWQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tip-me-752cd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tip-me-752cd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tip-me-752cd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=637319052872
NEXT_PUBLIC_FIREBASE_APP_ID=1:637319052872:web:fb11f7e40ea62bbf23227d
```

**Lưu ý:** Set cho cả 3 môi trường: Production, Preview, Development

## Bước 4: Deploy

1. Click "Deploy" trong Vercel Dashboard
2. Đợi khoảng 1-2 phút
3. Nhận link production: `https://your-app.vercel.app`

## Bước 5: Cấu hình Firebase (Quan trọng!)

Sau khi có domain Vercel, cập nhật Firebase Console:

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Chọn project "tip-me-752cd"
3. Vào **Authentication** > **Settings** > **Authorized domains**
4. Thêm domain Vercel của bạn: `your-app.vercel.app`

## Deploy tự động

Sau khi setup xong, mỗi khi push code lên GitHub:

- **master/main branch** → Deploy Production tự động
- **Branches khác** → Tạo Preview deployment

## Kiểm tra deployment

```bash
# Xem logs
vercel logs

# Xem danh sách deployments
vercel ls
```

## Custom Domain (Tùy chọn)

1. Trong Vercel Dashboard > Domains
2. Thêm custom domain của bạn
3. Cấu hình DNS records theo hướng dẫn

---

## 🎯 Quick Deploy Command

Nếu đã cài Vercel CLI, chỉ cần chạy:

```bash
vercel --prod
```

Xong! App sẽ live trong vài phút. 🎉
