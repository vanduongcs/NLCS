// MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Custome
import FieldCustome from '../FieldCustome/FieldCustome.jsx'

function ResultForm({ columnsCanEdit, formStates, pageContent, handleAdd, handleUpdate, isEditing, resetForm }) {
  return (
    <Box
      sx={{
        bgcolor: (theme) => theme.palette.background.paper,
        boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 10px rgba(243, 243, 243, 0.31)' : 12,
        p: '10% 10%',
        mt: '72px',
        minHeight: '85.15%',
        textAlign: 'center',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', cursor: 'default' }}>Quản lý {pageContent}</Typography>
        {columnsCanEdit.map((col) => (
          <FieldCustome
            key={col.key}
            label={col.label}
            val={formStates[col.key]}
            func={formStates['Set' + col.key]}
            type={col.type}
            options={col.options}
            multiple={col.multiple}
          />
        ))}
        
        <Button sx={{ mt: '20px', width: '50%' }} onClick={ handleAdd } variant="contained" disabled={isEditing}>Thêm</Button>

        <Button sx={{ mt: '10px', width: '50%' }} onClick={ handleUpdate } variant="contained" disabled={!isEditing} color="success">Cập nhật</Button>

        <Button sx={{ mt: '10px', width: '50%'}} onClick={ resetForm } variant='contained' color="error">Hủy</Button>
      </Box>
    </Box>
  )
}

export default ResultForm