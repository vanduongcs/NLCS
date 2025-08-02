import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// MUI
import Box from '@mui/material/Box'


// Extend
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2'

// Custome
import ModeSelector from './ModeSelector/ModeSelector.jsx'
import ExtendMenu from './ExtendMenu/ExtendMenu.jsx'
import IconButton from '@mui/material/IconButton'
import NavButton from './NavButton/NavButton.jsx'
import ProfileUser from './ProfileUser/ProfileUser.jsx'
import Account from '../../../../backend/models/Account.js'

function NavBar() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [AccountInfor, SetAccountInfor] = useState(null)

  const fetchAccount = async () => {
    try {
      const token = localStorage.getItem('token')

      if (jwtDecode(token).Loai === 'admin' || jwtDecode(token).Loai === 'user') {
        const account = await axios.get(`/account/tim-tai-khoan/${jwtDecode(token).TenTaiKhoan}`)
        SetAccountInfor(account.data)
      } else {
        throw new Error('Không xác định được vai trò')
      }
    } catch (err) {
      console.error(err.message)
      localStorage.removeItem('token')
      navigate('/dang-nhap')
    }
  }

  const isAdmin = jwtDecode(localStorage.getItem('token')).Loai === 'admin'

  useEffect(() => {
    fetchAccount()
  }, [AccountInfor])

  const clickOnLogo = () => {
    if (!isAdmin) navigate('trang-chu')
    else navigate('quan-ly-chung-chi')
  }

  return (
    <Box sx={{ alignItems: 'center', height: theme.nlcs.navBarHeight, width: '100%' }}>
      <Box
        sx={{
          bgcolor: theme.palette.info.dark,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ mx: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
          <IconButton
            disableRipple
            onClick={clickOnLogo}
            sx={{ height: '100%', '&:hover': { bgcolor: 'transparent' } }}
          >
            <img src='/Logo.svg' alt='logo' style={{ height: '100%' }} />
          </IconButton>

          <Box sx={{ display: { xs: 'inline-flex', sm: 'inline-flex', md: 'inline-flex', lg: 'none' }, alignItems: 'center' }}>
            <ExtendMenu isAdmin={isAdmin} />
          </Box>

          {!isAdmin && (
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, ml: 2 }}>
              <NavButton content='Trang Chủ' path='/trang-chu' />
              <NavButton content='Lịch dự kiến' children1='Lịch khai giảng' children2='Lịch thi' childrenPath1='/lich-khai-giang' childrenPath2='/lich-thi' />
              <NavButton content='Kết Quả' path='/ket-qua' />
              <NavButton content='Xác Thực' path='/xac-thuc-chung-chi' />
            </Box>
          )}

          {isAdmin && (
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, ml: 2 }}>
              <NavButton content='Chứng Chỉ' path='/quan-ly-chung-chi' />
              <NavButton content='Người Dùng' path='/quan-ly-nguoi-dung' />
              <NavButton content='Kỳ Thi' path='/quan-ly-ky-thi' />
              <NavButton content='Khóa Ôn' path='/quan-ly-khoa-on' />
              <NavButton content='Kết quả' path='/quan-ly-ket-qua' />
            </Box>
          )}
        </Box>

        <Box sx={{ mx: 2, display: 'flex', alignItems: 'center', gap: 2, color: '#f5f6fa' }}>
          <ModeSelector Input={theme.palette.mode} />
          <ProfileUser />
        </Box>
      </Box>
    </Box>
  )
}

export default NavBar
