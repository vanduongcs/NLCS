import { Paper, Typography, Divider } from '@mui/material'

const HienThiKetQua = ({ resultInfo }) => {
  if (!resultInfo.hopLe) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="error">
          Kết quả kiểm tra: <strong>Không hợp lệ</strong>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography>
          {resultInfo.message || 'Không tìm thấy thông tin chứng chỉ'}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" color="success.main">
        Kết quả kiểm tra: <strong>Hợp lệ</strong>
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography><strong>Họ tên:</strong> {resultInfo.hoTen}</Typography>
      <Typography><strong>Kỳ thi:</strong> {resultInfo.tenKyThi}</Typography>
      <Typography><strong>Chứng chỉ:</strong> {resultInfo.tenChungChi}</Typography>
      <Typography><strong>Ngày cấp:</strong> {resultInfo.ngayCap || 'Không rõ'}</Typography>
      <Typography>
        <strong>Ngày hết hạn:</strong>{' '}
        {resultInfo.ngayHetHan || 'Vô thời hạn'}{' '}
        {resultInfo.daHetHan && <span style={{ color: 'red' }}>(Đã hết hạn)</span>}
      </Typography>
      <Typography>
        <strong>Trạng thái:</strong>{' '}
        <span style={{
          color: resultInfo.trangThai === 'Đã lấy' ? 'green' : 'orange'
        }}>
          {resultInfo.trangThai}
        </span>
      </Typography>
    </Paper>
  )
}

export default HienThiKetQua
