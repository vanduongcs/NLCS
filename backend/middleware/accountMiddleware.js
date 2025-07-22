const accountRLMiddleware = (req, res, next) => {
  const { TenTaiKhoan, MatKhau } = req.body;

  if (!TenTaiKhoan && !MatKhau) {
    return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
  }

  if (!TenTaiKhoan) {
    return res.status(400).json({ message: 'Vui lòng nhập tài khoản' });
  }

  if (!MatKhau) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
  }

  next();
};

const checkTenHienThi = (req, res, next) => {
  const { TenHienThi } = req.body;
  if (!TenHienThi) {
    return res.status(400).json({ message: 'Vui lòng nhập tên người dùng' });
  }
  next();
};

export default {
  accountRLMiddleware,
  checkTenHienThi
};
