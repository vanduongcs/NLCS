import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import TableCustome from '../Table/TableCustome.jsx'
import FieldCustome from '../FieldCustome/FieldCustome.jsx'

function RelatedDataModal({
  open,
  onClose,
  dataNeeded,
  modalOptions,
  type,
  title,
  data,
  columns,
  onAdd,
  onDelete,
  onUpdateOptions
}) {
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [columnResetKey, setColumnResetKey] = useState(0)

  // Reset key khi modal mở
  useEffect(() => {
    if (open) {
      setColumnResetKey(prev => prev + 1)
      // Reset selected ID khi mở modal
      setSelectedId('')
    }
  }, [open, columns])

  // Xác định options dựa vào type và các collection đã có
  let label = ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (type === 'KhoaHocDaThamGia') {
    label = 'Chọn khóa học'
  }
  else if (type === 'KyThiDaThamGia') {
    label = 'Chọn kỳ thi'
  }
  else if (type === 'ChungChiDaNhan') {
    label = 'Chọn chứng chỉ'
  }
  else if (type === 'IDTaiKhoan') {
    label = 'Chọn tài khoản'
  }

  const handleAddClick = () => {
    setSelectedId('')
    setSubModalOpen(true)
  }

  const handleSubModalClose = () => {
    setSubModalOpen(false)
    setSelectedId('')
  }

  const handleAddConfirm = async () => {
    if (selectedId) {
      try {
        await onAdd(dataNeeded, type, selectedId)
        // Gọi callback để cập nhật options
        if (onUpdateOptions) {
          onUpdateOptions(type, selectedId)
        }
        // Không đóng modal con 
        setSelectedId('') // Reset selected value để có thể chọn option khác
      } catch (error) {
        console.error('Lỗi khi thêm:', error)
      }
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='xl'
        fullWidth
        sx={type === 'LichSu' ? {
          '& .MuiDialog-paper': {
            minWidth: '95vw',
            minHeight: '85vh'
          }
        } : {}}
      >
        <DialogTitle>
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {/* Chỉ hiển thị nút Add khi không phải là LichSu */}
          {type !== 'LichSu' && (
            <IconButton
              onClick={handleAddClick}
              sx={{ position: 'absolute', right: 48, top: 8 }}
            >
              <AddIcon color={"primary"} />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={type === 'LichSu' ? { padding: '16px' } : {}}>
          <TableCustome
            key={columnResetKey}
            columns={[
              ...columns.map(col => {
                // Nếu là lịch sử và cột DLTruoc/DLSau, thêm styling đặc biệt
                if (type === 'LichSu' && (col.key === 'DLTruoc' || col.key === 'DLSau')) {
                  return {
                    ...col,
                    render: (value) => (
                      <Box sx={{
                        maxWidth: '300px',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.875rem'
                      }}>
                        {value}
                      </Box>
                    )
                  }
                }
                return col
              }),
              // Chỉ hiển thị cột actions khi không phải là LichSu
              ...(type !== 'LichSu' ? [{
                label: 'Thao tác',
                key: 'actions',
                isAction: true,
                render: (value, row) => (
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      onClick={() => onDelete(row, dataNeeded, type)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )
              }] : [])
            ]}
            rows={data}
            handleDelete={(row) => onDelete(row, dataNeeded, type)}
          />
        </DialogContent>
      </Dialog>

      {/* Chỉ hiển thị sub modal khi không phải là LichSu */}
      {type !== 'LichSu' && (
        <Dialog open={subModalOpen} onClose={handleSubModalClose}>
          <DialogTitle>Thêm {title}</DialogTitle>
          <DialogContent>
            <FieldCustome
              label={label}
              val={selectedId}
              func={setSelectedId}
              type="autocomplete"
              options={modalOptions}
            />
            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={handleSubModalClose}>Hủy</Button>
              <Button
                onClick={handleAddConfirm}
                variant="contained"
                disabled={!selectedId}
              >
                Thêm
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default RelatedDataModal
