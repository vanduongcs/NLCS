import { useState, useEffect } from 'react'
import API from '../../../api.jsx'
import { Button, TextField, Paper, Typography, Divider, Grid, Box } from '@mui/material'
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
    const d = new Date(dateString)
    const dd = String(d.getDate()).padStart(2, '0')
    const MM = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${MM}/${yyyy}`
  }

  const KiemTraNgayHetHan = (ngay) => {
    if (!ngay) return false
    const today = new Date()
    return new Date(ngay) < today
  }

  // Render dòng thông tin
  function RenderRow(label, value) {
    return (
      <>
        <Grid item xs={4}><strong>{label}:</strong></Grid>
        <Grid item xs={8}>{value || '---'}</Grid>
      </>
    )
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
        cccd: taiKhoan.CCCD,
        tenKyThi: chungChiHienThi?.IDKetQua?.IDKyThi?.TenKyThi || '',
        tenChungChi:
          chungChiHienThi?.IDKetQua?.IDKyThi?.IDChungChi?.TenChungChi || '',
        trangThai: chungChiHienThi?.TrangThai || '',
        ngayCap: formatDate(chungChiHienThi?.IDKetQua?.NgayCap),
        ngayHetHan: formatDate(chungChiHienThi?.IDKetQua?.NgayHetHan),
        daHetHan,
        maChungChi: chungChiHienThi?._id
      })
    } catch (error) {
      SetResultInfo({
        hopLe: false,
        message: 'Lỗi hệ thống khi kiểm tra chứng chỉ'
      })
    }
  }

  // Styles
  const BannerStyle = {
    width: '100%',
    height: '150px',
    borderRadius: 4,
    m: '2 2 2 -2',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    bgcolor: (theme) => theme.palette.background.paper
  }

  const PageStyle = {
    p: 4,
    minHeight: '80vh',
    bgcolor: (theme) => theme.palette.background.default
  }

  return (
    <Box sx={PageStyle}>
      <Box sx={BannerStyle}>
        <Box sx={{ m: 4 }}>
          <Typography variant='h5' gutterBottom>
            <strong>Lưu ý:</strong> Mã chứng chỉ được ghi trên chứng chỉ hoặc thông báo qua email.
          </Typography>
          <Typography variant='h6'>
            Nếu có bất kỳ sai sót nào vui lòng phản ánh qua mail: <strong>vanb2207577@student.ctu.edu.vn</strong>
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ mt: 2 }} variant="h5" fontWeight="bold" gutterBottom>
        Tra cứu chứng chỉ
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="CCCD"
          value={cccd}
          onChange={(e) => setCccd(e.target.value)}
        />
        <TextField
          label="Mã chứng chỉ"
          value={resultId}
          onChange={(e) => setResultId(e.target.value)}
        />
        <Button variant="contained" onClick={handleCheck}>
          Tra cứu
        </Button>
      </Box>

      {resultInfo && (
        <HienThiKetQua resultInfo={resultInfo} />
      )}
    </Box>
  )
}

export default KTChungChi
