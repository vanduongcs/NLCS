import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function TCBanner() {
  const ContainerStyle = {
    bgcolor: (theme) => theme.palette.background.paper,
    width: '100%',
    maxWidth: '1500px',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    p: 2,
  }

  return (
    <Box sx={ ContainerStyle }>
        <Box sx={{ width: '50%', ml: 4 }}>

          <Typography variant='h4' sx={{ fontWeight: 'bold', color: (theme) => theme.palette.info.dark }}>Trung tâm ngoại ngữ - tin học</Typography>

          <Typography sx={{ mt: 2 }}>Tổ chức ôn luyện bài bản, sát với nội dung thi thực tế.</Typography>

          <Typography sx={{ mt: 2 }}>Hỗ trợ đăng ký, xác minh chứng chỉ nhanh chóng, tiện lợi.</Typography>

          <Typography sx={{ mt: 2 }}>Nền tảng trực tuyến, tài liệu bổ sung, giảng viên chuyên nghiệp hỗ trợ học viên 24/7.</Typography>
          
        </Box>

        <Box sx={{ width: '40%' }}>
          <img
            src='/HomePageBanner.png'
            alt='Banner'
            style={{
              height: '350px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        </Box>
      </Box>
  )
}

export default TCBanner
