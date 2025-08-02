import { useState, useEffect } from 'react'
import {
  Box, Tabs, Tab, Typography, Button
} from '@mui/material'
import Swal from 'sweetalert2'

// Table tùy chỉnh
import TableCustome from '../../../components/Table/TableCustome.jsx'
import API from '../../../api.jsx'
import ThongTin from './ThongTin.jsx'
import { jwtDecode } from 'jwt-decode'

function LichKhaiGiang() {
  const [tab, setTab] = useState(0)
  const [courses, setCourses] = useState([])
  const [user, setUser] = useState(null)

  const token = localStorage.getItem('token')

  // Hàm fetch dữ liệu ban đầu
  const FetchData = async () => {
    try {
      const [coursesResponse, userResponse] = await Promise.all([
        API.get('/course/tat-ca-khoa-on'),
        API.get(`/account/tim-tai-khoan/${jwtDecode(token).TenTaiKhoan}`)
      ])

      const now = new Date()
      const chuaKhaiGiang = coursesResponse.data.filter(c => new Date(c.NgayKhaiGiang) > now)

      setCourses(chuaKhaiGiang)
      setUser(userResponse.data)
    } catch (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể tải dữ liệu',
        text: error.message,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  useEffect(() => {
    FetchData()
  }, [])

  const renderActionButton = (course) => {
    const daDangKy = user?.KhoaHocDaThamGia?.includes(course._id)
    const hetCho = course.SiSoToiDa !== undefined && course.SiSoHienTai >= course.SiSoToiDa

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Button
          variant={hetCho && !daDangKy ? 'outlined' : daDangKy ? 'outlined' : 'contained'}
          color={hetCho && !daDangKy ? 'error' : daDangKy ? 'error' : 'primary'}
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

  const handleDangKyOrHuy = async (course, action) => {
    if (!user) return
    const oldList = user.KhoaHocDaThamGia || []
    const newList = action === 'add'
      ? [...oldList, course._id]
      : oldList.filter(id => id !== course._id)

    try {
      await API.put(
        `/account/cap-nhat-tai-khoan/${user.TenTaiKhoan}`,
        {
          TenHienThi: user.TenHienThi,
          MatKhau: user.MatKhau,
          SDT: user.SDT,
          Loai: user.Loai,
          KhoaThiThamGia: user.KhoaThiThamGia,
          DSKhoaHocDaThamGia: oldList,
          KhoaHocDaThamGia: newList
        }
      )
      Swal.fire({
        title: action === 'add' ? 'Đăng ký thành công!' : 'Hủy đăng ký thành công!',
        icon: 'success',
        confirmButtonColor: '#1976d2'
      })
      FetchData() // Gọi lại để cập nhật dữ liệu
    } catch (err) {
      Swal.fire({
        title: 'Lỗi thao tác',
        text: 'Vui lòng thử lại',
        icon: 'error',
        confirmButtonColor: '#1976d2'
      })
    }
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
  const coursesTinHoc = courses.filter(c => c.IDChungChi?.Loai === 'Tin học')

  const ContainerStyle = {
    minHeight: '100vh',
    px: 3,
    py: 4,
    mx: 'auto',
    bgcolor: (theme) => theme.palette.background.default,
    borderRadius: 3
  }

  return (
    <Box
      sx={ContainerStyle}>

      <ThongTin />

      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Danh sách các khóa học đang mở
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Ngoại ngữ" />
        <Tab label="Tin học" />
      </Tabs>

      {tab === 0 && (<TableCustome columns={columns} rows={coursesNgoaiNgu} />)}
      {tab === 1 && (<TableCustome columns={columns} rows={coursesTinHoc} />)}
    </Box>
  )
}

export default LichKhaiGiang
