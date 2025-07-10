import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// MUI
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

const buttonStyle = {
  color: '#f5f6fa',
  borderColor: '#f5f6fa',
  height: '35px',
  fontWeight: 'bold',
  '&:hover': {
    bgcolor: '#0f477d'
  },
  textTransform: 'none',
  alignItems: 'center',
        display: {
          xs: 'none',
          sm: 'none',
          md: 'none',
          lg: 'inline-block'
        }
}

function NavButton({ content, icon, children1, children2, path, childrenPath1, childrenPath2 }) {

  const [anchorEl, setAnchorEl] = useState(null)

  const navigate = useNavigate()
  
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    if(!path) {
      setAnchorEl(event.currentTarget)
    }
    else {
      navigate(`${path}`)
    }
  }

  const handleClose = (path) => {
    navigate(path) 
    setAnchorEl(null) 
  } 

  return (
    <Box>
      <Button 
          id='basic-button'
          aria-controls={ open ? 'basic-menu' : undefined }
          aria-haspopup='true'
          aria-expanded={ open ? 'true' : undefined }
          onClick={ handleClick }
          variant='text'
          sx={ buttonStyle }>
        { content || icon }
      </Button>

      {children1 && (<Menu
        anchorEl={ anchorEl }
        open={ open }
        disableScrollLock={true}
        onClose={ () => setAnchorEl(null) }
        sx={{ mt: 1.5, p: 0 }}
      >
          { children1 && (
          <MenuItem sx={{ padding: '9px 16px 14px 16px'}} onClick={() => handleClose(childrenPath1)}>{children1}</MenuItem>
          )}
          { children2 && (
          <MenuItem sx={{padding: '14px 16px 9px 16px'}} onClick={() => handleClose(childrenPath2)}>{children2}</MenuItem>
          )}
      </Menu>)}
    </Box>
  )
}

export default NavButton
