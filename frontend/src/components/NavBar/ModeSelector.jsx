import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useColorScheme } from '@mui/material'

function ModeSelector() {
  const {mode, setMode} = useColorScheme()

  const handleClick = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode)
  }
  return (
    <Button onClick={handleClick} value={mode} variant='contained'>
      {mode == 'light' ? 'Light' : 'Dark'}
    </Button>
  )
}

export default ModeSelector