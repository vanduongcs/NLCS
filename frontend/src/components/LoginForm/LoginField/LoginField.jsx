// MUI
import TextField from '@mui/material/TextField'

function LoginField({ fieldSet, input1, setFunction, submitFunction, type}) {

  const inputStyle = {
    width: '63%',
    input: { color: '#000' },
    label: { color: '#000' },
    '& .MuiInput-underline:before': { borderBottomColor: '#000' },
    '& .MuiInput-underline:hover:before': { borderBottomColor: '#000' },
    '& .MuiInput-underline:after': { borderBottomColor: '#000' },
    '& label.Mui-focused': { color: '#000' }
  }

  return (
    <TextField label = { fieldSet } variant='standard' 
      sx={inputStyle}
      value={ input1 } 
      onChange={(e) => setFunction(e.target.value)}
      onKeyDown = { submitFunction }
      type={ type }
      autoComplete='off'
    />
  )
}

export default LoginField
