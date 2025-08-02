import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'

// MUI
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Custome
import API from '../../api.jsx'

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
        API.get('/exam/tat-ca-dot-thi'),
        API.get('/result/tat-ca-ket-qua')
      ])

      SetAccounts(accountsRes.data)
      SetExams(examsRes.data)
      SetResults(resultsRes.data)
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
      Swal.fire('Lỗi', 'Không thể tải dữ liệu', 'error')
    }
  }

  // Chạy khi component mount
  useEffect(() => {
    FetchData()
  }, [])

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
  const XuLyTraCuuKetQua = () => {
    // Kiểm tra đầu vào
    if (!cccd.trim() || !tenKyThi.trim()) {
      return Swal.fire('Vui lòng nhập đủ CCCD và tên kỳ thi', '', 'warning')
    }

    // Tìm tài khoản
    const acc = Accounts.find(a => a.CCCD?.trim() === cccd.trim())
    if (!acc) {
      return Swal.fire('Không tìm thấy thí sinh này', '', 'warning')
    }

    // Tìm kỳ thi
    const exam = Exams.find(e =>
      e.TenKyThi?.trim().toLowerCase() === tenKyThi.trim().toLowerCase()
    )
    if (!exam) {
      return Swal.fire('Không tìm thấy kỳ thi với tên này', '', 'warning')
    }

    // Tìm kết quả
    const r = Results.find(res =>
      res.IDNguoiDung?._id === acc._id && res.IDKyThi?._id === exam._id
    )
    if (!r) {
      return Swal.fire('Không tìm thấy kết quả thi phù hợp', '', 'warning')
    }

    // Cập nhật kết quả
    SetResult({
      _id: r._id,
      hoTen: acc.TenHienThi,
      cccd: acc.CCCD,
      tenKyThi: exam.TenKyThi,
      buoi: exam.Buoi,
      ngayThi: FormatDate(exam.NgayThi),
      ngayCap: FormatDate(r.NgayCap),
      trangThai: r.TrangThai,
      diem1: r.Diem1,
      diem2: r.Diem2,
      diem3: r.Diem3,
      diem4: r.Diem4,
      diemTK: r.DiemTK,
      KQ: r.KQ,
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
        <Button variant="contained" onClick={XuLyTraCuuKetQua}>
          Tra cứu
        </Button>
      </Box>

      {result && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Kết quả:</Typography>

          <Grid container spacing={1}>
            {RenderRow('Mã số', result._id)}
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
