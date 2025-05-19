import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import EditSquareIcon from '@mui/icons-material/EditSquare'
import DeleteIcon from '@mui/icons-material/Delete'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import CertEditModal from './CertEditModal'

export default function MUITable({ certificates, fetchCerts }) {

  const [editCert, setEditCert] = React.useState(false)

  const handleEdit = (row) => {
    setEditCert(row)
  }

  const handleClose = () => setEditCert(null)

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:2025/api/certificates/${editCert._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Ten: editCert.Ten,
        }),
      });

      if (res.ok) {
        setEditCert(null);
        fetchCerts(); // reload danh sách
      } else {
        console.error('Không thể cập nhật');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:2025/api/certificates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCerts(); // reload danh sách 
      } else {
        console.error('Không thể xóa');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err); 
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="certificate table">
        <TableHead>
          <TableRow>
            <TableCell>Tên</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Mã Số</TableCell>
            <TableCell>Điểm Tổng Kết</TableCell>
            <TableCell>Ngày Cấp</TableCell>
            <TableCell>Hạng</TableCell>
            <TableCell>Sửa</TableCell>
            <TableCell>Xóa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {certificates.map((row) => (
            <TableRow key={row._id}>
              <TableCell>{row.Ten}</TableCell>
              <TableCell>{row.Loai}</TableCell>
              <TableCell>{row.MaSo}</TableCell>
              <TableCell>{row.Diem_TK}</TableCell>
              <TableCell>{new Date(row.NgayCap).toLocaleDateString()}</TableCell>
              <TableCell>{row.Hang}</TableCell>
              <TableCell>
                <EditSquareIcon 
                onClick={() => handleEdit(row)}
                sx={{
                  cursor: 'pointer'
                }}
                />
              </TableCell>
              <TableCell>
                <DeleteIcon 
                sx={{
                  cursor: 'pointer'
                }}
                onClick={() => handleDelete(row._id)}/>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editCert && (
        <CertEditModal certificate={editCert} onClose={handleClose} setEditCert={setEditCert} handleUpdate = { handleUpdate }/>
      )}
    </TableContainer>
  );
}
