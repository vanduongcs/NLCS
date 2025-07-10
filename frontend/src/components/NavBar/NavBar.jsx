import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// MUI
import Box from '@mui/material/Box'

// Custome
import ModeSelector from './ModeSelector/ModeSelector.jsx'
import ExtendMenu from './ExtendMenu/ExtendMenu.jsx'
import IconButton from '@mui/material/IconButton'
import NavButton from './NavButton/NavButton.jsx'
import ProfileUser from './ProfileUser/ProfileUser.jsx'




function NavBar() {
  const theme = useTheme()

  const navigate = useNavigate()

  const [AccountInfor, SetAccountInfor] = useState(null)

  const token = localStorage.getItem('token')

  const fetchAccount = async () => {
    const res = await axios.get('http://localhost:2025/api/account/tim-tai-khoan/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.data?.Loai && res.data?.Loai === 'admin') {
      SetAccountInfor(res.data)
    } else {
      console.error(err)
    }
  }

  const isAdmin = AccountInfor?.Loai === 'admin'

  useEffect(() => {
    fetchAccount()
  }, [])

  const clickOnLogo = () => {
    if (!isAdmin) navigate('trang-chu')
    else navigate('quan-ly-chung-chi')
  }

  return (
    <Box
      sx={{
        alignItems: 'center',
        height: (theme) => theme.nlcs.navBarHeight,
        width: '100%',
      }}
    >
      {/* NavBar background */}
      <Box
        sx={{
          bgcolor: (theme) => (theme.palette.info.dark),
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Button system */}
        {/* Left */}
        <Box
          sx={{
            mx: 2,
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}>
          <IconButton
            disableRipple
            onClick={clickOnLogo}
            sx={{
              height: '100%',
              '&:hover': {
                bgcolor: 'transparent'
              },
            }}
          >
            <img
              src='/Logo.svg'
              alt='logo'
              style={{ height: '100%' }}
            />
          </IconButton>

          {/* Extend button */}
          <Box
            sx={{
              display: {
                xs: 'inline-flex',
                sm: 'inline-flex',
                md: 'inline-flex',
                lg: 'none'
              },
              alignItems: 'center'
            }}>
            <ExtendMenu isAdmin={isAdmin} />
          </Box>

          {/* List Button User */}
          {!isAdmin && (
            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'none',
                  md: 'none',
                  lg: 'flex',
                },
                alignItems: 'center',
                gap: 2,
                ml: 2
              }}
            >
              <NavButton content='Trang Chủ' path='/trang-chu' />
              <NavButton content='Thông Tin' children1='Ngoại ngữ' children2='Tin học' childrenPath1='/chung-chi-ngoai-ngu' childrenPath2='/chung-chi-tin-hoc' />
              <NavButton content='Ghi Danh' children1='Ghi danh thi' children2='Đăng ký ôn' childrenPath1='/dang-ky-thi' childrenPath2='/dang-ky-khoa-on' />
              <NavButton content='Kết Quả' path='/ket-qua' />
              <NavButton content='Xác Thực' path='/xac-thuc-chung-chi' />
            </Box>
          )
          }

          {/* List Button Admin */}
          {isAdmin && (
            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'none',
                  md: 'none',
                  lg: 'flex',
                },
                alignItems: 'center',
                gap: 2,
                ml: 2
              }}
            >
              <NavButton content='Chứng Chỉ' path='/quan-ly-chung-chi' />
              <NavButton content='Người Dùng' path='/quan-ly-nguoi-dung' />
              <NavButton content='Kỳ Thi' path='/quan-ly-ky-thi' />
              <NavButton content='Khóa Ôn' path='/quan-ly-khoa-on' />
              <NavButton content='Kết quả' path='/quan-ly-ket-qua' />
            </Box>
          )
          }
        </Box>

        {/* Right */}
        <Box
          sx={{
            mx: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: '#f5f6fa'
          }}>
          <ModeSelector Input={theme.palette.mode} />
          <ProfileUser />
        </Box>
      </Box>
    </Box>
  )
}

export default NavBar
