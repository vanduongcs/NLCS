import { Navigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token[0]) {
    Swal.fire({
      icon: 'warning',
      title: 'Vui lòng đăng nhập',
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
    return <Navigate to="/" />
  }
  return children
}

export default PrivateRoute