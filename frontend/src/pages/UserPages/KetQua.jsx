import React, { useState } from 'react'
import {
  Box, TextField, Typography, Button, Paper, Grid, Divider
} from '@mui/material'
import Swal from 'sweetalert2'
import axios from 'axios'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, '0')
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${MM}/${yyyy}`
}

function renderRow(label, value) {
  return (
    <>
      <Grid item xs={4}><strong>{label}:</strong></Grid>
      <Grid item xs={8}>{value || '---'}</Grid>
    </>
  )
}

function KetQua() {
  const [cccd, setCccd] = useState('')
  const [tenKyThi, setTenKyThi] = useState('')
  const [result, setResult] = useState(null)

  const handleSearch = async () => {
    if (!cccd.trim() || !tenKyThi.trim()) {
      return Swal.fire('Vui lòng nhập đủ CCCD và tên kỳ thi', '', 'warning')
    }

    try {
      const [accountsRes, examsRes, resultsRes] = await Promise.all([
        axios.get('http://localhost:2025/api/account/tat-ca-tai-khoan'),
        axios.get('http://localhost:2025/api/exam/tat-ca-dot-thi'),
        axios.get('http://localhost:2025/api/result/tat-ca-ket-qua')
      ])

      const acc = accountsRes.data.find(a => a.CCCD?.trim() === cccd.trim())
      if (!acc) return Swal.fire('Không tìm thấy tài khoản với CCCD này', '', 'error')

      const exam = examsRes.data.find(e => e.TenKyThi?.trim().toLowerCase() === tenKyThi.trim().toLowerCase())
      if (!exam) return Swal.fire('Không tìm thấy kỳ thi với tên này', '', 'error')

      const r = resultsRes.data.find(res =>
        res.IDNguoiDung?._id === acc._id && res.IDKyThi?._id === exam._id
      )
      if (!r) return Swal.fire('Không tìm thấy kết quả thi phù hợp', '', 'info')

      setResult({
        hoTen: acc.TenHienThi,
        cccd: acc.CCCD,
        tenKyThi: exam.TenKyThi,
        ngayThi: formatDate(exam.NgayThi),
        buoi: exam.Buoi,
        diem1: r.Diem1,
        diem2: r.Diem2,
        diem3: r.Diem3,
        diem4: r.Diem4,
        diemTK: r.DiemTK,
        ngayCap: formatDate(r.NgayCap),
        trangThai: r.TrangThai
      })
    } catch (err) {
      console.error(err)
      Swal.fire('Lỗi xử lý dữ liệu', 'Vui lòng thử lại sau', 'error')
    }
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Tra cứu kết quả thi
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="CCCD"
          value={cccd}
          onChange={(e) => setCccd(e.target.value)}
        />
        <TextField
          label="Tên kỳ thi"
          value={tenKyThi}
          onChange={(e) => setTenKyThi(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Tra cứu
        </Button>
      </Box>

      {result && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Kết quả:</Typography>

          <Grid container spacing={1}>
            {renderRow('Họ tên', result.hoTen)}
            {renderRow('CCCD', result.cccd)}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1}>
            {renderRow('Kỳ thi', result.tenKyThi)}
            {renderRow('Buổi thi', result.buoi)}
            {renderRow('Ngày thi', result.ngayThi)}
            {renderRow('Ngày cấp', result.ngayCap)}
            {renderRow('Trạng thái', result.trangThai)}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1}>
            {renderRow('Điểm 1', result.diem1)}
            {renderRow('Điểm 2', result.diem2)}
            {renderRow('Điểm 3', result.diem3)}
            {renderRow('Điểm 4', result.diem4)}
            {renderRow('Tổng kết', result.diemTK)}
          </Grid>
        </Paper>
      )}
    </Box>
  )
}

export default KetQua
