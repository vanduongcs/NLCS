import React from 'react'
import { Box, Typography } from '@mui/material'

const QuyDinhThi = () => {
  return (
    <Box sx={{ 
      mb: 5, 
      p: 2, 
      border: `1px solid ${(theme) => theme.palette.divider}`, 
      borderRadius: 2, 
      bgcolor: (theme) => theme.palette.background.paper 
    }}>
      <Typography variant="h6" gutterBottom><strong>1. Nội quy kỳ thi</strong></Typography>
      <Typography variant="body2" paragraph>
        – Thí sinh phải mang theo CMND/CCCD.<br />
        – Có mặt trước giờ thi ít nhất 30 phút để làm thủ tục.<br />
        – Không mang thiết bị thu phát sóng, điện thoại, tài liệu vào phòng thi.<br />
        – Tuân thủ mọi hướng dẫn của giám thị, giữ trật tự và thái độ nghiêm túc.
      </Typography>

      <Typography variant="h6" gutterBottom><strong>2. Hình thức thi</strong></Typography>
      <Typography variant="body2" paragraph>
        – <strong>Trên máy tính</strong>.
      </Typography>

      <Typography variant="h6" gutterBottom><strong>3. Buổi thi & Thời gian</strong></Typography>
      <Typography variant="body2">
        – <strong>Sáng:</strong> 8:00 | <strong>Chiều:</strong> 14:00<br />
        – Địa điểm thi được thông báo trong email xác nhận.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}><strong>4. Kết quả & Nhận chứng chỉ</strong></Typography>
      <Typography variant="body2">
        – Kết quả công bố sau 1 tuần.<br />
        – Phúc khảo trong vòng 1 tuần sau khi có kết quả.<br />
        – Nhận chứng chỉ: Thứ 3 và Thứ 5 hàng tuần, sau 3 tuần kể từ ngày thi.
      </Typography>
    </Box>
  )
}

export default QuyDinhThi
