import { useEffect } from 'react'
import Box from '@mui/material/Box'

import LoginForm from '../../components/LoginForm/LoginForm.jsx'

function DangNhap() {

  return (
    <Box sx={{
      backgroundImage: 'url(/loginBackground.jpg)',
      backgroundPosition: 'center',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LoginForm />
    </Box>
  )
}

export default DangNhap