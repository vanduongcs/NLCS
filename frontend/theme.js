import { experimental_extendTheme as extendTheme } from '@mui/material/styles'


const NAV_BAR_HEIGHT = '60px'
const FOOTER_HEIGHT = '350px'

const theme = extendTheme({
  nlcs: {
    navBarHeight: NAV_BAR_HEIGHT,
    footerHeight: FOOTER_HEIGHT,
    light: {
      main: 'red'
    },
    dark: {
      main: '#0f154263'
    }
  },
  colorSchemes: {
    dark: true,
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#1976d2'
        },
        background: {
          default: '#f5f5f5',
          paper: '#fff'
        },
        text: {
          primary: '#000',
          secondary: '#555'
        }
      }
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#90caf9'
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e'
        },
        text: {
          primary: '#fff',
          secondary: '#bbb'
        }
      }
    }
  }
})

export default theme