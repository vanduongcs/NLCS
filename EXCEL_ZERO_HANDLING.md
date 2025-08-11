# 🔧 Hướng dẫn xử lý số 0 đầu trong Excel

## ❌ Vấn đề
Excel tự động chuyển đổi số có 0 đầu thành dạng số, làm mất số 0:
- `0901234567` → `901234567` 
- `012345678901` → `12345678901`

## ✅ Giải pháp

### Cách 1: Format cột thành Text (Khuyến nghị)
1. **Chọn cột CCCD và SDT** trước khi nhập dữ liệu
2. **Chuột phải** → **Format Cells**
3. **Chọn "Text"** → **OK**
4. **Nhập dữ liệu** - Excel sẽ giữ nguyên số 0 đầu

### Cách 2: Thêm dấu nháy đơn
Nhập trước số 0 một dấu nháy đơn `'`:
- Nhập: `'0901234567`
- Hiển thị: `0901234567`

### Cách 3: Import từ CSV
1. **Tạo file .csv** với dữ liệu đúng
2. **Excel** → **Data** → **From Text/CSV**
3. **Chọn định dạng Text** cho cột CCCD và SDT

## 🔄 Tự động sửa trong hệ thống

Hệ thống đã được cập nhật để tự động xử lý:

### ✅ Số điện thoại (10 chữ số)
- Nếu nhận được 9 chữ số → Tự động thêm "0" đầu
- VD: `901234567` → `0901234567`

### ✅ CCCD (12 chữ số)  
- Nếu nhận được 11 chữ số → Tự động thêm "0" đầu
- VD: `12345678901` → `012345678901`

### ⚠️ Validation
- SDT phải có đúng 10 chữ số
- CCCD phải có đúng 12 chữ số
- Nếu sai sẽ báo lỗi cụ thể

## 📝 File mẫu đã cập nhật

File `sample_accounts.csv` đã được cập nhật với:
- CCCD: 12 chữ số (bao gồm số 0 đầu)
- SDT: 10 chữ số (bao gồm số 0 đầu)

## 🧪 Test Cases

### ✅ Dữ liệu hợp lệ:
```
CCCD: 012345678901 (12 chữ số)
SDT:  0901234567   (10 chữ số)
```

### ❌ Dữ liệu sẽ được tự động sửa:
```
CCCD: 12345678901  → 012345678901 (thêm 1 số 0)
SDT:  901234567    → 0901234567   (thêm 1 số 0)
```

### ❌ Dữ liệu lỗi:
```
CCCD: 1234567890   (10 chữ số - quá ngắn)
SDT:  90123456     (8 chữ số - quá ngắn)
```

## 💡 Tips
1. **Luôn format Text** cho cột CCCD và SDT trước khi nhập
2. **Kiểm tra preview** trong dialog Import Excel
3. **Sử dụng file CSV mẫu** có sẵn
4. **Test với ít dữ liệu** trước khi import hàng loạt

## 🔍 Debug
Nếu vẫn gặp lỗi:
1. Kiểm tra **Browser Console** để xem dữ liệu được gửi
2. Xem **Network tab** để kiểm tra request payload
3. Đảm bảo **backend đang chạy** tại localhost:2025
