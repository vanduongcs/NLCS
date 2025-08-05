import React from 'react'
import { Box, Typography } from '@mui/material'

const LTBanner = () => {
  return (
    <Box sx={{
      mb: 4,
      p: 2,
      bgcolor: (theme) => theme.palette.warning.light,
      borderRadius: 2,
      border: `1px solid ${(theme) => theme.palette.warning.main}`
    }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Thông báo</Typography>
      <Typography variant="body2">
        Thí sinh vui lòng kiểm tra kỹ thông tin cá nhân và email xác nhận sau khi đăng ký.
      </Typography>
    </Box>
  )
}

export default LTBanner
