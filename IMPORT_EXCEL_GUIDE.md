# Hướng dẫn Nhập dữ liệu từ File Excel

## Tổng quan
Chức năng "Nhập thông qua file Excel" cho phép người dùng nhập hàng loạt dữ liệu từ file Excel (.xlsx, .xls) vào hệ thống. Tính năng này được tích hợp vào tất cả các form quản lý:

- **Quản lý tài khoản** (QLNguoiDung)
- **Quản lý chứng chỉ** (QLChungChi)
- **Quản lý khóa học** (QLKhoaOn)
- **Quản lý kỳ thi** (QLKyThi)
- **Quản lý kết quả** (QLKetQua)

## Cách sử dụng

### 1. Mở dialog Import Excel
- Truy cập vào trang quản lý tương ứng
- Nhấn nút **"Nhập thông qua file Excel"** (màu xanh dương) trong form

### 2. Tải template Excel
- Nhấn nút **"Tải mẫu Excel"** để tải file template có sẵn
- File template sẽ chứa:
  - Hàng đầu tiên: Tên các trường dữ liệu
  - Hàng thứ hai: Dữ liệu mẫu

### 3. Chuẩn bị file Excel
- Sử dụng file template đã tải hoặc tạo file Excel mới
- **Hàng đầu tiên**: Phải chứa tên các trường dữ liệu (khớp với template)
- **Các hàng tiếp theo**: Chứa dữ liệu cần nhập

### 4. Upload và xem trước
- Nhấn **"Chọn file Excel"** và chọn file đã chuẩn bị
- Hệ thống sẽ tự động:
  - Kiểm tra định dạng file
  - Validate dữ liệu
  - Hiển thị xem trước 10 bản ghi đầu tiên

### 5. Nhập dữ liệu
- Kiểm tra xem trước dữ liệu
- Nhấn **"Nhập dữ liệu"** để thực hiện nhập hàng loạt
- Hệ thống sẽ hiển thị thông báo kết quả

## 📋 File mẫu có sẵn

Đã tạo sẵn các file mẫu trong thư mục gốc:
- `sample_accounts.csv` - Mẫu tài khoản
- `sample_certificates.csv` - Mẫu chứng chỉ  
- `sample_courses.csv` - Mẫu khóa học
- `sample_exams.csv` - Mẫu kỳ thi
- `sample_results.csv` - Mẫu kết quả

Bạn có thể mở các file này bằng Excel và chỉnh sửa theo nhu cầu.

## Định dạng dữ liệu theo từng module

### Quản lý tài khoản
| Tên hiển thị | Tên tài khoản | Vai trò | CCCD | Số điện thoại | Mật khẩu |
|--------------|---------------|---------|------|---------------|----------|
| Nguyễn Văn A | nguyenvana    | user    | 123456789 | 0901234567 | 123456 |

### Quản lý chứng chỉ  
| Loại | Tên chứng chỉ | Lệ phí thi | Học phí | Thời hạn | Điểm tối thiểu | Điểm tối đa |
|------|---------------|-----------|---------|----------|----------------|-------------|
| Ngoại ngữ | TOEIC | 500000 | 2000000 | 24 | 0 | 990 |

### Quản lý khóa học
| Tên chứng chỉ | Lịch học | Ngày khai giảng | Ngày kết thúc | Buổi | Sĩ số tối đa |
|---------------|----------|-----------------|---------------|------|-------------|
| TOEIC | T2 - T4 - T6 | 2024-01-15 | 2024-03-15 | Tối | 30 |

### Quản lý kỳ thi
| Tên chứng chỉ | Ngày thi | Buổi | Sĩ số tối đa |
|---------------|----------|------|-------------|
| TOEIC | 2024-04-15 | Sáng | 50 |

### Quản lý kết quả
| Người dùng | Kỳ thi | Điểm 1 | Điểm 2 | Điểm 3 | Điểm 4 |
|------------|--------|--------|--------|--------|--------|
| Nguyễn Văn A | Kỳ thi TOEIC 15/04/2024 | 450 | 495 | 0 | 0 |

## Lưu ý quan trọng

### Định dạng dữ liệu
- **Ngày tháng**: Định dạng YYYY-MM-DD (VD: 2024-01-15)
- **Số**: Chỉ nhập số, không có ký tự đặc biệt
- **Email**: Đúng định dạng email (có @ và domain)
- **Tên trường**: Phải khớp chính xác với template

### Dữ liệu liên kết
- **Tên chứng chỉ**: Phải tồn tại trong hệ thống
- **Người dùng**: Sử dụng tên hiển thị đã có trong hệ thống
- **Kỳ thi**: Sử dụng tên kỳ thi đã có trong hệ thống

### Xử lý lỗi
- Nếu có lỗi, hệ thống sẽ hiển thị danh sách lỗi cụ thể
- Sửa lỗi trong file Excel và thử lại
- Một bản ghi lỗi sẽ không ảnh hưởng đến các bản ghi khác

## Tính năng nâng cao

### Validation tự động
- Kiểm tra định dạng dữ liệu
- Kiểm tra tính hợp lệ của dữ liệu liên kết
- Hiển thị lỗi chi tiết theo từng hàng

### Xem trước dữ liệu
- Hiển thị 10 bản ghi đầu tiên
- Cho phép kiểm tra trước khi nhập
- Hiển thị tổng số bản ghi sẽ được nhập

### Tải template
- Template tự động được tạo theo cấu trúc dữ liệu
- Chứa dữ liệu mẫu để tham khảo
- Đảm bảo định dạng chính xác

## Troubleshooting

### Lỗi thường gặp
1. **"File Excel phải có ít nhất 2 hàng"**
   - Đảm bảo file có hàng tiêu đề và ít nhất 1 hàng dữ liệu

2. **"Không tìm thấy [tên]"**
   - Kiểm tra tên có chính xác trong hệ thống không
   - Đảm bảo dữ liệu liên kết đã được tạo trước

3. **"[Trường] không đúng định dạng ngày"**
   - Sử dụng định dạng YYYY-MM-DD
   - Đảm bảo ngày hợp lệ

4. **"[Trường] phải là số"**
   - Chỉ nhập số, không có text
   - Không sử dụng ký tự đặc biệt

### Liên hệ hỗ trợ
Nếu gặp vấn đề không thể giải quyết, vui lòng liên hệ quản trị viên hệ thống.
