import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

// MUI
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Swal from 'sweetalert2'

// Table tùy chỉnh
import TableCustome from '../../../components/Table/TableCustome.jsx'
import API from '../../../api.jsx'
import ThongTin from './ThongTin.jsx'
import renderActionButton from '../../../components/renderActionButton/renderActionButton.jsx'

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
          ...user,
          KhoaHocDaThamGia: newList
        }
      )
      FetchData() // Gọi lại để cập nhật dữ liệu
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi đăng ký', message)
    }
  }

  const columns = [
    { label: 'Tên khóa học', key: 'TenKhoaHoc' },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', isDate: true },
    { label: 'Ngày kết thúc', key: 'NgayKetThuc', isDate: true },
    { label: 'Buổi học', key: 'Buoi' },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (_, row) => row.IDChungChi?.TenChungChi || 'Không rõ'
    },
    { label: 'Lịch học', key: 'LichHoc' },
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
      render: (_, row) => renderActionButton(row, user, handleDangKyOrHuy, 'course') // Thêm type = 'course'
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
