import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api.jsx'

function RoleAuth({ children }) {
  const navigate = useNavigate()

  const Auth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return navigate('/dang-nhap')

      const res = await API.get('/account/tim-tai-khoan/', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.Loai !== 'admin') {
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
