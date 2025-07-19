import React from 'react'
import Box from '@mui/material/Box'
import RegisterForm from '../../components/RegisterForm/RegisterForm.jsx'

function DangKy() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/loginBackground.jpg)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <RegisterForm />
    </Box>
  )
}

export default DangKy