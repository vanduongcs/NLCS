import Box from '@mui/material/Box'
import LoginForm from '../../components/LoginForm/LoginForm.jsx'

function DangNhap() {
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
      <LoginForm />
    </Box>
  )
}

export default DangNhap