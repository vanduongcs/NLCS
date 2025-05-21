import React from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function DangNhap() {

  const navigate = useNavigate()

  const [TenTK, SetTenTK] = useState('')
  const [MatKhau, SetMatKhau] = useState('')
  const [ReMatKhau, SetReMatKhau] = useState('')
  const [Message, SetMessage] = useState('')
  const [IsError, SetIsError] = useState(false)

  useEffect(() => {
    const loginState = localStorage.getItem('loginState')
    if (loginState !== 'true') {
      navigate('/')
    }
    else {
      navigate('/trang-chu')
    }
  }, [navigate])

  const handleLogin = async() => {
    try {
        await axios.post('http://localhost:2025/api/account/dang-nhap', {TenTK, MatKhau})
        localStorage.setItem('loginState', 'true')
        navigate('/trang-chu')
        SetIsError(false)
    } catch (error) {
      const errmessage = error.response?.data?.message || 'Lỗi không xác định'
      SetMessage(errmessage)
      SetIsError(true)
    }
  }

  const handleRegister = async() => {
    try {
      if(ReMatKhau == MatKhau) {
        await axios.post('http://localhost:2025/api/account/dang-ky', {TenTK, MatKhau})
        localStorage.setItem('loginState', 'true')
        navigate('/trang-chu')
        SetIsError(false)
      }
      else {
        SetIsError(false)
        SetMessage("Hai mật khẩu không khớp")
      }
    } catch (error) {
      const errmessage = error.response?.data?.message || 'Lỗi không xác định'
      SetMessage(errmessage)
      SetIsError(true)
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url("/loginBackground.jpg")',
        backgroundPosition: 'center'
      }}>
      <Box
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#031a0df5' : '#031a0df5' ),
          height: '350px',
          width: '400px',
          borderRadius: '8px',
          opacity: '0.95',
          boxShadow: 24,
          border: `2px solid ${(theme) => {theme.palette.info.contrastText}}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
        }}>
          <TextField 
            sx={{width: '70%'}} 
            label="Tài khoản" 
            variant="standard"
            value={TenTK}
            onChange={(e) => SetTenTK(e.target.value)} />
          <TextField
            sx={{width: '70%'}} 
            label="Mật khẩu" 
            variant="standard" 
            value={MatKhau}
            onChange={(e) => SetMatKhau(e.target.value)}/>
          <TextField
            sx={{width: '70%'}} 
            label="Xác Nhận Mật khẩu" 
            variant="standard" 
            value={ReMatKhau}
            onChange={(e) => SetReMatKhau(e.target.value)}/>
          <Button
            sx={{
              width: '60%',
              fontWeight: 'bold',
              borderRadius: '5px',
              textTransform: 'none'
            }} 
            variant="outlined"
            onClick={handleLogin}
          >Đăng nhập
          </Button>
          <Button
          sx={{ 
            mt: -2, 
            width: '60%', 
            fontWeight: 'bold', 
            borderRadius: '5px', 
            textTransform: 'none'
          }} 
          variant="outlined"
          onClick={handleRegister}
          >Đăng ký
          </Button>
      </Box>
      {Message && (
        <Typography color="error" sx={{ mt: 1 }}>
          {Message}
        </Typography>
  )}
    </Box>
  )
}

export default DangNhap
