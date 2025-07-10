import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

// MUI
import Box from '@mui/material/Box'

// Custome
import API from '../../api.jsx'
import RegField from './RegisterField/RegField.jsx'
import GTLButton from './RegisterButton/GTLButton.jsx'
import RegisterButton from './RegisterButton/RegisterButton.jsx'

function LoginForm() {
  const [TenHienThi, setTenHienThi] = useState('')
  const [TenTaiKhoan, setTenTaiKhoan] = useState('')
  const [MatKhau, setMatKhau] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {

      const res = await API.post('/account/dang-ky', { TenHienThi, TenTaiKhoan, MatKhau })
      localStorage.setItem('token', res.data.token)

      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })

      navigate('/')

    } catch (error) {

      Swal.fire({
        icon: 'warning',
        title: error.response?.data?.message || 'Đăng ký thất bại',
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

  const goToLog = () => {
    navigate('/')
  }

  return (
    <Box sx={{
        height: '510px',
        width: '500px',
        bgcolor: 'rgba(245, 246, 250, 0.9)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3
      }}>
        <img src='/banner.png' />
        <RegField fieldSet={ 'Tài khoản' } input1={ TenTaiKhoan } setFunction={ setTenTaiKhoan } submitFunction={ handleKeyDown } />
        <RegField fieldSet={ 'Mật Khẩu' } input1={ MatKhau } setFunction={ setMatKhau } submitFunction={ handleKeyDown } type='password'/>
        <RegField fieldSet={ 'Tên Người Dùng' } input1={ TenHienThi } setFunction={ setTenHienThi } submitFunction={ handleKeyDown } />
        <RegisterButton onClick={handleSubmit} content={'Đăng ký'}/>
        <GTLButton onClick={goToLog} content={'Đến trang đăng nhập'} />
      </Box>
  )
}

export default LoginForm
