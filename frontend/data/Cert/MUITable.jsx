import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function MUITable({ certificates }) {
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
