import { useColorScheme } from '@mui/material'

// MUI
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import IconButton from '@mui/material/IconButton'

function ModeSelector() {

  const { mode, setMode } = useColorScheme()

  const handleChangeMode = () => {
    mode == 'light' ? setMode('dark') : setMode('light')
  }

  const modeIcon = mode === 'light'? <LightModeIcon /> : <DarkModeIcon />

  return (
    <IconButton
      value= { mode }
      onClick={ handleChangeMode }
      sx={{ color: '#f5f6fa' }}
    >
      { modeIcon }
    </IconButton>
  )
}

export default ModeSelector
