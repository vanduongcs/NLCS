import React, { useEffect } from 'react'
import Box from '@mui/material/Box'

import RegisterForm from '../../components/RegisterForm/RegisterForm.jsx'

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
      <RegisterForm />
    </Box>
  )
}

export default DangNhap