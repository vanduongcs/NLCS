import React, { useState } from 'react'
import {
  Box, TextField, Typography, Button, Paper, Divider
} from '@mui/material'
import Swal from 'sweetalert2'
import axios from 'axios'

function KTChungChi() {
  const [cccd, setCccd] = useState('')
  const [resultId, setResultId] = useState('')
  const [resultInfo, setResultInfo] = useState(null)

  const handleCheck = async () => {
    if (!cccd.trim() || !resultId.trim()) {
      return Swal.fire('Vui lòng nhập đầy đủ CCCD và mã kết quả', '', 'warning')
    }

    try {
      // 1. Tìm người dùng theo CCCD
      const accountsRes = await axios.get('http://localhost:2025/api/account/tat-ca-tai-khoan')
      const account = accountsRes.data.find(acc => acc.CCCD?.trim() === cccd.trim())
      if (!account) return Swal.fire('Không tìm thấy người dùng với CCCD này', '', 'error')

      // 2. Tìm result theo id
      const resultsRes = await axios.get('http://localhost:2025/api/result/tat-ca-ket-qua')
      const result = resultsRes.data.find(res =>
        res._id === resultId && res.IDNguoiDung?._id === account._id
      )

      if (!result) return Swal.fire('Chứng chỉ hoặc CCCD không đúng', '', 'error')

      // 3. Kiểm tra ngày hết hạn
      const today = new Date().toISOString().slice(0, 10)
      const ngayHetHan = result.NgayHetHan?.slice(0, 10)
      const expired = ngayHetHan && ngayHetHan <= today

      // 4. Lưu kết quả để hiển thị
      setResultInfo({
        hoTen: account.TenHienThi,
        tenKyThi: result.IDKyThi?.TenKyThi || '',
        tenChungChi: result.IDKyThi?.IDChungChi?.TenChungChi || '',
        trangThai: result.TrangThai,
        ngayCap: result.NgayCap?.slice(0, 10),
        ngayHetHan,
        daHetHan: expired
      })
    } catch (err) {
      console.error('Lỗi kiểm tra:', err)
      Swal.fire('Lỗi hệ thống', 'Vui lòng thử lại sau', 'error')
    }
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">Kiểm tra chứng chỉ</Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <TextField label="CCCD" value={cccd} onChange={(e) => setCccd(e.target.value)} />
        <TextField label="Mã kết quả (ID)" value={resultId} onChange={(e) => setResultId(e.target.value)} />
        <Button variant="contained" onClick={handleCheck}>Kiểm tra</Button>
      </Box>

      {resultInfo && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">Kết quả kiểm tra:</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography><strong>Họ tên:</strong> {resultInfo.hoTen}</Typography>
          <Typography><strong>Kỳ thi:</strong> {resultInfo.tenKyThi}</Typography>
          <Typography><strong>Chứng chỉ:</strong> {resultInfo.tenChungChi}</Typography>
          <Typography><strong>Ngày cấp:</strong> {resultInfo.ngayCap || 'Không rõ'}</Typography>
          <Typography>
            <strong>Ngày hết hạn:</strong>{' '}
            {resultInfo.ngayHetHan || 'Vô thời hạn'}{' '}
            {resultInfo.daHetHan && <span style={{ color: 'red' }}>(Đã hết hạn)</span>}
          </Typography>
          <Typography>
            <strong>Trạng thái:</strong>{' '}
            <span style={{ color: resultInfo.trangThai === 'Đã lấy' ? 'green' : 'orange' }}>
              {resultInfo.trangThai}
            </span>
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default KTChungChi
