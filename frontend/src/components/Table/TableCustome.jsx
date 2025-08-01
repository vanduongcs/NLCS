import { useState, useEffect } from 'react'

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

  // Tự động chọn cột đầu tiên hợp lệ nếu chưa chọn
  useEffect(() => {
    if (!selectedColumn) {
      const firstVisibleColumn = columns.find(col => !col.isAction)
      if (firstVisibleColumn) {
        setSelectedColumn(firstVisibleColumn.key)
      }
    }
  }, [columns, selectedColumn])

  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    const date = new Date(dateValue)
    if (isNaN(date)) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const isDateColumn = (columnKey) => {
    const column = columns.find(col => col.key === columnKey)
    return column?.isDate
  }

  const removeAccents = (str) =>
    str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredRows = rows.filter(row => {
    if (!searchText || !selectedColumn) return true

    const column = columns.find(col => col.key === selectedColumn)
    if (!column || column.isAction) return true // Không lọc theo cột không hợp lệ

    const rawValue = row[selectedColumn]
    const searchValue = column?.customSearchValue
      ? column.customSearchValue(row)
      : rawValue

    if (!searchValue) return false

    const compareValue = isDateColumn(selectedColumn)
      ? formatDate(searchValue)
      : searchValue.toString()

    return removeAccents(compareValue).includes(removeAccents(searchText.trim()))
  })

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Box>
      {/* Search & Filter */}
      <Box sx={{ mt: 2, mb: '4px', display: 'flex', gap: 2 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            setPage(1)
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="column-select-label">Cột</InputLabel>
          <Select
            labelId="column-select-label"
            id="column-select"
            value={selectedColumn}
            label="Cột"
            onChange={(e) => {
              setSelectedColumn(e.target.value)
              setPage(1)
            }}
          >
            {columns.filter(col => !col.isAction).map((col) => (
              <MenuItem key={col.key} value={col.key}>{col.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer
        sx={{
          borderRadius: 2,
          bgcolor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 10px rgba(243, 243, 243, 0.31)' : 12,
        }}>
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
          onChange={(e, val) => setPage(val)}
          count={totalPages}
          color="primary"
        />
      </Box>
    </Box>
  )
}

export default TableCustome
