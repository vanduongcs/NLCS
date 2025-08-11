import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TableCustome from '../../Table/TableCustome.jsx'
import CodeIcon from '@mui/icons-material/Code'
import CodeOffIcon from '@mui/icons-material/CodeOff'

function PageComponent({
  columns,
  rows,
  columnsCanEdit,
  formStates,
  pageContent,
  handleAdd,
  handleDelete,
  handleEdit,
  isEditing,
  handleUpdate,
  resetForm,
  FormName,
  onImportExcel
}) {
  const [showForm, setShowForm] = useState(true)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        minHeight: '85vh',
        width: '100%',
        bgcolor: (theme) => theme.palette.background.default
      }}
    >
      {/* Table */}
      <Box sx={{ m: '1%', width: showForm ? '80%' : '98%' }}>
        <TableCustome
          columns={columns}
          rows={rows}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
      </Box>

      {/* Bên phải */}
      <Box
        sx={{
          m: '1% 1% 1% 0',
          width: showForm ? '20%' : 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        {/* Nút ẩn/hiện form */}
        <IconButton
          size="small"
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? <CodeOffIcon /> : <CodeIcon />}
        </IconButton>

        {/* Form */}
        {showForm && (
          <Box sx={{ width: '100%' }}>
            <FormName
              formStates={formStates}
              columnsCanEdit={columnsCanEdit}
              pageContent={pageContent}
              handleAdd={handleAdd}
              handleUpdate={handleUpdate}
              isEditing={isEditing}
              resetForm={resetForm}
              onImportExcel={onImportExcel}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default PageComponent
