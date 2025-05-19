import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  color: 'black'
};

function CertEditModal({ certificate, onClose, setEditCert, handleUpdate }) {
  return (
    <Modal
        open={true}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Chỉnh sửa chứng chỉ
        </Typography>
        <form onSubmit={handleUpdate}>
          <input
          type="text"
          value={certificate.Ten}
          onChange={(e) =>
            setEditCert({ ...certificate, Ten: e.target.value })
          }
          required
          />
          <button type="submit">Lưu</button>
        </form>
      </Box>
    </Modal>
  )
}

export default CertEditModal
