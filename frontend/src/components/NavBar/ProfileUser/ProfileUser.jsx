import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// MUI
import {
  Box, IconButton, Menu, MenuItem, Typography, Avatar,
  Dialog, DialogTitle, DialogContent,
  TextField, Button
} from '@mui/material'

import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import Swal from 'sweetalert2'

function ProfileUser() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [UserTenTK, SetUserTenTK] = useState('')
  const [UserTenHienThi, SetUserTenHienThi] = useState('')
  const [UserLoai, SetUserLoai] = useState('')
  const [UserCCCD, SetUserCCCD] = useState('')
  const [UserSDT, SetUserSDT] = useState('')
  const [UserMatKhau, SetUserMatKhau] = useState('')
  const [showModal, setShowModal] = useState(false)

  const open = Boolean(anchorEl)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const handleClick = async (e) => {
    setAnchorEl(e.currentTarget)
    try {
      const uData = await axios.get('http://localhost:2025/api/account/tim-tai-khoan/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      SetUserTenTK(uData.data.TenTaiKhoan)
      SetUserTenHienThi(uData.data.TenHienThi)
      SetUserLoai(uData.data.Loai)
      SetUserCCCD(uData.data.CCCD)
      SetUserSDT(uData.data.SDT)
      SetUserMatKhau(uData.data.MatKhau)
    } catch (error) {
      console.error('Lỗi khi gọi API /account/tim-tai-khoan:', error)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('account')
    navigate('/')
  }

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:2025/api/account/cap-nhat-tai-khoan/${UserTenTK}`, {
        TenHienThi: UserTenHienThi,
        MatKhau: UserMatKhau,
        SDT: UserSDT
      })
      Swal.fire('Cập nhật thành công!', '', 'success')
      setShowModal(false)
    } catch (error) {
      console.error('Lỗi cập nhật:', error)
      Swal.fire('Lỗi cập nhật', 'Vui lòng thử lại', 'error')
    }
  }

  return (
    <Box>
      <IconButton
        id="profile-button"
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <AccountCircleIcon sx={{ color: '#f5f6fa' }} />
      </IconButton>

      <Menu
        id="profile-menu"
        disableScrollLock
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{ mt: 1.25 }}
      >
        <MenuItem onClick={handleClose} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBoxIcon />
          <Typography variant="body1">Họ Tên: <strong>{UserTenHienThi}</strong></Typography>
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MilitaryTechIcon />
          <Typography variant="body1">Tài khoản: <strong>{UserTenTK}</strong></Typography>
        </MenuItem>

        <MenuItem onClick={() => { handleClose(); setShowModal(true) }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant="body1">Chi tiết</Typography>
        </MenuItem>

        <MenuItem onClick={handleLogOut} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LogoutIcon />
          <Typography variant="body1">Đăng xuất</Typography>
        </MenuItem>
      </Menu>

      {/* Modal cập nhật thông tin */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '360px', maxWidth: '1000px' }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.3rem',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : '#1e1e1e'
          }}
        >
          Thông tin tài khoản
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              minHeight: '240px'
            }}
          >
            {/* Cột 1: chỉnh sửa */}
            <Box sx={{ flex: 1, minWidth: '240px' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Chỉnh sửa</Typography>
              <TextField label="Tên hiển thị" value={UserTenHienThi} onChange={(e) => SetUserTenHienThi(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Mật khẩu" value={UserMatKhau} onChange={(e) => SetUserMatKhau(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Số điện thoại" value={UserSDT} onChange={(e) => SetUserSDT(e.target.value)} fullWidth />
            </Box>

            {/* Cột 2: xem */}
            <Box sx={{ flex: 1, minWidth: '240px' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Thông tin hệ thống</Typography>
              <TextField label="Tên tài khoản" value={UserTenTK} fullWidth disabled sx={{ mb: 2 }} />
              <TextField label="CCCD" value={UserCCCD} fullWidth disabled sx={{ mb: 2 }} />
              <TextField label="Vai trò" value={UserLoai} fullWidth disabled />
            </Box>

            {/* Cột 3: nút */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                minWidth: '160px',
                flex: 1
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowModal(false)}
                sx={{ width: '150px'}}
                startIcon={<CancelIcon />}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ width: '150px'}}
                startIcon={<SaveIcon />}
              >
                Cập nhật
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ProfileUser
