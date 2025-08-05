import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

const renderActionButton = (item, user, handleDangKyOrHuy, type = 'course') => {
  // Xác định loại đăng ký dựa vào type
  const daDangKy = type === 'exam'
    ? user?.KyThiDaThamGia?.includes(item._id)
    : user?.KhoaHocDaThamGia?.includes(item._id)

  const hetCho = item.SiSoToiDa !== undefined && item.SiSoHienTai >= item.SiSoToiDa

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Button
        variant={hetCho && !daDangKy ? 'outlined' : daDangKy ? 'outlined' : 'contained'}
        color={hetCho && !daDangKy ? 'error' : daDangKy ? 'error' : 'primary'}
        size="small"
        disabled={hetCho && !daDangKy}
        onClick={() => handleDangKyOrHuy(item, daDangKy ? 'remove' : 'add')}
        sx={{ minWidth: 120, height: 36, mx: 'auto' }}
      >
        {hetCho && !daDangKy
          ? 'Đã hết chỗ'
          : daDangKy
            ? 'Hủy đăng ký'
            : 'Đăng ký'}
      </Button>
    </Box>
  )
}

export default renderActionButton