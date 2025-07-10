// MUI
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

function GTRButton({ content, submitFunction }) {

  return (
    <Button variant="text" sx={{ opacity: 1, width: '50%' }} onClick={ submitFunction }>
      <Typography sx={{ px: 2, py: 0.25, m: 0, fontWeight: 'bold', color: (theme) => theme.palette.info.main }} variant="button" gutterBottom>
        { content }
      </Typography>
    </Button>
  )
}

export default GTRButton
