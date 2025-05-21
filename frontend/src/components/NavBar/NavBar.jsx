import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import ExtendMenu from './ExtendMenu.jsx'
import Typography from '@mui/material/Typography'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import IconButton from '@mui/material/IconButton'
import { useEffect } from 'react'
import ModeSelector from './ModeSelector.jsx'

const sxStyle = {
  fontWeight: 'bold',
  color: '#f5f6fa',
  textTransform: 'none',
  m: '0 0.25rem',
}

const setMarginZero = {
  m: 0
}

function NavBar() {
  const navigate = useNavigate()
  const navButtonFontSize = 'h7'

  useEffect(() => {
      const loginState = localStorage.getItem('loginState')
      if (loginState == 'false') {
        navigate('/')
      }
    }, [navigate])
  
  const handleLogOut = () => {
    localStorage.setItem('loginState', 'false')
    navigate('/')
  }

  return (
    <Box
    sx={{
      height: '60px',
      padding: 1,
      bgcolor: '#0a60a6',
      justifyContent: 'space-between',
      display: 'flex'
    }}>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            gap: 2
          }}
        >
          {/* svg logo */}
          <Box
            sx={{
              height: '100%'
            }}
          >
            <img 
            style={{
               height: '100%',
               cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
            src='/Logo.svg'
            alt='logo'
            />
          </Box>
          {/* button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}>
            <ExtendMenu />
            <Box
              sx={{
                [`@media (max-width:810px)`]: {
                  display: 'none'
                }
              }}>
              <Button 
                onClick={() => {navigate('/')}} sx={sxStyle}>
                  <Typography 
                    variant={navButtonFontSize} 
                    sx={setMarginZero}
                    gutterBottom
                  >
                    Trang Chủ
                  </Typography>
              </Button>

              <Button
                onClick={() => {navigate('/xac-thuc-chung-chi')}} sx={sxStyle}>
                  <Typography 
                    variant={navButtonFontSize} 
                    sx={setMarginZero}
                    gutterBottom
                  >
                    Xác Thực
                  </Typography>
              </Button>
              <Button
                onClick={() => {navigate('/thong-tin-chung')}} sx={sxStyle}>
                  <Typography 
                    variant={navButtonFontSize} 
                    sx={setMarginZero}
                    gutterBottom
                  >
                    Thông Tin Chung
                  </Typography>
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            height: '100%',
            display: 'flex',
            gap: 2
          }}
        >
          <ModeSelector />
          <IconButton>
            <ExitToAppIcon onClick={handleLogOut}/>
          </IconButton>
        </Box>
    </Box>
  )
}

export default NavBar
