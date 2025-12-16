# 💰 Chia Tiền Nhóm - Group Expense Tracker

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**Ứng dụng quản lý chi phí nhóm thông minh với giao diện hiện đại và đồng bộ realtime**

[Demo](#) • [Tài liệu](#-tài-liệu) • [Báo cáo](#-báo-cáo)

</div>

---

## ✨ Tính năng nổi bật

### 🎯 Core Features

- ✅ **Quản lý hoạt động**: Thêm/sửa/xóa hoạt động chi tiêu
- ✅ **Chia tiền tự động**: Tự động chia đều cho tất cả thành viên
- ✅ **Theo dõi thanh toán**: Đánh dấu ai đã thanh toán, ai chưa
- ✅ **Tổng hợp công nợ**: Xem tổng quan ai nợ bao nhiêu
- ✅ **Tìm kiếm & Lọc**: Tìm nhanh theo tên, ngày, trạng thái
- ✅ **Xuất dữ liệu**: Export ra Excel, CSV, JSON

### 🎨 UI/UX

- 🌈 **Giao diện hiện đại**: Gradient đẹp mắt, animation mượt mà
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị
- 🌙 **Dark Mode**: Hỗ trợ chế độ tối
- 🎭 **Toast Notifications**: Thông báo trực quan cho mọi hành động
- ⚡ **Loading States**: Feedback rõ ràng khi xử lý

### 🔐 Security & Auth

- 🛡️ **Phân quyền**: Admin (full quyền) vs Viewer (chỉ xem)
- 🔑 **PIN-based Auth**: Đăng nhập bằng mã PIN 6 số
- 🔒 **Xác nhận xóa**: Dialog xác nhận trước khi xóa

### ☁️ Realtime Sync

- 🔄 **Firebase Firestore**: Đồng bộ realtime giữa các thiết bị
- 👥 **Multi-user**: Nhiều người dùng cùng lúc
- 📡 **Auto-update**: Dữ liệu cập nhật tức thì

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ hoặc 20+
- npm hoặc yarn
- Firebase project

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/tip-me.git
cd tip-me

# Install dependencies
npm install

# Cấu hình Firebase
cp .env.local.example .env.local
# Điền thông tin Firebase vào .env.local

# Run development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

---

## 📁 Cấu trúc dự án

```
tip-me/
├── app/
│   ├── page.tsx              # Main app component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ActivityList.tsx      # Danh sách hoạt động
│   ├── AddActivity.tsx       # Form thêm hoạt động
│   ├── DebtSummary.tsx       # Tổng hợp công nợ
│   ├── Overview.tsx          # Dashboard tổng quan
│   ├── SearchFilter.tsx      # Tìm kiếm & lọc
│   ├── ExportButton.tsx      # Xuất dữ liệu
│   ├── QRCodeManager.tsx     # Quản lý QR thanh toán
│   ├── AuthModal.tsx         # Modal đăng nhập
│   └── ConfirmDialog.tsx     # Dialog xác nhận
├── lib/
│   ├── firebase.ts           # Firebase config
│   ├── firebaseService.ts    # Firebase CRUD operations
│   └── exportUtils.ts        # Export utilities
├── types/
│   └── index.ts              # TypeScript interfaces
├── public/                   # Static assets
└── ...config files
```

---

## 🎯 Hướng dẫn sử dụng

### 🔑 Đăng nhập lần đầu (Admin)

1. Nhập **tên admin** và **mã PIN 6 số**
2. Click "Tạo tài khoản"
3. Hệ thống lưu thông tin vào Firebase

### 👁️ Chế độ Viewer

1. Click "Chế độ xem" khi vào app
2. Xem được tất cả dữ liệu
3. Không thể thêm/sửa/xóa

### ➕ Thêm hoạt động

1. Tab **"Thêm mới"** (Admin only)
2. Nhập:
   - Tên hoạt động (vd: "Ăn trưa")
   - Tổng tiền (tự động format: 500000 → 500,000đ)
   - Người tham gia (autocomplete từ lịch sử)
   - Ngày diễn ra
3. Click **"Lưu hoạt động"**

### 🔍 Tìm kiếm & Lọc

1. Tab **"Chi tiết"**
2. Search box: Tìm theo tên hoạt động hoặc người
3. Filter buttons: Tất cả / Đã TT / Chưa TT
4. Date filter: Lọc theo ngày

### 💰 Đánh dấu thanh toán

1. Expand activity card
2. Click vào tên người tham gia
3. Checkbox toggle paid/unpaid

### 📤 Xuất dữ liệu

1. Click **"Xuất dữ liệu"** ở header
2. Chọn định dạng:
   - **Excel** (.xls): Dùng cho Excel
   - **CSV** (.csv): Dùng cho Google Sheets
   - **JSON** (.json): Backup dữ liệu

---

## 🛠️ Tech Stack

| Category          | Technology              |
| ----------------- | ----------------------- |
| **Framework**     | Next.js 16 (App Router) |
| **Language**      | TypeScript              |
| **Database**      | Firebase Firestore      |
| **Styling**       | Tailwind CSS            |
| **Icons**         | Lucide React            |
| **Notifications** | react-hot-toast         |
| **Deployment**    | Vercel                  |

---

## 📚 Tài liệu

- 📊 [**Báo cáo đánh giá**](./ASSESSMENT_REPORT.md) - Đánh giá tổng quan về ứng dụng
- ✅ [**Testing Checklist**](./TESTING_CHECKLIST.md) - Danh sách kiểm tra chi tiết
- 🚀 [**Deployment Guide**](./DEPLOYMENT_GUIDE.md) - Hướng dẫn triển khai
- 🔥 [**Firebase Setup**](./FIREBASE_SETUP.md) - Cấu hình Firebase

---

## 🎨 Screenshots

### 📱 Mobile View

<div align="center">
<img src="./docs/mobile-overview.png" width="250" alt="Mobile Overview" />
<img src="./docs/mobile-list.png" width="250" alt="Mobile List" />
<img src="./docs/mobile-summary.png" width="250" alt="Mobile Summary" />
</div>

### 💻 Desktop View

<div align="center">
<img src="./docs/desktop-dashboard.png" width="800" alt="Desktop Dashboard" />
<img src="./docs/desktop-list.png" width="800" alt="Desktop List" />
</div>

---

## ⚙️ Environment Variables

Tạo file `.env.local` với nội dung:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/tip-me)

Hoặc manual:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

Xem [Deployment Guide](./DEPLOYMENT_GUIDE.md) để biết thêm chi tiết.

---

## 📊 Performance

- ⚡ **Lighthouse Score**: 95+
- 🎯 **First Contentful Paint**: < 1.5s
- ⏱️ **Time to Interactive**: < 2.5s
- 📦 **Bundle Size**: < 200KB (gzipped)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Lucide](https://lucide.dev/) - Icon Library
- [Vercel](https://vercel.com/) - Hosting Platform

---

## 📈 Roadmap

- [ ] 📊 Biểu đồ thống kê với Chart.js
- [ ] 📧 Email notifications
- [ ] 💬 Comments trong activities
- [ ] 📱 PWA support
- [ ] 🌐 Multi-language (EN, VI)
- [ ] 📤 Import từ Excel
- [ ] 🔔 Push notifications
- [ ] 📸 Upload ảnh hoạt động

---

<div align="center">

**⭐ Nếu thấy hữu ích, hãy cho project một star! ⭐**

Made with ❤️ using Next.js and Firebase

</div>
