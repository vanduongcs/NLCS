import React from 'react'
import Box from '@mui/material/Box'
import palette from '../../theme/palette.js'

const colors = palette('dark')

function TCContent() {
  return (
    <Box
    sx={{
      height: 'calc(100vh - 60px)',
      bgcolor: colors.background.body
    }}>
      
    </Box>
  )
}

export default TCContent
