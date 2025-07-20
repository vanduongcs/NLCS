import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

// MUI components
import NavBar from './components/NavBar/NavBar.jsx'
import Footer from './components/Footer/Footer.jsx'
import Box from '@mui/material/Box'

// Route
import DangNhap from './pages/UserPages/DangNhap.jsx'
import DangKy from './pages/UserPages/DangKy.jsx'
import TrangChu from './pages/UserPages/TrangChu.jsx'
import LichThi from './pages/UserPages/LichThi.jsx'
import LichKhaiGiang from './pages/UserPages/LichKhaiGiang.jsx'
import KetQua from './pages/UserPages/KetQua.jsx'
import KTChungChi from './pages/UserPages/KTChungChi.jsx'

// Admin zone
import QLChungChi from './pages/adminPages/QLChungChi.jsx'
import QLKhoaOn from './pages/adminPages/QLKhoaOn.jsx'
import QLKyThi from './pages/adminPages/QLKyThi.jsx'
import QLNguoiDung from './pages/adminPages/QLNguoiDung.jsx'
import QLKetQua from './pages/adminPages/QLKetQua.jsx'

// Extend
import PrivateRoute from './components/Auth/PrivateRoute.jsx'
import RoleAuth from './components/Auth/RoleAuth.jsx'

function Layout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/' || location.pathname === '/dang-ky' || location.pathname === '/dang-nhap'

  return (
    <Box>
      {!isAuthPage && <NavBar />}

      <Box>
        {/* Danh sách các đường dẫn */}
        <Routes>
          {/* Phần đăng nhập */}
          <Route path='/' element={<DangNhap />} />
          <Route path='/dang-nhap' element={<DangNhap />} />
          <Route path='/dang-ky' element={<DangKy />} />

          {/* Phần User */}
          <Route path='/trang-chu' element={<PrivateRoute><TrangChu /></PrivateRoute>} />
          <Route path='/lich-thi' element={<PrivateRoute><LichThi /></PrivateRoute>} />
          <Route path='/lich-khai-giang' element={<PrivateRoute><LichKhaiGiang /></PrivateRoute>} />
          <Route path='/ket-qua' element={<PrivateRoute><KetQua /></PrivateRoute>} />
          <Route path='/xac-thuc-chung-chi' element={<PrivateRoute><KTChungChi /></PrivateRoute>} />

          {/* Phần Admin */}
          <Route path='/quan-ly-chung-chi' element={<PrivateRoute><RoleAuth><QLChungChi /></RoleAuth></PrivateRoute>} />
          <Route path='/quan-ly-khoa-on' element={<PrivateRoute><RoleAuth><QLKhoaOn /></RoleAuth></PrivateRoute>} />
          <Route path='/quan-ly-ky-thi' element={<PrivateRoute><RoleAuth><QLKyThi /></RoleAuth></PrivateRoute>} />
          <Route path='/quan-ly-nguoi-dung' element={<PrivateRoute><RoleAuth><QLNguoiDung /></RoleAuth></PrivateRoute>} />
          <Route path='/quan-ly-ket-qua' element={<PrivateRoute><RoleAuth><QLKetQua></QLKetQua></RoleAuth></PrivateRoute>} />
        </Routes>
      </Box>

      {!isAuthPage && <Footer />}
    </Box>
  )
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}

export default App
