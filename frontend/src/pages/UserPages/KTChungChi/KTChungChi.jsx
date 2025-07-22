import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// MUI
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Custom
import API from '../../../api.jsx'
import HienThiKetQua from './HienThiKetQua'

function KTChungChi() {
  const [cccd, SetCccd] = useState('')
  const [resultId, SetResultId] = useState('')
  const [resultInfo, SetResultInfo] = useState(null)
  
  // State để lưu toàn bộ danh sách
  const [Accounts, SetAccounts] = useState([])
  const [Results, SetResults] = useState([])

  // Hàm fetch dữ liệu ban đầu
  const FetchData = async () => {
    try {
      const [taiKhoanResponse, ketQuaResponse] = await Promise.all([
        API.get('/account/tat-ca-tai-khoan'),
        API.get('/result/tat-ca-ket-qua')
      ])

      SetAccounts(taiKhoanResponse.data)
      SetResults(ketQuaResponse.data)
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
  const XuLyKiemTraChungChi = () => {
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

    // Tìm kết quả
    const ketQua = Results.find(res => 
      res._id === resultId && res.IDNguoiDung?._id === taiKhoan._id
    )
    if (!ketQua) {
      return Swal.fire('Chứng chỉ hoặc CCCD không đúng', '', 'error')
    }

    // Xử lý thông tin kết quả
    const daHetHan = KiemTraNgayHetHan(ketQua.NgayHetHan?.slice(0, 10))

    SetResultInfo({
      hoTen: taiKhoan.TenHienThi,
      tenKyThi: ketQua.IDKyThi?.TenKyThi || '',
      tenChungChi: ketQua.IDKyThi?.IDChungChi?.TenChungChi || '',
      trangThai: ketQua.TrangThai,
      ngayCap: ketQua.NgayCap?.slice(0, 10),
      ngayHetHan: ketQua.NgayHetHan?.slice(0, 10),
      daHetHan
    })
  }

  const PageStyle = {
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
    <Box sx={ PageStyle }>
      <Box
        sx={ NotificationStyle }>
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
          label="Mã kết quả (ID)" 
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