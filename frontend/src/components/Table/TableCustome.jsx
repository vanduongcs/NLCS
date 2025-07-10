import { useState } from 'react'

// MUI
import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import Pagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

// Custom
import TableHeaderCustome from './TableHeaderCustome.jsx'
import TableBodyCustome from './TableBodyCustome.jsx'

function TableCustome({ columns, rows, handleDelete, handleEdit }) {
  const [searchText, setSearchText] = useState('')
  const [selectedColumn, setSelectedColumn] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  // Hàm định dạng ngày giờ thành DD/MM/YYYY
  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const date = new Date(dateValue)
    if (isNaN(date)) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Hàm kiểm tra cột có phải là ngày giờ không
  const isDateColumn = (columnKey) => {
    const column = columns.find(col => col.key === columnKey)
    return column && column.isDate
  }

  // Hàm lọc dữ liệu theo search và cột được chọn
  const filteredRows = rows.filter(row => {
    if (!searchText) return true // Không lọc nếu searchText rỗng
    if (selectedColumn) {
      const value = row[selectedColumn]
      if (!value) return false
      return isDateColumn(selectedColumn)
        ? formatDate(value).toLowerCase().includes(searchText.toLowerCase())
        : value.toString().toLowerCase().includes(searchText.toLowerCase())
    }
    return Object.keys(row).some(key => {
      const value = row[key]
      if (!value || columns.find(col => col.key === key)?.isAction) return false
      return isDateColumn(key)
        ? formatDate(value).toLowerCase().includes(searchText.toLowerCase())
        : value.toString().toLowerCase().includes(searchText.toLowerCase())
    })
  })

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value)
    setPage(1)
  }

  return (
    <Box>
      {/* Search and Column Select */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            setPage(1)
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: (theme) => theme.palette.text.primary,
              '& fieldset': {
                borderColor: (theme) => theme.palette.text.primary
              },
              '&:hover fieldset': {
                borderColor: (theme) => theme.palette.text.primary
              },
              '&.Mui-focused fieldset': {
                borderColor: (theme) => theme.palette.text.primary
              }
            },
            '& .MuiInputLabel-root': {
              color: (theme) => theme.palette.text.primary
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: (theme) => theme.palette.text.primary
            }
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="column-select-label">Cột</InputLabel>
          <Select
            labelId="column-select-label"
            id="column-select"
            value={selectedColumn}
            label="Cột"
            onChange={handleColumnChange}
            sx={{
              color: (theme) => theme.palette.text.primary,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.text.primary
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.text.primary
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.text.primary
              }
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {columns
              .filter(column => !column.isAction)
              .map((column) => (
                <MenuItem key={column.key} value={column.key}>
                  {column.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          bgcolor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 4px 10px rgba(243, 243, 243, 0.31)' : 12,
          borderRadius: 2
        }}
      >
        <Table>
          <TableHeaderCustome columns={columns} />
          <TableBodyCustome
            rows={paginatedRows}
            columns={columns}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          page={page}
          onChange={handlePageChange}
          count={totalPages}
          color="primary"
        />
      </Box>
    </Box>
  )
}

export default TableCustome