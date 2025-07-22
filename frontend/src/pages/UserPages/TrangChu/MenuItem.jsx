import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

function MenuItem({ IconComponent, Content, Route }) {
  const navigate = useNavigate()

  const ButtonStyle = {
    display: 'block',
    textAlign: 'center',
    cursor: 'pointer',
  }

  const IconStyle = { fontSize: 128, color: (theme) => theme.palette.info.main }

  const TextStyle = { textAlign: 'center' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <IconButton
        onClick={() => navigate(Route)}
        sx={ ButtonStyle }
      >
        <IconComponent sx={ IconStyle } />
      </IconButton>
      <Typography variant='h6' sx={ TextStyle }>{ Content }</Typography>
    </Box>
  )
}


export default MenuItem
