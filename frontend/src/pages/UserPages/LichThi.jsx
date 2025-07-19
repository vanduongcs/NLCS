import Swal from 'sweetalert2'
import axios from 'axios'
import React, { useState, useEffect } from 'react'

// MUI
import {
  Box, Tabs, Tab, Typography, Button
} from '@mui/material'

// Custom Table
import TableCustome from '../../components/Table/TableCustome.jsx'

function LichThi() {
  const [tab, setTab] = useState(0)
  const [exams, setExams] = useState([])
  const [user, setUser] = useState(null)

  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchExams()
    fetchUser()
  }, [])

  const fetchExams = async () => {
    try {
      const res = await axios.get('http://localhost:2025/api/exam/tat-ca-dot-thi')
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
      const res = await axios.get('http://localhost:2025/api/account/tim-tai-khoan', config)
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

  const isRegistered = (examId) =>
    user?.KhoaThiThamGia?.includes(examId)

  const handleDangKyOrHuy = async (exam, action) => {
    if (!user) return
    const oldList = user.KhoaThiThamGia || []
    const newList = action === 'add'
      ? [...oldList, exam._id]
      : oldList.filter(id => id !== exam._id)

    try {
      await axios.put(
        `http://localhost:2025/api/account/cap-nhat-tai-khoan/${user.TenTaiKhoan}`,
        {
          TenHienThi: user.TenHienThi,
          MatKhau: user.MatKhau,
          SDT: user.SDT,
          Loai: user.Loai,
          KhoaHocDaThamGia: user.KhoaHocDaThamGia,
          DSKhoaThiThamGia: oldList,
          KhoaThiThamGia: newList
        },
        config
      )
      Swal.fire(
        action === 'add' ? 'Đăng ký thành công!' : 'Hủy đăng ký thành công!',
        '',
        'success'
      )
      fetchExams()
      fetchUser()
    } catch (err) {
      console.error('Lỗi cập nhật:', err)
      Swal.fire('Lỗi thao tác', 'Vui lòng thử lại', 'error')
    }
  }

  const renderActionButton = (exam) => {
    const daDangKy = isRegistered(exam._id)
    const hetCho = exam.SiSoToiDa !== undefined && exam.SiSoHienTai >= exam.SiSoToiDa

    if (hetCho && !daDangKy) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Button
            variant="outlined"
            color="error"
            disabled
            sx={{ minWidth: 120, height: 36, mx: 'auto' }}
          >
            Đã hết chỗ
          </Button>
        </Box>
      )
    }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Button
        variant={daDangKy ? 'outlined' : 'contained'}
        color={daDangKy ? 'error' : 'primary'}
        size="small"
        sx={{ minWidth: 120, height: 36, mx: 'auto' }}
        onClick={() => handleDangKyOrHuy(exam, daDangKy ? 'remove' : 'add')}
      >
        {daDangKy ? 'Hủy đăng ký' : 'Đăng ký'}
      </Button>
    </Box>
  )
}

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
      {/* Thông báo */}
      <Box sx={{
        mb: 4,
        p: 2,
        bgcolor: (theme) => theme.palette.warning.light,
        borderRadius: 2,
        border: `1px solid ${(theme) => theme.palette.warning.main}`
      }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Thông báo</Typography>
        <Typography variant="body2">
          Thí sinh vui lòng kiểm tra kỹ thông tin cá nhân và email xác nhận sau khi đăng ký.
        </Typography>
      </Box>

      {/* Giới thiệu */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          Trung tâm Ngoại ngữ – Tin học
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          Trung tâm chuyên tổ chức các kỳ thi cấp chứng chỉ quốc gia và quốc tế cho học viên có nhu cầu.
          Bạn có thể xem danh sách các kỳ thi sắp tới và đăng ký trực tiếp tại đây.
        </Typography>
      </Box>

      {/* Nội quy */}
      <Box sx={{ mb: 5, p: 2, border: `1px solid ${(theme) => theme.palette.divider}`, borderRadius: 2, bgcolor: (theme) => theme.palette.background.paper }}>
        <Typography variant="h6" gutterBottom><strong>1. Nội quy kỳ thi</strong></Typography>
        <Typography variant="body2" paragraph>
          – Thí sinh phải mang theo CMND/CCCD.<br />
          – Có mặt trước giờ thi ít nhất 30 phút để làm thủ tục.<br />
          – Không mang thiết bị thu phát sóng, điện thoại, tài liệu vào phòng thi.<br />
          – Tuân thủ mọi hướng dẫn của giám thị, giữ trật tự và thái độ nghiêm túc.
        </Typography>

        <Typography variant="h6" gutterBottom><strong>2. Hình thức thi</strong></Typography>
        <Typography variant="body2" paragraph>
          – <strong>Trên máy tính</strong>.
        </Typography>

        <Typography variant="h6" gutterBottom><strong>3. Buổi thi & Thời gian</strong></Typography>
        <Typography variant="body2">
          – <strong>Sáng:</strong> 8:00 | <strong>Chiều:</strong> 14:00<br />
          – Địa điểm thi được thông báo trong email xác nhận.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}><strong>4. Kết quả & Nhận chứng chỉ</strong></Typography>
        <Typography variant="body2">
          – Kết quả công bố sau 1 tuần.<br />
          – Phúc khảo trong vòng 1 tuần sau khi có kết quả.<br />
          – Nhận chứng chỉ: Thứ 3 và Thứ 5 hàng tuần, sau 3 tuần kể từ ngày thi.
        </Typography>
      </Box>

      {/* Tabs */}
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Danh sách các kỳ thi chứng chỉ
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Ngoại ngữ" />
        <Tab label="Tin học" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Kỳ thi Ngoại ngữ</Typography>
          <TableCustome columns={columns} rows={examsNgoaiNgu} />
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Kỳ thi Tin học</Typography>
          <TableCustome columns={columns} rows={examsTinHoc} />
        </Box>
      )}
    </Box>
  )
}

export default LichThi
