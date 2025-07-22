import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'

const HienThiKetQua = ({ resultInfo }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold">
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