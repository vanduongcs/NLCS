import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// MUI
import {
  Box, IconButton, Menu, MenuItem, Typography,
  Dialog, DialogTitle, DialogContent,
  TextField, Button, List, ListItem, ListItemText, Divider
} from '@mui/material'

import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import SchoolIcon from '@mui/icons-material/School'
import HowToRegIcon from '@mui/icons-material/HowToReg'

import Swal from 'sweetalert2'

function ProfileUser() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [userId, setUserId] = useState('')
  const [UserTenTK, SetUserTenTK] = useState('')
  const [UserTenHienThi, SetUserTenHienThi] = useState('')
  const [UserLoai, SetUserLoai] = useState('')
  const [UserCCCD, SetUserCCCD] = useState('')
  const [UserSDT, SetUserSDT] = useState('')
  const [UserMatKhau, SetUserMatKhau] = useState('')

  const [userCourseIds, setUserCourseIds] = useState([])
  const [userExamIds, setUserExamIds] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showExamModal, setShowExamModal] = useState(false)

  const [results, setResults] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [examsList, setExamsList] = useState([])

  const open = Boolean(anchorEl)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  // Load profile khi click avatar
  const handleClick = async (e) => {
    setAnchorEl(e.currentTarget)
    try {
      const res = await axios.get('http://localhost:2025/api/account/tim-tai-khoan/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const u = res.data
      setUserId(u._id)
      SetUserTenTK(u.TenTaiKhoan)
      SetUserTenHienThi(u.TenHienThi)
      SetUserLoai(u.Loai)
      SetUserCCCD(u.CCCD)
      SetUserSDT(u.SDT)
      SetUserMatKhau(u.MatKhau)
      setUserCourseIds(u.KhoaHocDaThamGia || [])
      setUserExamIds(u.KhoaThiThamGia || [])
    } catch (err) {
      console.error('Lỗi khi gọi /tim-tai-khoan:', err)
      Swal.fire('Lỗi', 'Không lấy được thông tin người dùng', 'error')
    }
  }

  const handleClose = () => setAnchorEl(null)

  // Modal chứng chỉ
  const handleShowCertificates = async () => {
    handleClose()
    try {
      const res = await axios.get('http://localhost:2025/api/result/tat-ca-ket-qua')
      const my = res.data.filter(r => r.IDNguoiDung?._id === userId)
      setResults(my)
      setShowCertModal(true)
    } catch (err) {
      console.error(err)
      Swal.fire('Lỗi', 'Không lấy được kết quả', 'error')
    }
  }

  // Modal khóa học
  const handleShowCourses = async () => {
    handleClose()
    try {
      const res = await axios.get('http://localhost:2025/api/course/tat-ca-khoa-on')
      const my = res.data.filter(c => userCourseIds.includes(c._id))
      setCoursesList(my)
      setShowCourseModal(true)
    } catch (err) {
      console.error(err)
      Swal.fire('Lỗi', 'Không lấy được khóa học', 'error')
    }
  }

  // Modal kỳ thi đã đăng ký
  const handleShowExams = async () => {
    handleClose()
    try {
      const res = await axios.get('http://localhost:2025/api/exam/tat-ca-dot-thi')
      const my = res.data.filter(e => userExamIds.includes(e._id))
      setExamsList(my)
      setShowExamModal(true)
    } catch (err) {
      console.error(err)
      Swal.fire('Lỗi', 'Không lấy được kỳ thi', 'error')
    }
  }

  const handleLogOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('account')
    navigate('/')
  }

  // Cập nhật profile
  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:2025/api/account/cap-nhat-tai-khoan/${UserTenTK}`,
        { TenHienThi: UserTenHienThi, MatKhau: UserMatKhau, SDT: UserSDT }
      )
      Swal.fire('Cập nhật thành công!', '', 'success')
      setShowModal(false)
    } catch (err) {
      console.error(err)
      Swal.fire('Lỗi', 'Cập nhật thất bại', 'error')
    }
  }

  return (
    <Box>
      <IconButton onClick={handleClick}>
        <AccountCircleIcon sx={{ color: '#f5f6fa' }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{ mt: 1.25 }}
        disableScrollLock
      >
        <MenuItem onClick={handleClose} sx={{ display: 'flex', gap:1 }}>
          <AccountBoxIcon /><Typography>Tên: <strong>{UserTenHienThi}</strong></Typography>
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ display: 'flex', gap:1 }}>
          <MilitaryTechIcon /><Typography>TK: <strong>{UserTenTK}</strong></Typography>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); setShowModal(true) }} sx={{ display: 'flex', gap:1 }}>
          <SettingsIcon />Chi tiết
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleShowCertificates} sx={{ display:'flex', gap:1 }}>
          <MilitaryTechIcon />Chứng chỉ sở hữu
        </MenuItem>
        <MenuItem onClick={handleShowCourses} sx={{ display:'flex', gap:1 }}>
          <SchoolIcon />Khóa học đã tham gia
        </MenuItem>
        <MenuItem onClick={handleShowExams} sx={{ display:'flex', gap:1 }}>
          <HowToRegIcon />Kỳ thi đã đăng ký
        </MenuItem>
        <MenuItem onClick={handleLogOut} sx={{ display:'flex', gap:1 }}>
          <LogoutIcon />Đăng xuất
        </MenuItem>
      </Menu>

      {/* Modal chỉnh sửa */}
      <Dialog open={showModal} onClose={()=>setShowModal(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ textAlign:'center', fontWeight:'bold' }}>Thông tin tài khoản</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            <Box sx={{ flex:1, minWidth:240 }}>
              <Typography fontWeight="bold">Chỉnh sửa</Typography>
              <TextField
                fullWidth label="Tên hiển thị" sx={{ mt:2 }}
                value={UserTenHienThi} onChange={e=>SetUserTenHienThi(e.target.value)}
              />
              <TextField
                fullWidth label="Mật khẩu" sx={{ mt:2 }}
                value={UserMatKhau} onChange={e=>SetUserMatKhau(e.target.value)}
              />
              <TextField
                fullWidth label="SĐT" sx={{ mt:2 }}
                value={UserSDT} onChange={e=>SetUserSDT(e.target.value)}
              />
            </Box>
            <Box sx={{ flex:1, minWidth:240 }}>
              <Typography fontWeight="bold">Hệ thống</Typography>
              <TextField fullWidth sx={{ mt:2 }} label="TK" disabled value={UserTenTK}/>
              <TextField fullWidth sx={{ mt:2 }} label="CCCD" disabled value={UserCCCD}/>
              <TextField fullWidth sx={{ mt:2 }} label="Vai trò" disabled value={UserLoai}/>
            </Box>
            <Box sx={{
              flex:1, minWidth:160,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2
            }}>
              <Button variant="outlined" color="error" onClick={()=>setShowModal(false)} startIcon={<CancelIcon/>}>Hủy</Button>
              <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon/>}>Lưu</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal chứng chỉ */}
      <Dialog open={showCertModal} onClose={()=>setShowCertModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign:'center', fontWeight:'bold' }}>Chứng chỉ sở hữu</DialogTitle>
        <DialogContent dividers>
          {results.length===0
            ? <Typography align="center">Chưa có</Typography>
            : <List>
                {results.map(r=>(
                  <ListItem key={r._id}>
                    <ListItemText
                      primary={`${r.IDKyThi?.IDChungChi?.TenChungChi} — ${r.IDKyThi?.TenKyThi}`}
                      secondary={`Điểm: ${r.DiemTK}, Trạng thái: ${r.TrangThai}`}
                    />
                  </ListItem>
                ))}
              </List>
          }
        </DialogContent>
      </Dialog>

      {/* Modal khóa học */}
      <Dialog open={showCourseModal} onClose={()=>setShowCourseModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign:'center', fontWeight:'bold' }}>Khóa học đã tham gia</DialogTitle>
        <DialogContent dividers>
          {coursesList.length===0
            ? <Typography align="center">Chưa tham gia</Typography>
            : <List>
                {coursesList.map(c=>(
                  <ListItem key={c._id}>
                    <ListItemText
                      primary={c.TenKhoaHoc}
                      secondary={`Khai giảng: ${new Date(c.NgayKhaiGiang).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
          }
        </DialogContent>
      </Dialog>

      {/* Modal kỳ thi */}
      <Dialog open={showExamModal} onClose={()=>setShowExamModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign:'center', fontWeight:'bold' }}>Kỳ thi đã đăng ký</DialogTitle>
        <DialogContent dividers>
          {examsList.length===0
            ? <Typography align="center">Chưa đăng ký kỳ thi nào</Typography>
            : <List>
                {examsList.map(e=>(
                  <ListItem key={e._id}>
                    <ListItemText
                      primary={e.TenKyThi}
                      secondary={`Ngày thi: ${new Date(e.NgayThi).toLocaleDateString()} — Buổi: ${e.Buoi}`}
                    />
                  </ListItem>
                ))}
              </List>
          }
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ProfileUser
