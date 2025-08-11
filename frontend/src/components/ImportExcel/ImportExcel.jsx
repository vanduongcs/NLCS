import { useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Swal from 'sweetalert2'

function ImportExcel({ open, onClose, onImport, columnsCanEdit, pageContent }) {
  const [excelData, setExcelData] = useState([])
  const [fileName, setFileName] = useState('')
  const [errors, setErrors] = useState([])

  // ====== DATE HELPERS ======
  const excelSerialToISO = (num) => {
    const d = XLSX.SSF.parse_date_code(num)
    if (!d) return ''
    const y = d.y
    const m = String(d.m).padStart(2, '0')
    const day = String(d.d).padStart(2, '0')
    return `${y}-${m}-${day}` // ISO
  }

  const ddmmyyyyToISO = (str) => {
    const s = String(str ?? '').trim()
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (!m) return null
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
  }

  const normalizeDateToISO = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'number') return excelSerialToISO(value)
    const s = value.toString().trim()
    const asISO = ddmmyyyyToISO(s)
    if (asISO) return asISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    return s
  }

  const isoToDDMMYYYY = (iso) => {
    if (!iso) return ''
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(iso)) return iso
    const d = new Date(iso)
    if (isNaN(d)) return ''
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  // ====== TEXT-LIKE DETECTION & PADDING ======
  const isTextLike = (col) => {
    const label = (col.label || '').toLowerCase()
    const key = (col.key || '').toLowerCase()
    return (
      col.type === 'text' ||
      /cccd|căn\s*cước/.test(label) || /cccd|can\s*cuoc/.test(key) ||
      /sdt|số\s*điện\s*thoại|phone/.test(label) || /sdt|phone/.test(key) ||
      /mã|code/.test(label) || /ma|code/.test(key)
    )
  }

  // Suy đoán độ dài pad (phòng khi file nhập bị mất 0 do lưu dạng number)
  const guessPadLen = (col) => {
    const label = (col.label || '').toLowerCase()
    const key = (col.key || '').toLowerCase()
    if (/cccd|căn\s*cước/.test(label) || /cccd|can\s*cuoc/.test(key)) return 12 // CCCD VN = 12
    if (/sdt|số\s*điện\s*thoại|phone/.test(label) || /sdt|phone/.test(key)) return 10 // SDT phổ biến = 10
    return null
  }

  const toTextPreserveLeadingZeros = (val, col) => {
    if (val === undefined || val === null) return ''
    let s = String(val).trim()
    // Nếu Excel lưu dạng number, s sẽ không có 0 đầu. Ta pad theo ngữ cảnh nếu có.
    const padLen = guessPadLen(col)
    if (/^\d+$/.test(s) && padLen && s.length < padLen) {
      s = s.padStart(padLen, '0')
    }
    return s
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setFileName(file.name)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          setErrors(['File Excel phải có ít nhất 2 hàng (tiêu đề và dữ liệu)'])
          return
        }

        const headers = jsonData[0]
        const dataRows = jsonData.slice(1)
        
        const columnMapping = {}
        const validationErrors = []
        
        columnsCanEdit.forEach(col => {
          const headerIndex = headers.findIndex(h => 
            h && h.toString().toLowerCase().trim() === col.label.toLowerCase().trim()
          )
          if (headerIndex !== -1) {
            columnMapping[col.key] = headerIndex
          }
        })

        const parseDate = (value) => normalizeDateToISO(value)

        const processedData = dataRows.map((row, index) => {
          const processedRow = {}
          let hasData = false
          
          columnsCanEdit.forEach(col => {
            const cellIndex = columnMapping[col.key]
            let cellValue = cellIndex !== undefined ? row[cellIndex] : ''
            
            if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
              if (col.type === 'number') {
                const numVal = Number(cellValue)
                if (isNaN(numVal)) {
                  validationErrors.push(`Hàng ${index + 2}: ${col.label} phải là số`)
                } else {
                  cellValue = numVal
                  hasData = true
                }
              } else if (col.type === 'date') {
                cellValue = parseDate(cellValue) // -> ISO
                hasData = true
              } else {
                // text/select/autocomplete... luôn giữ chuỗi để không mất 0 đầu
                // Nếu Excel trả về number (do người dùng gõ lại sau khi xóa), convert + pad theo ngữ cảnh
                cellValue = toTextPreserveLeadingZeros(cellValue, col)
                hasData = true
              }
            }
            processedRow[col.key] = cellValue
          })
          
          return hasData ? processedRow : null
        }).filter(row => row !== null)

        if (validationErrors.length > 0) {
          setErrors(validationErrors)
          setExcelData([])
        } else {
          setErrors([])
          setExcelData(processedData)
        }
        
      } catch (error) {
        console.error('Lỗi đọc file Excel:', error)
        setErrors(['Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.'])
        setExcelData([])
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    if (excelData.length === 0) {
      Swal.fire('Lỗi', 'Không có dữ liệu để nhập', 'error')
      return
    }
    try {
      await onImport(excelData)
      handleClose()
    } catch (error) {
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi nhập dữ liệu', 'error')
    }
  }

  const handleClose = () => {
    setExcelData([])
    setFileName('')
    setErrors([])
    onClose()
  }

  // ====== TEMPLATE CREATION ======
  const handleDownloadTemplate = () => {
    try {
      const headers = columnsCanEdit.map(c => c.label)

      // Hàng ví dụ
      const sample = columnsCanEdit.map(c => {
        const key = (c.key || '').toLowerCase()
        const label = (c.label || '').toLowerCase()
        if (c.type === 'date') return '15/08/2025'
        if (c.type === 'number') return 30
        if (/cccd|căn\s*cước/.test(label) || /cccd|can\s*cuoc/.test(key)) return '084123456789' // 12 số
        if (/sdt|số\s*điện\s*thoại|phone/.test(label) || /sdt|phone/.test(key)) return '0912345678' // 10 số
        if (key === 'lichhoc') return 'T2 - T4 - T6'
        if (key === 'buoi') return 'Tối'
        return ''
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers, sample])

      // Đưa về phạm vi rộng + set width
      const totalRows = 1000
      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRows - 1, c: headers.length - 1 } })
      ws['!cols'] = headers.map(() => ({ wch: 18 }))

      // Với các cột text-like, đánh dấu ô rỗng dạng Text cho nhiều dòng
      const textColIdx = columnsCanEdit
        .map((c, idx) => (isTextLike(c) ? idx : -1))
        .filter(idx => idx >= 0)

      for (let r = 2; r <= totalRows; r++) {
        for (const cIdx of textColIdx) {
          const addr = XLSX.utils.encode_cell({ r: r - 1, c: cIdx })
          if (!ws[addr]) ws[addr] = { t: 's', v: '' }
          // Quan trọng: đặt định dạng Text để khi xóa rồi gõ lại vẫn giữ 0 đầu
          ws[addr].z = '@'
        }
      }

      // Ngoài ra, set định dạng Text cho HÀNG MẪU ở các cột text-like
      textColIdx.forEach((cIdx) => {
        const sampleAddr = XLSX.utils.encode_cell({ r: 1, c: cIdx })
        if (!ws[sampleAddr]) ws[sampleAddr] = { t: 's', v: '' }
        ws[sampleAddr].z = '@'
      })

      XLSX.utils.book_append_sheet(wb, ws, 'Mau')
      XLSX.writeFile(wb, `mau_import_${pageContent.replace(/\s+/g,'_')}.xlsx`)
    } catch (e) {
      console.error(e)
      Swal.fire('Lỗi', 'Không thể tạo file mẫu', 'error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Nhập dữ liệu từ Excel - {pageContent}</Typography>
          <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} onClick={handleDownloadTemplate}>
            Tải mẫu Excel
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Lưu ý:
            <br/>• Ngày trong file Excel nhập đúng dạng <b>DD/MM/YYYY</b> hoặc số serial date của Excel.
            <br/>• Các cột như <b>CCCD/SDT/Mã</b> đã được đặt định dạng <b>Text</b>. Bạn có thể xóa nội dung và gõ lại mà vẫn giữ <i>0 ở đầu</i>.
            <br/>• Nếu dán dữ liệu từ nơi khác mà Excel vẫn coi là số, hệ thống sẽ tự cố gắng giữ 0 đầu dựa vào loại cột.
          </Typography>
        </Box>

        <input
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          id="excel-file-input"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="excel-file-input">
          <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
            Chọn file Excel
          </Button>
        </label>
        {fileName && <Chip label={fileName} color="primary" variant="outlined" sx={{ ml: 2 }} />}

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <ul>
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </Alert>
        )}

        {excelData.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">
              Xem trước ({excelData.length} bản ghi):
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columnsCanEdit.map(col => (
                      <TableCell key={col.key}>{col.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excelData.map((row, i) => (
                    <TableRow key={i}>
                      {columnsCanEdit.map(col => (
                        <TableCell key={col.key}>
                          {col.type === 'date' ? isoToDDMMYYYY(row[col.key]) : row[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button variant="contained" onClick={handleImport} disabled={excelData.length === 0}>
          Nhập ({excelData.length} bản ghi)
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportExcel
