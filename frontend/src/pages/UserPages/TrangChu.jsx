import { useEffect } from 'react'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'

function TrangChu() {

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'red',
          width: '100%',
          height: '400px'
        }}>
          <Box sx={{width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Box sx={{ width: '60%', m: '1% 0% 1% 10%'}}>
              <Typography>Trung tâm ngoại ngữ - tin học</Typography>
              <Typography>Tổ chức giảng dạy bài bản, sát với đề thi thực tế.</Typography>
              <Typography>Hỗ trợ đăng ký thi nhanh chóng - tiện lợi.</Typography>
              <Typography>Đội ngũ giảng viên chất lượng, giàu kinh nghiệm.</Typography>
            </Box>
            <Box>
              <img style={{height: '300px'}} src="/public/HomePageBanner.png" alt="" />
            </Box>
          </Box>
      </Box>
    </Box>
  )
}

export default TrangChu
