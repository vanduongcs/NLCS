# Hướng dẫn Test và Debug Import Excel

## 🔧 Kiểm tra trước khi test

### 1. Đảm bảo Backend đang chạy
```bash
cd d:\NLCS\backend
npm start
```
Server sẽ chạy tại: `http://localhost:2025`

### 2. Đảm bảo Frontend đang chạy
```bash
cd d:\NLCS\frontend
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

## 🧪 Test Import Excel

### Bước 1: Chuẩn bị file test
Đã tạo file mẫu: `d:\NLCS\sample_accounts.csv`

Hoặc tạo file Excel (.xlsx) với nội dung:
| Tên người dùng | Tên tài khoản | Vai trò | CCCD | Số điện thoại | Mật khẩu |
|----------------|---------------|---------|------|---------------|----------|
| Nguyễn Văn A   | nguyenvana    | user    | 123456789 | 0901234567 | 123456 |
| Trần Thị B     | tranthib      | user    | 987654321 | 0909876543 | abcdef |

### Bước 2: Test trên frontend
1. Truy cập `http://localhost:5173`
2. Đăng nhập với tài khoản admin
3. Vào **Quản lý tài khoản** 
4. Nhấn nút **"Nhập thông qua file Excel"**
5. Upload file mẫu và test

## 🐛 Debug Các Lỗi Thường Gặp

### Lỗi 500 - Internal Server Error

**Nguyên nhân có thể:**
1. **Backend không chạy**: Kiểm tra terminal backend
2. **Database không kết nối**: Kiểm tra MongoDB connection
3. **Dữ liệu validation fail**: Kiểm tra các trường bắt buộc

**Cách debug:**
1. Kiểm tra console backend để xem lỗi chi tiết
2. Kiểm tra Network tab trong browser DevTools
3. Xem response body của request lỗi

### Lỗi Validation

**Các trường bắt buộc cho Account:**
- `TenHienThi`: Không được rỗng
- `TenTaiKhoan`: Không được rỗng  
- `CCCD`: Không được rỗng
- `SDT`: Không được rỗng
- `MatKhau`: Không được rỗng

**Lỗi trùng lặp:**
- `TenTaiKhoan` đã tồn tại
- `CCCD` đã tồn tại  
- `SDT` đã tồn tại

### Lỗi File Excel

**Format không đúng:**
- Đảm bảo hàng đầu tiên là header
- Tên cột phải khớp chính xác
- File phải là .xlsx hoặc .xls

**Dữ liệu không hợp lệ:**
- Số điện thoại phải là chuỗi số
- CCCD phải là chuỗi số
- Vai trò chỉ được là 'user' hoặc 'admin'

## 🔍 Debug Steps

### 1. Kiểm tra Network Requests
Mở Developer Tools → Network tab:
- Xem request payload có đúng format không
- Kiểm tra response error message
- Verify endpoint URL có đúng không

### 2. Kiểm tra Backend Logs
Trong terminal backend, xem:
- Error stack trace
- Request data received
- Database operation errors

### 3. Kiểm tra Frontend Console
Trong browser console, xem:
- JavaScript errors
- Import function logs
- Validation errors

## 📝 Các cải tiến đã thực hiện

### 1. **Validation nâng cao**
- Kiểm tra trước khi gửi request
- Hiển thị lỗi chi tiết theo hàng
- Loại bỏ các giá trị rỗng

### 2. **Import từng bản ghi**
- Tránh lỗi toàn bộ batch
- Hiển thị kết quả chi tiết (thành công/lỗi)
- Cho phép tiếp tục với các bản ghi hợp lệ

### 3. **Error Handling tốt hơn**
- Phân loại lỗi theo loại
- Hiển thị thông báo dễ hiểu
- Cung cấp hướng dẫn sửa lỗi

### 4. **UI/UX cải thiện**
- Progress feedback
- Xem trước dữ liệu
- Template download
- Error summary

## 🚀 Test Scenarios

### Test Case 1: Import thành công
- File đúng format
- Dữ liệu hợp lệ
- Không trùng lặp
- **Kết quả mong đợi**: Thành công 100%

### Test Case 2: Dữ liệu thiếu
- Bỏ trống một số trường bắt buộc
- **Kết quả mong đợi**: Validation error trước khi gửi

### Test Case 3: Dữ liệu trùng lặp
- Tài khoản đã tồn tại
- **Kết quả mong đợi**: Lỗi với message cụ thể

### Test Case 4: Mix thành công và lỗi
- Một số bản ghi hợp lệ, một số lỗi
- **Kết quả mong đợi**: Partial success với báo cáo chi tiết

### Test Case 5: File format sai
- File không phải Excel
- Header không đúng
- **Kết quả mong đợi**: Format error

## 📞 Troubleshooting Contact

Nếu vẫn gặp vấn đề, check:
1. **Backend logs** để xem lỗi server
2. **Network tab** để xem request/response
3. **Console logs** để xem frontend errors
4. **Database connection** nếu cần thiết
