import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'

// MUI
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Custome
import TableCustome from '../../../components/Table/TableCustome.jsx'
import LTBanner from './LTBanner.jsx'
import QuyDinhThi from './QuyDinhThi.jsx'
import API from '../../../api.jsx'

function LichThi() {
  const [tab, setTab] = useState(0)
  const [exams, setExams] = useState([])
  const [user, setUser] = useState(null)

  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  // Tách riêng các hàm fetch để dễ quản lý
  const fetchExams = async () => {
    try {
      const res = await API.get('/exam/tat-ca-dot-thi')
      const now = new Date()
      const upcoming = res.data.filter(e => new Date(e.NgayThi) > now)
      setExams(upcoming)
    } catch (err) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể tải danh sách kỳ thi',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const fetchUser = async () => {
    try {
      const res = await API.get('/account/tim-tai-khoan', config)
      setUser(res.data)
    } catch (err) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể tải danh sách người dùng',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  useEffect(() => {
    fetchExams()
    fetchUser()
  }, [])

  // Kiểm tra đã đăng ký kỳ thi
  const isRegistered = (examId) =>
    user?.KyThiDaThamGia?.includes(examId)

  // Xử lý đăng ký/hủy đăng ký
  const handleDangKyOrHuy = async (exam, action) => {
    if (!user) return
    const oldList = user.KyThiDaThamGia || []
    const newList = action === 'add'
      ? [...oldList, exam._id]
      : oldList.filter(id => id !== exam._id)

    try {
      await API.put(
        `/account/cap-nhat-tai-khoan/${user.TenTaiKhoan}`,
        {
          ...user,
          KyThiDaThamGia: newList
        }
      )
      Swal.fire({
        title: action === 'add' ? 'Đăng ký thành công!' : 'Hủy đăng ký thành công!',
        icon: 'success',
        confirmButtonColor: '#1976d2'
      })
      fetchExams()
      fetchUser()
    } catch (err) {
      console.error('Lỗi cập nhật:', err)
      Swal.fire({
        title: 'Lỗi thao tác', 
        text: 'Vui lòng thử lại',
        icon: 'error',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  // Render nút đăng ký/hủy
  const renderActionButton = (exam) => {
    const daDangKy = isRegistered(exam._id)
    const hetCho = exam.SiSoToiDa !== undefined && exam.SiSoHienTai >= exam.SiSoToiDa

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {hetCho && !daDangKy ? (
          <Button
            variant="outlined"
            color="error"
            disabled
            sx={{ minWidth: 120, height: 36, mx: 'auto' }}
          >
            Đã hết chỗ
          </Button>
        ) : (
          <Button
            variant={daDangKy ? 'outlined' : 'contained'}
            color={daDangKy ? 'error' : 'primary'}
            size="small"
            sx={{ minWidth: 120, height: 36, mx: 'auto' }}
            onClick={() => handleDangKyOrHuy(exam, daDangKy ? 'remove' : 'add')}
          >
            {daDangKy ? 'Hủy đăng ký' : 'Đăng ký'}
          </Button>
        )}
      </Box>
    )
  }

  // Định nghĩa cột cho bảng
  const columns = [
    { label: 'Tên kỳ thi', key: 'TenKyThi' },
    { label: 'Ngày thi', key: 'NgayThi', isDate: true },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (_, row) => row.IDChungChi?.TenChungChi || 'Không rõ'
    },
    {
      label: 'Sĩ số',
      key: 'SiSoHienTai',
      render: (_, row) => `${row.SiSoHienTai}/${row.SiSoToiDa ?? '∞'}`
    },
    {
      label: 'Thao tác',
      key: 'DangKy',
      isAction: true,
      render: (_, row) => renderActionButton(row)
    }
  ]

  // Lọc kỳ thi theo loại
  const examsNgoaiNgu = exams.filter(e => e.IDChungChi?.Loai === 'Ngoại ngữ')
  const examsTinHoc = exams.filter(e => e.IDChungChi?.Loai === 'Tin học')

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: 3,
        py: 4,
        mx: 'auto',
        bgcolor: (theme) => theme.palette.background.default,
        borderRadius: 3
      }}
    >
      <LTBanner />

      <QuyDinhThi />

      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Danh sách kỳ thi
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Ngoại ngữ" />
        <Tab label="Tin học" />
      </Tabs>

      {tab === 0 && (<TableCustome columns={columns} rows={examsNgoaiNgu} />)}
      {tab === 1 && (<TableCustome columns={columns} rows={examsTinHoc} />)}
    </Box>
  )
}

export default LichThi
