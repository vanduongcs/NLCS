import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { jwtDecode } from 'jwt-decode'

// MUI
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Custome
import API from '../../../api.jsx'

function KetQua() {
  const [cccd, SetCccd] = useState('')
  const [tenKyThi, SetTenKyThi] = useState('')
  const [result, SetResult] = useState(null)

  // State để lưu toàn bộ danh sách
  const [Accounts, SetAccounts] = useState([])
  const [Exams, SetExams] = useState([])
  const [Results, SetResults] = useState([])

  // Hàm fetch dữ liệu ban đầu
  const FetchData = async () => {
    try {
      const [accountsRes, examsRes, resultsRes] = await Promise.all([
        API.get('/account/tat-ca-tai-khoan'),
        API.get('/exam/tat-ca-ky-thi'),
        API.get('/result/tat-ca-ket-qua')
      ])

      SetAccounts(accountsRes.data)
      SetExams(examsRes.data)
      SetResults(resultsRes.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi không thể tải dữ liệu', message)
    }
  }

  // Chạy khi component mount
  useEffect(() => {
    FetchData()
  }, [])

  const showError = (title, message = 'Vui lòng thử lại sau.') => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
  }

  // Hàm format ngày
  function FormatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const dd = String(d.getDate()).padStart(2, '0')
    const MM = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${MM}/${yyyy}`
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

  // Xử lý tìm kiếm kết quả
  const ResultSearchHandle = async () => {
    // Kiểm tra đầu vào
    if (!cccd.trim() || !tenKyThi.trim()) {
      return Swal.fire('Vui lòng nhập đủ CCCD và tên kỳ thi', '', 'warning')
    }

    // Tìm tài khoản
    const accHandleCCCD = Accounts.find(acc =>
      acc.CCCD?.trim().toLowerCase() === cccd.trim().toLowerCase()
    )

    if (!accHandleCCCD) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Không tìm thấy tài khoản với CCCD này', message)
    }

    // Tìm kỳ thi
    const examHandle = Exams.find(e =>
      e.TenKyThi?.trim().toLowerCase() === tenKyThi.trim().toLowerCase()
    )

    if (!examHandle) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Không tìm thấy kỳ thi với tên này', message)
    }

    // Tìm kết quả
    const resultHandle = Results.find(res =>
      res.IDNguoiDung?._id === accHandleCCCD._id && res.IDKyThi?._id === examHandle._id
    )

    const LayChungChi = await API.get(`/certReceived/tat-ca-chung-chi-da-nhan/${accHandleCCCD._id}`)
    const ChungChiDangThaoTac = LayChungChi.data.find(cc => cc.IDKetQua?._id === resultHandle._id)
    const TrangThaiChungChi = ChungChiDangThaoTac?.TrangThai

    if (!resultHandle) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Không tìm thấy kết quả thi phù hợp', message)
    }

    // Cập nhật kết quả
    SetResult({
      _id: ChungChiDangThaoTac._id,
      hoTen: accHandleCCCD.TenHienThi,
      cccd: accHandleCCCD.CCCD,
      tenKyThi: examHandle.TenKyThi,
      buoi: examHandle.Buoi,
      ngayThi: FormatDate(examHandle.NgayThi),
      ngayCap: FormatDate(resultHandle.NgayCap),
      trangThai: TrangThaiChungChi,
      diem1: resultHandle.Diem1,
      diem2: resultHandle.Diem2,
      diem3: resultHandle.Diem3,
      diem4: resultHandle.Diem4,
      diemTK: resultHandle.DiemTK,
      KQ: resultHandle.KQ,
    })
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
            <strong>Lưu ý:</strong> Tên kỳ thi được thông báo trong mail gửi đến thí sinh.
          </Typography>
          <Typography variant='h6'>
            Nếu có bất kỳ sai sót nào vui lòng phản ánh qua mail: <strong>vanb2207577@student.ctu.edu.vn</strong>
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ mt: 2 }} variant="h5" fontWeight="bold" gutterBottom>
        Tra cứu kết quả thi
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="CCCD"
          value={cccd}
          onChange={(e) => SetCccd(e.target.value)}
        />
        <TextField
          label="Tên kỳ thi"
          value={tenKyThi}
          onChange={(e) => SetTenKyThi(e.target.value)}
        />
        <Button variant="contained" onClick={ResultSearchHandle}>
          Tra cứu
        </Button>
      </Box>

      {result && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Kết quả:</Typography>

          <Grid container spacing={1}>
            {RenderRow('Mã chứng chỉ', result._id)}
            {RenderRow('Họ tên', result.hoTen)}
            {RenderRow('CCCD', result.cccd)}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1}>
            {RenderRow('Kỳ thi', result.tenKyThi)}
            {RenderRow('Buổi thi', result.buoi)}
            {RenderRow('Ngày thi', result.ngayThi)}
            {RenderRow('Ngày cấp', result.ngayCap)}
            {RenderRow('Trạng thái', result.trangThai)}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1}>
            {RenderRow('Điểm 1', result.diem1)}
            {RenderRow('Điểm 2', result.diem2)}
            {RenderRow('Điểm 3', result.diem3)}
            {RenderRow('Điểm 4', result.diem4)}
            {RenderRow('Tổng kết', result.diemTK)}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1}>
            {RenderRow('Kết quả', result.KQ)}
          </Grid>
        </Paper>
      )}
    </Box>
  )
}

export default KetQua
