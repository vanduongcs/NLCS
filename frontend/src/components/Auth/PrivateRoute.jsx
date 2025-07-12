import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'

const PrivateRoute = ({ children }) => {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      localStorage.removeItem('token')
      navigate('/dang-nhap')
      return
    }

    axios.get('/api/account/tim-tai-khoan/', {
      headers: { Authorization: `Bearer ${token}` }
    })
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
