import React, { useState, useEffect } from 'react'
import {
  Box, Tabs, Tab, Typography, Button
} from '@mui/material'
import Swal from 'sweetalert2'
import axios from 'axios'

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
      setExams(res.data)
    } catch (err) {
      console.error('Lỗi tải kỳ thi:', err)
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

  const isRegistered = (examId) => user?.KhoaThiThamGia?.includes(examId)

  const handleDangKyOrHuy = async (exam, action) => {
    if (!user) return
    const oldList = user.KhoaThiThamGia || []
    const newList = action === 'add'
      ? [...oldList, exam._id]
      : oldList.filter(id => id !== exam._id)

    try {
      await axios.put(`http://localhost:2025/api/account/cap-nhat-tai-khoan/${user.TenTaiKhoan}`, {
        TenHienThi: user.TenHienThi,
        MatKhau: user.MatKhau,
        SDT: user.SDT,
        Loai: user.Loai,
        KhoaHocDaThamGia: user.KhoaHocDaThamGia,
        DSKhoaThiThamGia: oldList,
        KhoaThiThamGia: newList
      }, config)

      const msg = action === 'add' ? 'Đăng ký thành công!' : 'Hủy đăng ký thành công!'
      Swal.fire(msg, '', 'success')
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
          color={daDangKy ? 'secondary' : 'primary'}
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
      render: (val, row) => row.IDChungChi?.TenChungChi || 'Không rõ'
    },
    {
      label: 'Sĩ số',
      key: 'SiSoHienTai',
      render: (val, row) =>
        `${row.SiSoHienTai}/${row.SiSoToiDa ?? '∞'}`
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
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Danh sách các kỳ thi chứng chỉ
      </Typography>

      <Tabs value={tab} onChange={(e, val) => setTab(val)} centered sx={{ mb: 2 }}>
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
