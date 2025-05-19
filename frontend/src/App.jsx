// import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TrangChu from './pages/TrangChu/TrangChu.jsx'
import DotThi from './pages/DotThi.jsx'
import LichKhaiGiang from './pages/LichKhaiGiang.jsx'
import DKOn from './pages/DKOn.jsx'
import DKThi from './pages/DKThi.jsx'
import KetQua from './pages/KetQua.jsx'
import KTChungChi from './pages/KTChungChi.jsx'
import TTChung from './pages/ThongTinChung.jsx'

// import MUITable from '../data/Cert/MUITable.jsx'

function App() {
  // const [certificates, setCertificates] = useState([])

  // const fetchCerts = () => {
  //   fetch('http://localhost:2025/api/certificates')
  //     .then(res => res.json())
  //     .then(data => setCertificates(data))
  //     .catch(err => console.error('Lỗi khi fetch:', err));
  // }

  // useEffect(() => {
  //   fetchCerts();
  // }, [])

  return (
    <Router>
      <Box>
        <Routes>
          <Route path='/' element={<TrangChu />} />
          <Route path='/dot-thi' element={<DotThi />} />
          <Route path='/lich-khai-giang' element={<LichKhaiGiang />} />
          <Route path='/dang-ky-khoa-on' element={<DKOn />} />
          <Route path='/dang-ky-thi' element={<DKThi />} />
          <Route path='/ket-qua' element={<KetQua />} />
          <Route path='/xac-thuc-chung-chi' element={<KTChungChi />} />
          <Route path='/thong-tin-chung' element={<TTChung />} />
          
          {/* <Route path="/certificates" element={<MUITable certificates={certificates} fetchCerts={fetchCerts} />} /> */}
        </Routes>
      </Box>
    </Router>
  )
}

export default App
