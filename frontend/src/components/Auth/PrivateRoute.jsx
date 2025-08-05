import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const PrivateRoute = ({ children }) => {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    try {
      const decodedToken = jwtDecode(token)
    } catch (error) {
      localStorage.removeItem('token')
      navigate('/dang-nhap')
    }

    axios.get(`/api/account/tim-tai-khoan/${jwtDecode(token).TenTaiKhoan}`)
      .then(() => setChecking(false))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Phiên đăng nhập đã hết hạn',
          confirmButtonText: 'Đăng nhập lại',
          confirmButtonColor: '#1976d2'
        })
        localStorage.removeItem('token')
        navigate('/dang-nhap')
      })
  }, [])

  if (checking) return null
  return children
}

export default PrivateRoute
