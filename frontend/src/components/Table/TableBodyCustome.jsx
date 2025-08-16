import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

function formatDateToGMT7(date) {
  if (!date) return '___'
  const utc = new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000
  const gmt7Date = new Date(utc + 7 * 3600000)
  const ss = String(gmt7Date.getSeconds()).padStart(2, '0')
  const mm = String(gmt7Date.getMinutes()).padStart(2, '0')
  const hh = String(gmt7Date.getHours()).padStart(2, '0')
  const dd = String(gmt7Date.getDate()).padStart(2, '0')
  const MM = String(gmt7Date.getMonth() + 1).padStart(2, '0')
  const yyyy = gmt7Date.getFullYear()
  return `[${hh}:${mm}:${ss}]  ${dd}/${MM}/${yyyy}`
}

function formatOnlyDate(date) {
  if (!date) return '___'
  const d = new Date(date)
  const dd = String(d.getDate()).padStart(2, '0')
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${MM}/${yyyy}`
}

function TableBodyCustome({ rows, columns, handleDelete, handleEdit }) {
  return (
    <TableBody>
      {rows.map((row, rowIndex) => (
        <TableRow key={row._id || `row-${rowIndex}`}>
          {columns.map((column, colIndex) => {
            let content = '___'

            if (column.isAction === 'edit') {
              content = (
                <EditIcon
                  sx={{ cursor: 'pointer', color: (theme) => theme.palette.primary.main }}
                  onClick={() => handleEdit(row)}
                />
              )
            } else if (column.isAction === 'delete') {
              content = (
                <DeleteIcon
                  sx={{ cursor: 'pointer', color: (theme) => theme.palette.error.main }}
                  onClick={() => handleDelete(row._id)}
                />
              )
            } else if (column.render) {
              content = column.render(row[column.key], row)
            } else if (Array.isArray(row[column.key])) {
              content = row[column.key].map((item, i) => (
                <span key={`${row._id || `row-${rowIndex}`}-${column.key}-${i}`}>
                  {`[${item}]${i < row[column.key].length - 1 ? ', ' : '___'}`}
                </span>
              ))
            } else if (column.key === 'NgayHetHan') {
              content =
                row[column.key] === undefined || row[column.key] === null || row[column.key] === 0 || row[column.key] === '___'
                  ? 'Vô thời hạn'
                  : formatOnlyDate(row[column.key])
            } else if (column.key === 'ThoiHan') {
              content =
                row[column.key] === undefined || row[column.key] === null || row[column.key] === 0 || row[column.key] === '___'
                  ? 'Vô thời hạn'
                  : `${row[column.key]} năm`
            } else if (column.isDate) {
              content =
                column.key === 'createdAt' || column.key === 'updatedAt'
                  ? formatDateToGMT7(row[column.key])
                  : formatOnlyDate(row[column.key])
            } else {
              content = row[column.key] !== undefined && row[column.key] !== null ? row[column.key] : '___'
            }

            return (
              <TableCell
                key={`${row._id || `row-${rowIndex}`}-${column.key}-${colIndex}`}
                align={column.isDate ? 'center' : (column.align || 'left')}
              >
                {content}
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default TableBodyCustome