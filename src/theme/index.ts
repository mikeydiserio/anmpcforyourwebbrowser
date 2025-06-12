import { createTheme } from '@mui/material'

export const theme = createTheme({
  components: {
    // Name of the component ⚛️
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Raleway',
          letterSpacing: '1px',
          height: '3.5rem',
          background: 'salmon',
          color: 'white',
          textAlign: 'center',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          display: 'flex',
          flexDirection: 'row',
          fontSize: '1rem',
          fontFamily: 'Raleway',
          colorDefault: 'white',
          colorPrimary: 'black',
          colorSecondary: 'salmon',
          background: 'salmon',
          height: '96px',
          width: '100%',
          overflow: 'hidden',
          transition: 'example 5s linear',
        },
      },
    },
  },
})
