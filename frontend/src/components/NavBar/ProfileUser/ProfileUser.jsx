import React from 'react'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { useState, useEffect } from 'react'
import axios from 'axios'

// MUI
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import LogoutIcon from '@mui/icons-material/Logout'

function ProfileUser() {

  const [anchorEl, setAnchorEl] = useState(null)
  const [UserTenTK, SetUserTenTK] = useState(null)
  const [UserTenHienThi, SetUserTenHienThi] = useState(null)
  const [UserLoai, SetUserLoai] = useState(null)
  const open = Boolean(anchorEl)

  const token = localStorage.getItem('token')

  const navigate = useNavigate()

  const handleClick = async (e) => {
  setAnchorEl(e.currentTarget)
  try {
    const uData = await axios.get('http://localhost:2025/api/account/tim-tai-khoan/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    SetUserTenTK(uData.data.TenTaiKhoan)
    SetUserTenHienThi(uData.data.TenHienThi)
    SetUserLoai(uData.data.Loai)
  } catch (error) {
    console.error('Lỗi khi gọi API /account/tim-tai-khoan/:', error)
  }
}

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('account')
    navigate('/');
  }
  
  return (
    <Box>
      <IconButton
      id='profile-button'
      aria-controls ={ open ? 'profile-menu': undefined }
      aria-haspopup = 'true'
      aria-expanded = { open ? 'true' : undefined }
      onClick={ handleClick }
      >
        <AccountCircleIcon sx={{color: '#f5f6fa'}}/>
      </IconButton>
      <Menu
        id='profile-menu'
        disableScrollLock={true}
        anchorEl={ anchorEl }
        open = { open }
        onClose={ handleClose }
        sx={{
          mt: 1.25
        }}
        >
          <MenuItem onClick={ handleClose } sx={{ display: 'flex', justifyContent: 'center' }}>
            <LocalOfferIcon sx={{ mr: '10px' }}/>
            <Typography variant="subtitle1">{ UserTenHienThi }</Typography>
          </MenuItem>

          <MenuItem onClick={ handleClose } sx={{ display: 'flex', justifyContent: 'center' }}>
            <AccountBoxIcon sx={{ mr: '10px' }} />
            <Typography variant="subtitle1">{ UserTenTK }</Typography>
          </MenuItem>

          <MenuItem onClick={ handleClose } sx={{ display: 'flex', justifyContent: 'center' }}>
            <MilitaryTechIcon sx= {{ mr: '10px' }} />
            <Typography variant="subtitle1"> Vai trò: { UserLoai }</Typography>
          </MenuItem>

           <MenuItem onClick={ handleLogOut } sx={{ display: 'flex', justifyContent: 'center' }}>
            <LogoutIcon sx= {{ mr: '10px' }} />
            <Typography variant="subtitle1">Đăng xuất</Typography>
          </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProfileUser
