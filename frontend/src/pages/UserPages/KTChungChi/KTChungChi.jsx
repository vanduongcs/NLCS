import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// MUI
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Custom
import API from '../../../api.jsx'
import HienThiKetQua from './HienThiKetQua.jsx'

function KTChungChi() {
  const [cccd, SetCccd] = useState('')
  const [resultId, SetResultId] = useState('')
  const [resultInfo, SetResultInfo] = useState(null)

  // State để lưu toàn bộ danh sách
  const [Accounts, SetAccounts] = useState([])

  // Hàm format ngày từ yyyy-mm-dd sang dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Hàm fetch dữ liệu ban đầu
  const FetchData = async () => {
    try {
      const [taiKhoanResponse] = await Promise.all([
        API.get('/account/tat-ca-tai-khoan')
      ])

      SetAccounts(taiKhoanResponse.data)
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
      Swal.fire('Lỗi', 'Không thể tải dữ liệu', 'error')
    }
  }

  useEffect(() => {
    FetchData()
  }, [])

  // Kiểm tra ngày hết hạn
  const KiemTraNgayHetHan = (ngayHetHan) => {
    const today = new Date().toISOString().slice(0, 10)
    return ngayHetHan && ngayHetHan <= today
  }

  // Xử lý kiểm tra chứng chỉ
  const XuLyKiemTraChungChi = async () => {
    // Kiểm tra đầu vào
    if (!cccd.trim() || !resultId.trim()) {
      return Swal.fire('Vui lòng nhập đầy đủ CCCD và mã kết quả', '', 'warning')
    }

    // Tìm tài khoản
    const taiKhoan = Accounts.find(acc =>
      acc.CCCD?.trim() === cccd.trim()
    )
    if (!taiKhoan) {
      return Swal.fire('Không tìm thấy người dùng với CCCD này', '', 'error')
    }

    const fetchChungChiTuongUng = await API.get(`/certReceived/tat-ca-chung-chi-da-nhan/${taiKhoan._id}`)

    const chungChiTuongUng = fetchChungChiTuongUng.data.filter(cc => cc._id === resultId.trim())
    const chungChiHienThi = chungChiTuongUng[0]
    console.log('Chứng chỉ tương ứng:', chungChiHienThi)

    // Xử lý thông tin kết quả
    const daHetHan = KiemTraNgayHetHan(chungChiTuongUng?.NgayHetHan?.slice(0, 10))

    SetResultInfo({
      hoTen: chungChiHienThi?.IDNguoiDung?.TenHienThi,
      tenKyThi: chungChiHienThi?.IDKetQua?.IDKyThi?.TenKyThi || '',
      tenChungChi: chungChiHienThi?.IDKetQua?.IDKyThi?.IDChungChi?.TenChungChi || '',
      trangThai: chungChiHienThi?.TrangThai || '',
      ngayCap: formatDate(chungChiHienThi?.IDKetQua?.NgayCap),
      ngayHetHan: formatDate(chungChiHienThi?.IDKetQua?.NgayHetHan),
      daHetHan
    })
  }

  const PageStyle = {
    p: 4,
    minHeight: '80vh',
    bgcolor: (theme) => theme.palette.background.default
  }

  const NotificationStyle = {
    width: '100%',
    height: '150px',
    borderRadius: 4,
    m: '2 2 2 -2',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    bgcolor: (theme) => theme.palette.background.paper
  }

  return (
    <Box sx={PageStyle}>
      <Box
        sx={NotificationStyle}>
        <Box sx={{ m: 4 }}>
          <Typography variant='h5' gutterBottom><strong>Lưu ý:</strong> Mã số là mã chứng chỉ được in trên chứng chỉ của thí sinh.</Typography>
          <Typography variant='h6'>Nếu có bất kỳ sai sót nào vui lòng phản ánh qua mail: <strong>vanb2207577@student.ctu.edu.vn</strong></Typography>
        </Box>
      </Box>

      <Typography sx={{ mt: 2 }} variant="h5" fontWeight="bold" gutterBottom> Kiểm tra chứng chỉ </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <TextField
          label="CCCD"
          value={cccd}
          onChange={(e) => SetCccd(e.target.value)}
        />
        <TextField
          label="Mã số"
          value={resultId}
          onChange={(e) => SetResultId(e.target.value)}
        />
        <Button variant="contained" onClick={XuLyKiemTraChungChi}> Kiểm tra </Button>
      </Box>

      {resultInfo && <HienThiKetQua resultInfo={resultInfo} />}
    </Box>
  )
}

export default KTChungChi