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
import ThongTin from './ThongTin.jsx'
import QuyDinhThi from './QuyDinhThi.jsx'
import API from '../../../api.jsx'
import renderActionButton from '../../../components/renderActionButton/renderActionButton.jsx'

import { jwtDecode } from 'jwt-decode'

function LichThi() {
  const [tab, setTab] = useState(0)
  const [exams, setExams] = useState([])
  const [user, setUser] = useState(null)

  const token = localStorage.getItem('token')

  const FetchData = async () => {
    try {
      const [ExamsResponse, userResponse] = await Promise.all([
        API.get('/exam/tat-ca-ky-thi'),
        API.get(`/account/tim-tai-khoan/${jwtDecode(token).TenTaiKhoan}`)
      ])

      const now = new Date()
      const chuaThi = ExamsResponse.data.filter(e => new Date(e.NgayThi) > now)

      setExams(chuaThi)
      setUser(userResponse.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi tải dữ liệu', message)
    }
  }

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
      FetchData() // Cập nhật lại danh sách kỳ thi
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi đăng ký', message)
    }
  }

  // Định nghĩa cột cho bảng
  const columns = [
    { label: 'Tên kỳ thi', key: 'TenKyThi' },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (_, row) => row.IDChungChi?.TenChungChi || 'Không rõ'
    },
    { label: 'Ngày thi', key: 'NgayThi', isDate: true },
    { label: 'Buổi thi', key: 'Buoi' },
    {
      label: 'Sĩ số',
      key: 'SiSoHienTai',
      render: (_, row) => `${row.SiSoHienTai}/${row.SiSoToiDa ?? '∞'}`
    },
    {
      label: 'Thao tác',
      key: 'DangKy',
      align: 'center',
      isAction: true,
      render: (_, row) => renderActionButton(row, user, handleDangKyOrHuy, 'exam') // Thêm type = 'exam'
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
      <ThongTin />

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
