import { useState, useEffect } from 'react'
import API from '../../../api.jsx'
import { Button, TextField, Paper, Typography, Divider } from '@mui/material'
import HienThiKetQua from './HienThiKetQua.jsx'

function KTChungChi() {
  const [cccd, setCccd] = useState('')
  const [resultId, setResultId] = useState('')
  const [Accounts, setAccounts] = useState([])
  const [resultInfo, SetResultInfo] = useState(null)

  useEffect(() => {
    API.get('/account/tat-ca-tai-khoan')
      .then(res => setAccounts(res.data))
      .catch(() => setAccounts([]))
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const KiemTraNgayHetHan = (ngay) => {
    if (!ngay) return false
    const today = new Date()
    return new Date(ngay) < today
  }

  const handleCheck = async () => {
    try {
      // Tìm tài khoản
      const taiKhoan = Accounts.find(acc => acc.CCCD?.trim() === cccd.trim())
      if (!taiKhoan) {
        return SetResultInfo({
          hopLe: false,
          message: 'Không tìm thấy người dùng với CCCD này'
        })
      }

      // Lấy tất cả chứng chỉ đã nhận của người dùng
      const fetchChungChiTuongUng = await API.get(
        `/certReceived/tat-ca-chung-chi-da-nhan/${taiKhoan._id}`
      )

      // Lọc chứng chỉ theo ID nhập vào
      const chungChiTuongUng = fetchChungChiTuongUng.data.filter(
        cc => cc._id === resultId.trim()
      )
      const chungChiHienThi = chungChiTuongUng[0]

      if (!chungChiHienThi) {
        return SetResultInfo({
          hopLe: false,
          message: 'Không tìm thấy chứng chỉ với mã số này'
        })
      }

      const daHetHan = KiemTraNgayHetHan(
        chungChiHienThi?.IDKetQua?.NgayHetHan?.slice(0, 10)
      )

      SetResultInfo({
        hopLe: true,
        hoTen: chungChiHienThi?.IDNguoiDung?.TenHienThi,
        tenKyThi: chungChiHienThi?.IDKetQua?.IDKyThi?.TenKyThi || '',
        tenChungChi:
          chungChiHienThi?.IDKetQua?.IDKyThi?.IDChungChi?.TenChungChi || '',
        trangThai: chungChiHienThi?.TrangThai || '',
        ngayCap: formatDate(chungChiHienThi?.IDKetQua?.NgayCap),
        ngayHetHan: formatDate(chungChiHienThi?.IDKetQua?.NgayHetHan),
        daHetHan
      })
    } catch (error) {
      SetResultInfo({
        hopLe: false,
        message: 'Lỗi hệ thống khi kiểm tra chứng chỉ'
      })
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Kiểm tra chứng chỉ</Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField
        fullWidth
        label="Nhập CCCD"
        variant="outlined"
        value={cccd}
        onChange={(e) => setCccd(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Nhập mã chứng chỉ"
        variant="outlined"
        value={resultId}
        onChange={(e) => setResultId(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleCheck}
      >
        Kiểm tra
      </Button>

      {resultInfo && (
        <div style={{ marginTop: 20 }}>
          <HienThiKetQua resultInfo={resultInfo} />
        </div>
      )}
    </Paper>
  )
}

export default KTChungChi
