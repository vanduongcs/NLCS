const accountRLMiddleware = (req, res, next) => {
  const { TenTaiKhoan, MatKhau } = req.body

  if (!TenTaiKhoan && !MatKhau) {
    return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' })
  }

  if (!TenTaiKhoan) {
    return res.status(400).json({ message: 'Vui lòng nhập tài khoản' })
  }

  if (!MatKhau) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' })
  }

  next()

}

const checkThongTinDK = (req, res, next) => {
  const { TenHienThi, CCCD, SDT } = req.body
  if (!TenHienThi) {
    return res.status(400).json({ message: 'Vui lòng nhập tên người dùng', error: 'TEN_HIEN_THI_TRONG' })
  }
  if (!CCCD) {
    return res.status(400).json({ message: 'Vui lòng nhập CCCD', error: 'CCCD_TRONG' })
  }
  if (!SDT) {
    return res.status(400).json({ message: 'Vui lòng nhập số điện thoại', error: 'SDT_TRONG' })
  }
  next()
}

export default {
  accountRLMiddleware,
  checkThongTinDK
}
