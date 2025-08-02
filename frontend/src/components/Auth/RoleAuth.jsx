import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Extend
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2'

function RoleAuth({ children }) {
  const navigate = useNavigate()

  const Auth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return navigate('/dang-nhap')

      if (jwtDecode(token).Loai !== 'admin') {
        localStorage.removeItem('token')
        return navigate('/dang-nhap')
      }
    } catch (error) {
      console.error('❌ RoleAuth token lỗi:', error)
      localStorage.removeItem('token')
      navigate('/dang-nhap')
    }
  }

  useEffect(() => {
    Auth()
  }, [])

  return children
}

export default RoleAuth
