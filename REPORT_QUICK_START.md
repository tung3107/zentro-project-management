# Quick Start Guide - Report Feature

## 🚀 Để sử dụng tính năng Báo cáo

### 1. Kiểm tra Environment Variables

Mở file `server/config.env` và đảm bảo có GEMINI_API_KEY:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Khởi động Backend

```bash
cd server
npm install  # Nếu chưa cài đặt dependencies
npm start    # hoặc npm run dev
```

### 3. Khởi động Frontend

```bash
cd client/zentro-frontend
npm install  # Dependencies đã được cài (react-markdown)
npm run dev
```

### 4. Truy cập tính năng

1. Đăng nhập vào hệ thống
2. Vào một dự án bất kỳ
3. Chọn tab **"Báo cáo"** trong project dashboard
4. Hoặc truy cập: `http://localhost:3000/member/projects/{projectId}/reports`

## 📊 Cách tạo báo cáo

### Bước 1: Chọn loại báo cáo

- **Tiến độ dự án**: Tổng quan task hoàn thành/trễ hạn
- **Hiệu suất team**: Phân tích năng suất từng thành viên
- **Task & Deadline**: Task quá hạn và sắp tới deadline
- **Báo cáo tổng hợp**: Báo cáo toàn diện

### Bước 2: Chọn khoảng thời gian

- **Từ ngày**: Ngày bắt đầu thu thập dữ liệu
- **Đến ngày**: Ngày kết thúc

### Bước 3: Lọc theo dự án/thành viên (tùy chọn)

- **Dự án**: Chọn dự án cụ thể hoặc "Tất cả dự án"
- **Thành viên**: Chỉ hiện khi đã chọn dự án, phân tích riêng 1 người

### Bước 4: Tạo báo cáo

- Nhấn nút **"Tạo báo cáo"**
- Chờ hệ thống phân tích (10-30 giây)
- Xem kết quả với:
  - Số liệu thống kê (cards màu sắc)
  - Phân tích AI chi tiết (dạng Markdown)

## 🎯 Ví dụ sử dụng

### Ví dụ 1: Báo cáo tiến độ dự án tháng 1

1. Chọn **"Tiến độ dự án"**
2. Từ ngày: `01/01/2024`
3. Đến ngày: `31/01/2024`
4. Dự án: Chọn dự án cụ thể
5. Tạo báo cáo

**Kết quả:** Phân tích tỷ lệ hoàn thành, task trễ, đề xuất cải thiện

### Ví dụ 2: Đánh giá hiệu suất team member

1. Chọn **"Hiệu suất team"**
2. Chọn khoảng thời gian (ví dụ: 1 tháng)
3. Chọn dự án
4. (Tùy chọn) Chọn thành viên cụ thể
5. Tạo báo cáo

**Kết quả:** So sánh năng suất, ai làm tốt, ai cần hỗ trợ

### Ví dụ 3: Kiểm tra deadline

1. Chọn **"Task & Deadline"**
2. Chọn khoảng thời gian
3. Chọn dự án
4. Tạo báo cáo

**Kết quả:** Danh sách task quá hạn, task sắp đến hạn, ưu tiên xử lý

## 📈 Đọc hiểu báo cáo

### Phần số liệu (Stats Cards)

- **Tổng số Task**: Tổng task trong khoảng thời gian
- **Hoàn thành**: Số task đã done + % hoàn thành
- **Đang làm**: Task đang in-progress
- **Quá hạn**: Task quá deadline
- **Sprint**: Số sprint đang active/tổng số sprint

### Phần phân tích AI

- **Tóm tắt tổng quan**: Nhìn tổng thể tình hình
- **Phân tích chi tiết**: Đi sâu vào từng khía cạnh
- **Highlight vấn đề**: Task/người cần chú ý
- **Đề xuất hành động**: Các bước cải thiện cụ thể

### Định dạng Markdown

- **Bold text**: Số liệu quan trọng
- Bullet points: Danh sách phân tích
- Headers: Phân chia nội dung
- Blockquotes: Nhấn mạnh điểm chính

## 🛠️ Tính năng sắp tới

### Xuất PDF (Placeholder)

- Nút **"Xuất PDF"** đã có
- Chức năng đang phát triển
- Sẽ tạo file PDF chuyên nghiệp với charts

### Gửi Email (Placeholder)

- Nút **"Gửi Email"** đã có
- Chức năng đang phát triển
- Sẽ gửi báo cáo qua email cho nhiều người

## 🐛 Xử lý lỗi

### Lỗi: "Không thể tạo báo cáo"

**Nguyên nhân:**

- API key Gemini không hợp lệ
- Không có dữ liệu trong khoảng thời gian
- Lỗi kết nối database

**Cách xử lý:**

1. Kiểm tra `GEMINI_API_KEY` trong config.env
2. Thử lại với khoảng thời gian khác
3. Kiểm tra console log backend

### Lỗi: "Không thể tải danh sách dự án"

**Nguyên nhân:**

- User chưa là member của dự án nào
- Lỗi authentication

**Cách xử lý:**

1. Đảm bảo user đã được add vào ít nhất 1 dự án
2. Kiểm tra token còn hạn không

### AI trả về kết quả không mong muốn

**Nguyên nhân:**

- Dữ liệu quá ít
- Prompt không phù hợp

**Cách xử lý:**

- Hệ thống có fallback analysis tự động
- Vẫn hiển thị số liệu thống kê

## 💡 Tips

### Tối ưu kết quả báo cáo

1. **Chọn khoảng thời gian hợp lý**: 1-3 tháng cho insight tốt nhất
2. **Dữ liệu càng nhiều càng chính xác**: Đảm bảo task có đầy đủ thông tin
3. **Cập nhật deadline**: Set due_date cho task để tracking deadline
4. **Log spent_time**: Ghi thời gian làm việc để phân tích hiệu suất

### So sánh báo cáo

- Tạo báo cáo cho các tháng khác nhau
- So sánh tỷ lệ hoàn thành theo thời gian
- Theo dõi xu hướng cải thiện

## 📝 API Endpoints

Nếu muốn tích hợp từ code:

```javascript
// Generate report
POST /api/v1/reports/generate
Body: {
  reportType: "project_progress",
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  projectId: "PRJ-123"
}

// Get projects
GET /api/v1/reports/projects

// Get team members
GET /api/v1/reports/team-members/:projectId
```

## ✅ Checklist sau khi cài đặt

- [ ] Backend server chạy thành công
- [ ] Frontend dev server chạy thành công
- [ ] GEMINI_API_KEY đã được set
- [ ] Có ít nhất 1 dự án với tasks
- [ ] Có ít nhất 1 member trong dự án
- [ ] Có thể truy cập `/admin/reports`
- [ ] Có thể chọn dự án từ dropdown
- [ ] Có thể tạo báo cáo và nhìn thấy kết quả
- [ ] AI analysis hiển thị đúng (Markdown format)

## 🎓 Học thêm

- Xem file `REPORT_FEATURE_SUMMARY.md` để hiểu chi tiết technical
- Đọc code comments trong `report.service.js`
- Tham khảo existing reports như `CHAT_FEATURE_SUMMARY.md`

---

**Happy Reporting! 📊🚀**
