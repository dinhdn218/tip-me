# 🚀 HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT GUIDE)

## 📋 TỔNG QUAN

Ứng dụng **Chia Tiền Nhóm** đã sẵn sàng để triển khai lên production. Dưới đây là các bước chi tiết để deploy.

---

## 🛠️ YÊU CẦU HỆ THỐNG

### Development:

- Node.js 18+ hoặc 20+
- npm hoặc yarn
- Git

### Production:

- Firebase Project (đã có)
- Vercel/Netlify account (khuyến nghị Vercel)
- Domain (tùy chọn)

---

## 📦 CÀI ĐẶT DỰ ÁN

```bash
# Clone repository
git clone [YOUR_REPO_URL]
cd tip-me

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Điền thông tin Firebase vào .env.local
# (Đã có sẵn trong file hiện tại)
```

---

## 🔥 CẤU HÌNH FIREBASE

### 1. Firestore Database

#### Tạo Collections:

```
- activities (collection)
  - [document_id] (auto-generated)
    - id: string
    - title: string
    - totalAmount: number
    - amountPerPerson: number
    - participants: array
      - name: string
      - paid: boolean
    - date: string (ISO 8601)

- settings (collection)
  - payment-qr (document)
    - imageUrl: string
    - bankName: string
    - accountNumber: string
    - accountName: string

  - admin-config (document)
    - pin: string
    - name: string
```

#### Firestore Rules (QUAN TRỌNG):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Activities collection
    match /activities/{document} {
      // Cho phép đọc cho tất cả
      allow read: if true;

      // Chỉ cho phép ghi khi có authentication
      // (Tùy chỉnh theo nhu cầu bảo mật)
      allow write: if true; // TODO: Thêm auth check
    }

    // Settings collection
    match /settings/{document} {
      // Cho phép đọc cho tất cả
      allow read: if true;

      // Chỉ admin mới được ghi
      allow write: if true; // TODO: Thêm admin check
    }
  }
}
```

**⚠️ LƯU Ý:** Rules hiện tại cho phép tất cả đọc/ghi. Trong production, nên:

1. Bật Firebase Authentication
2. Thêm auth check vào rules
3. Chỉ cho phép authenticated users ghi dữ liệu

### 2. Firebase Storage (Nếu cần upload QR code)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /qr-codes/{fileName} {
      allow read: if true;
      allow write: if request.auth != null; // Chỉ authenticated users
    }
  }
}
```

---

## 🌐 DEPLOY LÊN VERCEL (KHUYẾN NGHỊ)

### Bước 1: Chuẩn bị

```bash
# Đảm bảo code đã commit
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Bước 2: Deploy

1. **Truy cập:** https://vercel.com
2. **Đăng nhập** với GitHub/GitLab/Bitbucket
3. **Import Project:**

   - Click "Add New Project"
   - Chọn repository `tip-me`
   - Click "Import"

4. **Cấu hình:**

   - **Framework Preset:** Next.js (auto-detect)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   Thêm các biến từ `.env.local`:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

6. **Deploy:**
   - Click "Deploy"
   - Đợi 2-3 phút
   - ✅ Xong!

### Bước 3: Custom Domain (Tùy chọn)

```
Settings → Domains → Add Domain
→ Nhập domain của bạn
→ Cấu hình DNS theo hướng dẫn
```

---

## 🏗️ DEPLOY LÊN NETLIFY

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Hoặc kết nối với Git
# Settings → Build & Deploy → Configure
```

---

## 🐳 DEPLOY VỚI DOCKER (Advanced)

### Tạo `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Build & Run:

```bash
# Build
docker build -t tip-me .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  # ... thêm các env vars khác
  tip-me
```

---

## 🔒 BẢO MẬT PRODUCTION

### 1. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/settings/admin-config).data.pin == request.auth.token.pin;
    }

    match /activities/{document} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /settings/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### 2. Environment Variables

**⚠️ QUAN TRỌNG:**

- KHÔNG commit `.env.local` lên Git
- Thêm vào `.gitignore`
- Sử dụng Vercel/Netlify env vars

### 3. Rate Limiting

Cài đặt rate limiting để tránh spam:

```bash
npm install express-rate-limit
```

---

## 📊 MONITORING & ANALYTICS

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Firebase Analytics

Đã có sẵn trong Firebase config.

### 3. Error Tracking (Khuyến nghị Sentry)

```bash
npm install @sentry/nextjs
```

---

## 🚀 POST-DEPLOYMENT CHECKLIST

- [ ] **Test trên production URL**
  - Tất cả tính năng hoạt động
  - Realtime sync working
  - Export functions working
- [ ] **Security**
  - Firestore rules đã cập nhật
  - Environment variables đúng
  - HTTPS enabled
- [ ] **Performance**
  - Lighthouse score > 90
  - First Contentful Paint < 2s
  - Time to Interactive < 3s
- [ ] **SEO** (Nếu cần)
  - Meta tags
  - Open Graph
  - Sitemap
- [ ] **Monitoring**
  - Analytics tracking
  - Error tracking
  - Uptime monitoring

---

## 📱 PWA (Progressive Web App) - Tùy chọn

### Cài đặt PWA:

```bash
npm install next-pwa
```

### Cấu hình `next.config.ts`:

```typescript
import withPWA from "next-pwa";

const config = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);

export default config;
```

### Tạo `public/manifest.json`:

```json
{
  "name": "Chia Tiền Nhóm",
  "short_name": "Tip Me",
  "description": "Quản lý chi phí nhóm thông minh",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔧 TROUBLESHOOTING

### Build Errors:

```bash
# Clear cache
rm -rf .next
npm run build

# Kiểm tra dependencies
npm audit fix
```

### Firebase Connection Issues:

1. Kiểm tra env vars
2. Verify Firebase project active
3. Check Firestore rules
4. Inspect Network tab

### Deployment Failed:

1. Check build logs
2. Verify Node version
3. Check environment variables
4. Test locally: `npm run build && npm start`

---

## 📞 HỖ TRỢ & TÀI LIỆU

- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🎉 HOÀN THÀNH!

Ứng dụng đã sẵn sàng serve hàng ngàn users!

**Production URL:** https://your-app.vercel.app

**Chúc mừng! 🚀**
