# ✅ CHECKLIST KIỂM TRA ỨNG DỤNG

## 🔐 1. XÁC THỰC (Authentication)

### Admin Login

- [ ] Lần đầu: Hiển thị form "Tạo tài khoản Admin"
- [ ] Nhập tên admin và PIN 6 số
- [ ] Sau khi tạo: Toast hiển thị "🎉 Chào mừng [Tên]!"
- [ ] Header hiển thị icon Shield và tên admin
- [ ] Hiển thị đầy đủ 5 tabs: Tổng quan, Thêm mới, Chi tiết, Công nợ, QR Code

### Viewer Mode

- [ ] Click "Chế độ xem"
- [ ] Header hiển thị icon Eye và text "Chế độ xem"
- [ ] Chỉ hiển thị 3 tabs: Tổng quan, Chi tiết, Công nợ
- [ ] Không có nút xóa/sửa trong danh sách

### Logout

- [ ] Click nút logout (icon LogOut)
- [ ] Quay về màn hình đăng nhập
- [ ] Xóa thông tin session

---

## 🏠 2. TỔNG QUAN (Overview)

- [ ] Hiển thị 3 card thống kê:
  - Tổng hoạt động
  - Tổng chi tiêu
  - Người tham gia
- [ ] Card có animation khi hover
- [ ] Hiển thị danh sách "Hoạt động gần đây"
- [ ] Mỗi item có ngày, tên, số tiền
- [ ] Responsive trên mobile

---

## ➕ 3. THÊM HOẠT ĐỘNG (Add Activity)

### Form Input

- [ ] Input "Tên hoạt động" required
- [ ] Input "Tổng tiền" tự động format (500000 → 500,000đ)
- [ ] Input "Người tham gia" có autocomplete từ lịch sử
- [ ] Input ngày có date picker
- [ ] Ngày không được chọn trong tương lai
- [ ] Validation: Phải có ít nhất 1 người tham gia

### Thêm người tham gia

- [ ] Nhập tên → Enter hoặc click "Thêm"
- [ ] Tên hiển thị dưới dạng tag màu violet
- [ ] Click X để xóa người
- [ ] Duplicate names không được phép

### Submit

- [ ] Click "Lưu hoạt động"
- [ ] Loading spinner hiển thị
- [ ] Toast success: "✅ Thêm hoạt động thành công!"
- [ ] Tự động chuyển sang tab "Chi tiết"
- [ ] Form được reset

---

## 📋 4. DANH SÁCH HOẠT ĐỘNG (Activity List)

### Search & Filter

- [ ] Search box tìm theo tên hoạt động
- [ ] Search box tìm theo tên người tham gia
- [ ] Filter "Tất cả" / "Đã thanh toán" / "Chưa thanh toán"
- [ ] Date filter lọc theo ngày
- [ ] Nút "Xóa bộ lọc" reset tất cả
- [ ] Hiển thị "Tìm thấy X kết quả"

### Activity Card

- [ ] Hiển thị tên, ngày, tổng tiền
- [ ] Số người tham gia
- [ ] % đã thanh toán
- [ ] Progress bar màu xanh/đỏ
- [ ] Click để expand/collapse

### Expanded View

- [ ] Danh sách người tham gia
- [ ] Số tiền mỗi người
- [ ] Checkbox đánh dấu đã/chưa thanh toán (chỉ admin)
- [ ] QR code thanh toán (nếu đã setup)
- [ ] Nút "Xóa hoạt động" màu đỏ (chỉ admin)

### Delete Confirmation

- [ ] Click "Xóa hoạt động"
- [ ] Dialog xác nhận hiển thị
- [ ] Hiển thị tên hoạt động trong message
- [ ] Nút "Hủy" và "Xóa"
- [ ] Click "Xóa" → Toast: "🗑️ Xóa thành công!"
- [ ] Activity biến mất khỏi danh sách

### Empty State

- [ ] Khi chưa có hoạt động: Hiển thị icon Users
- [ ] Message: "Chưa có hoạt động nào"

---

## 💰 5. CÔNG NỢ (Debt Summary)

### Tổng hợp

- [ ] Danh sách tất cả người tham gia
- [ ] Mỗi người có card riêng
- [ ] Hiển thị:
  - Tổng nợ
  - Đã thanh toán
  - Còn lại
- [ ] Progress bar % thanh toán
- [ ] Badge trạng thái (Hoàn thành/Còn nợ)

### Sorting

- [ ] Sắp xếp theo tên
- [ ] Highlight người còn nợ nhiều nhất

---

## 📱 6. QR CODE (QR Code Manager)

### Setup QR

- [ ] Upload ảnh QR code
- [ ] Preview ảnh
- [ ] Input: Tên ngân hàng
- [ ] Input: Số tài khoản
- [ ] Input: Tên chủ tài khoản
- [ ] Nút "Lưu QR Code"

### Display

- [ ] QR hiển thị trong activity detail
- [ ] Click để phóng to
- [ ] Hiển thị thông tin ngân hàng

---

## 📤 7. XUẤT DỮ LIỆU (Export)

### Export Button

- [ ] Hiển thị trong header
- [ ] Icon Download
- [ ] Click mở menu dropdown
- [ ] 3 options: Excel, CSV, JSON

### Export Excel

- [ ] Download file .xls
- [ ] Tên file có timestamp
- [ ] Mở được trong Excel
- [ ] Hiển thị đúng tiếng Việt
- [ ] Có header và styling

### Export CSV

- [ ] Download file .csv
- [ ] UTF-8 BOM encoding
- [ ] Mở được trong Excel/Google Sheets
- [ ] Tiếng Việt hiển thị đúng

### Export JSON

- [ ] Download file .json
- [ ] Format đẹp (indented)
- [ ] Valid JSON structure

---

## 📱 8. RESPONSIVE DESIGN

### Mobile (< 768px)

- [ ] Header stack vertically
- [ ] Tabs scroll horizontally
- [ ] Cards full width
- [ ] Search filter stack vertically
- [ ] Export menu không bị che

### Tablet (768px - 1024px)

- [ ] Layout 2 columns
- [ ] Cards responsive
- [ ] Comfortable spacing

### Desktop (> 1024px)

- [ ] Max width 6xl
- [ ] Cards grid layout
- [ ] All features accessible

---

## 🌙 9. DARK MODE

- [ ] Auto detect system preference
- [ ] Toggle dark mode
- [ ] All components có dark variant
- [ ] Text contrast đủ
- [ ] No white flash khi reload

---

## ⚡ 10. PERFORMANCE & UX

### Loading States

- [ ] Loading overlay khi thêm/sửa/xóa
- [ ] Spinner animation
- [ ] Text "Đang xử lý..."
- [ ] Disable buttons khi loading

### Toast Notifications

- [ ] Success: Màu xanh, icon check
- [ ] Error: Màu đỏ, icon X
- [ ] Duration: 3 seconds
- [ ] Position: Top center
- [ ] Có animation fade in/out

### Realtime Sync

- [ ] Mở 2 tab/browser
- [ ] Thêm activity ở tab 1
- [ ] Tab 2 tự động cập nhật
- [ ] Không cần refresh

### Error Handling

- [ ] Mất kết nối internet → Hiển thị WifiOff icon
- [ ] Firebase error → Toast error message
- [ ] Form validation → Highlight field lỗi

---

## 🔒 11. SECURITY

### Admin Features

- [ ] Viewer không thấy nút "Thêm mới"
- [ ] Viewer không thấy nút "Xóa"
- [ ] Viewer không toggle được paid status
- [ ] Viewer không thấy tab QR Code

### Data Validation

- [ ] Không thể submit form rỗng
- [ ] Số tiền phải > 0
- [ ] Phải có ít nhất 1 người
- [ ] PIN phải 6 số

---

## ✨ 12. ANIMATIONS

- [ ] Page load: Fade in
- [ ] Cards: Hover scale
- [ ] Buttons: Hover lift
- [ ] Tabs: Smooth transition
- [ ] Modal: Scale in
- [ ] Toast: Slide in from top
- [ ] Delete icon: Rotate on hover

---

## 🐛 13. BUG TESTING

### Edge Cases

- [ ] Thêm 100+ activities → Performance OK?
- [ ] Tên rất dài → Truncate text?
- [ ] Số tiền rất lớn (1 tỷ) → Format đúng?
- [ ] 50+ người tham gia → UI vẫn ổn?
- [ ] Xóa activity đang expanded → No error?
- [ ] Logout khi đang ở tab "Thêm mới" → Reset state?

### Browser Compatibility

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Chrome Android

---

## 📊 KẾT QUẢ KIỂM TRA

| Chức năng      | Status | Ghi chú |
| -------------- | ------ | ------- |
| Authentication | ⬜     |         |
| Overview       | ⬜     |         |
| Add Activity   | ⬜     |         |
| Activity List  | ⬜     |         |
| Search/Filter  | ⬜     |         |
| Debt Summary   | ⬜     |         |
| QR Code        | ⬜     |         |
| Export         | ⬜     |         |
| Responsive     | ⬜     |         |
| Dark Mode      | ⬜     |         |
| Performance    | ⬜     |         |
| Security       | ⬜     |         |

**Tổng số test cases:** ~100+  
**Passed:** **_  
**Failed:** _**  
**Pass rate:** \_\_\_%

---

## 🚀 SAU KHI HOÀN THÀNH CHECKLIST

- [ ] Tất cả test cases passed
- [ ] No console errors
- [ ] No compilation warnings
- [ ] Code đã commit lên Git
- [ ] README.md đã cập nhật
- [ ] Sẵn sàng deploy production

**✅ Ứng dụng đã sẵn sàng sử dụng!**
