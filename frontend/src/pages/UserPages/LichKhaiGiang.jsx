import React, { useState, useEffect } from 'react'
import {
  Box, Tabs, Tab, Typography, Button
} from '@mui/material'
import Swal from 'sweetalert2'
import axios from 'axios'

// Table tùy chỉnh
import TableCustome from '../../components/Table/TableCustome.jsx'

function LichKhaiGiang() {
  const [tab, setTab] = useState(0)
  const [courses, setCourses] = useState([])
  const [user, setUser] = useState(null)

  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchCourses()
    fetchUser()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:2025/api/course/tat-ca-khoa-on')
      // chỉ lấy những khóa học chưa khai giảng
      const now = new Date()
      const upcoming = res.data.filter(c =>
        new Date(c.NgayKhaiGiang) > now
      )
      setCourses(upcoming)
    } catch (err) {
      console.error('Lỗi tải khóa học:', err)
    }
  }

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:2025/api/account/tim-tai-khoan', config)
      setUser(res.data)
    } catch (err) {
      console.error('Lỗi lấy tài khoản:', err)
    }
  }

  const isRegistered = (courseId) =>
    user?.KhoaHocDaThamGia?.includes(courseId)

  const handleDangKyOrHuy = async (course, action) => {
    if (!user) return
    const oldList = user.KhoaHocDaThamGia || []
    const newList = action === 'add'
      ? [...oldList, course._id]
      : oldList.filter(id => id !== course._id)

    try {
      await axios.put(
        `http://localhost:2025/api/account/cap-nhat-tai-khoan/${user.TenTaiKhoan}`,
        {
          TenHienThi: user.TenHienThi,
          MatKhau: user.MatKhau,
          SDT: user.SDT,
          Loai: user.Loai,
          KhoaThiThamGia: user.KhoaThiThamGia,
          DSKhoaHocDaThamGia: oldList,
          KhoaHocDaThamGia: newList
        },
        config
      )
      Swal.fire(
        action === 'add' ? 'Đăng ký thành công!' : 'Hủy đăng ký thành công!',
        '',
        'success'
      )
      fetchCourses()
      fetchUser()
    } catch (err) {
      console.error('Lỗi cập nhật:', err)
      Swal.fire('Lỗi thao tác', 'Vui lòng thử lại', 'error')
    }
  }

  const renderActionButton = (course) => {
    const daDangKy = isRegistered(course._id)
    const hetCho = course.SiSoToiDa !== undefined && course.SiSoHienTai >= course.SiSoToiDa

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Button
          variant={hetCho && !daDangKy ? 'outlined' : daDangKy ? 'outlined' : 'contained'}
          color={hetCho && !daDangKy ? 'error' : daDangKy ? 'secondary' : 'primary'}
          size="small"
          disabled={hetCho && !daDangKy}
          onClick={() => handleDangKyOrHuy(course, daDangKy ? 'remove' : 'add')}
          sx={{ minWidth: 120, height: 36, mx: 'auto' }}
        >
          {hetCho && !daDangKy
            ? 'Đã hết chỗ'
            : daDangKy
              ? 'Hủy đăng ký'
              : 'Đăng ký'}
        </Button>
      </Box>
    )
  }

  const columns = [
    { label: 'Tên khóa học', key: 'TenKhoaHoc' },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', isDate: true },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (_, row) => row.IDChungChi?.TenChungChi || 'Không rõ'
    },
    {
      label: 'Số lượng',
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

  // phân nhóm theo loại
  const coursesNgoaiNgu = courses.filter(c => c.IDChungChi?.Loai === 'Ngoại ngữ')
  const coursesTinHoc   = courses.filter(c => c.IDChungChi?.Loai === 'Tin học')

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        px: 3,
        py: 4,
        mx: 'auto',
        bgcolor: (theme) => theme.palette.background.default,
        borderRadius: 3
      }}>

      {/* Nội quy */}
      <Box sx={{ mb: 5, p: 2, border: `1px solid ${(theme) => theme.palette.divider}`, borderRadius: 2, bgcolor: (theme) => theme.palette.background.paper }}>
        <Typography variant="h6" gutterBottom><strong>Địa điểm học:</strong> Tầng 2 - tầng 4 tại trung tâm ngoại ngữ - tin học.</Typography>

        <Typography variant="h6" gutterBottom><strong>Thời gian học: </strong><strong>Chiều:</strong> 18:00 <strong>Tối:</strong> 19:50</Typography>

        <Typography variant="h6" gutterBottom><strong>Buổi học</strong></Typography>
        <Typography>
          <strong>1.</strong> T2 - T4 - T6 <br />
          <strong>2.</strong> T3 - T5 - T7 <br />
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Danh sách các khóa học đang mở
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Ngoại ngữ" />
        <Tab label="Tin học" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Khóa học Ngoại ngữ</Typography>
          <TableCustome columns={columns} rows={coursesNgoaiNgu} />
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Khóa học Tin học</Typography>
          <TableCustome columns={columns} rows={coursesTinHoc} />
        </Box>
      )}
    </Box>
  )
}

export default LichKhaiGiang
