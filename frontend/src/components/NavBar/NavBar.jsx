import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import palette from '../../theme/palette.js'
import { useNavigate } from 'react-router-dom'
import ExtendMenu from './ExtendMenu.jsx'

const colors = palette('dark')

const sxStyle = {
  fontWeight: 'bold',
  color: colors.text.primary,
  textTransform: 'none'
}

function NavBar() {
  const navigate = useNavigate()

  return (
    <Box
    sx={{
      height: '60px',
      padding: 1,
      bgcolor: colors.background.navBar,
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
              gap: 2
            }}>
            <ExtendMenu />
            <Button 
              onClick={() => {navigate('/')}} sx={sxStyle}>Trang Chủ
            </Button>

            <Button
              onClick={() => {navigate('/xac-thuc-chung-chi')}} sx={sxStyle}>Xác Thực

            </Button>
            <Button
              onClick={() => {navigate('/thong-tin-chung')}} sx={sxStyle}>Thông Tin Chung
            </Button>
          </Box>
        </Box>

        <Box>
b
        </Box>
    </Box>
  )
}

export default NavBar
