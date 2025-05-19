const palette = (mode) => ({
  mode,
  ...(mode === 'light'
    ? {
        // Light mode colors
        primary: {
          main: '#1976d2',
        },
        background: {
          default: '#18230F',
          paper: '#f5f6fa',
        },
        text: {
          primary: '#000000',
          secondary: '#555555',
        },
      }
    : {
        // Dark mode colors
        primary: {
          main: '#90caf9',
        },
        background: {
          default: '#0a60a6',
          navBar: '#0a60a6',
          body: '#1e1e1e'
        },
        text: {
          primary: '#f5f6fa',
          secondary: '#aaaaaa',
        },
      }),
});

export default palette;
