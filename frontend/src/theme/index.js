import { createTheme } from '@mui/material/styles'
import palette from './palette'
// import typography from './typography'
// import components from './components'

const getTheme = (mode = 'light') => {
  return createTheme({
    palette: palette(mode),
    // typography,
    // components,
    shape: {
      borderRadius: 10,
    }
  })
}

export default getTheme
