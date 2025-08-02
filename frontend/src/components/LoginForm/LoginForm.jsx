import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// MUI components
import Box from '@mui/material/Box'
import LoginField from './LoginField/LoginField.jsx'

// Extend
import Swal from 'sweetalert2'
import { jwtDecode } from 'jwt-decode'

// Custome
import LoginButton from './LoginButton/LoginButton.jsx'
import GTRButton from './LoginButton/GTRButton.jsx'
import API from '../../api.jsx'

function LoginForm() {

  const [TenTaiKhoan, setTenTaiKhoan] = useState('')
  const [MatKhau, setMatKhau] = useState('')
  const navigate = useNavigate()

  const PageStyle = {
    height: '430px',
    width: '500px',
    bgcolor: 'rgba(245, 246, 250, 0.9)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3
  }

  const handleSubmit = async () => {
    try {
      const res = await API.post('/account/dang-nhap', { TenTaiKhoan, MatKhau })

      localStorage.setItem('token', res.data.token)
      const token = localStorage.getItem('token')

      Swal.fire({
        icon: 'success',
        title: 'Đăng nhập thành công',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      });

      if (jwtDecode(token).Loai === 'admin') {
        navigate('/quan-ly-chung-chi');
      } else {
        navigate('/trang-chu');
      }
    } catch (error) {
      Swal.fire({
        icon: 'warning',
        title: error.response?.data?.message || 'Đăng nhập thất bại',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const goToReg = () => {
    navigate('/dang-ky')
  }

  return (
    <Box sx={PageStyle}>
      <Box
        component="img"
        src="/banner.png"
      />

      {/* Input */}
      <LoginField
        fieldSet={'Tài khoản'}
        input1={TenTaiKhoan}
        setFunction={setTenTaiKhoan}
        submitFunction={handleKeyDown}
      />

      <LoginField
        fieldSet={'Mật khẩu'}
        input1={MatKhau}
        setFunction={setMatKhau}
        submitFunction={handleKeyDown}
        type='password'
      />

      {/* Submit Button */}
      <LoginButton onClick={handleSubmit} content={'Đăng nhập'} />
      <GTRButton submitFunction={goToReg} content={'Đến trang đăng ký'} />
    </Box>
  )
}

export default LoginForm
