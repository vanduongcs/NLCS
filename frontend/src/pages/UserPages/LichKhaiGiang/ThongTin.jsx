import { Box, Typography } from '@mui/material'

function ThongTin() {
  const ContainerStyle = {
    mb: 5,
    p: 2,
    border: `1px solid ${(theme) => theme.palette.divider}`,
    borderRadius: 2, 
    bgcolor: (theme) => theme.palette.background.paper
  }
  
  return (
    <Box sx={ ContainerStyle }>
        <Typography variant="h6" gutterBottom><strong>Địa điểm học:</strong> Tầng 2 - tầng 4 tại trung tâm ngoại ngữ - tin học.</Typography>

        <Typography variant="h6" gutterBottom><strong>Thời gian học: </strong><strong>Chiều:</strong> 18:00 <strong>Tối:</strong> 19:50</Typography>

        <Typography variant="h6" gutterBottom><strong>Buổi học</strong></Typography>
        <Typography>
          <strong>1.</strong> T2 - T4 - T6 <br />
          <strong>2.</strong> T3 - T5 - T7 <br />
        </Typography>
      </Box>
  )
}

export default ThongTin
