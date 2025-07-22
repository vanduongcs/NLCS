import jwt from 'jsonwebtoken';
import Account from '../models/Account.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';
import Exam from '../models/Exam.js';

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { Loai, TenHienThi, TenTaiKhoan, MatKhau, CCCD = '', SDT = '', KhoaHocDaThamGia = [], KyThiDaThamGia = [] } = req.body;

    const existingAccount = await Account.findOne({ TenTaiKhoan });
    if (existingAccount) return res.status(409).json({ message: 'Tài khoản đã tồn tại' });

    const newAccount = new Account({ Loai, TenHienThi, TenTaiKhoan, MatKhau, CCCD, SDT, KhoaHocDaThamGia, KyThiDaThamGia });
    await newAccount.save();

    // Cập nhật sĩ số khi đăng ký mới (tất cả là added)
    await updateEnrollmentCounts([], newAccount.KhoaHocDaThamGia, [], newAccount.KyThiDaThamGia);

    res.status(201).json({ message: 'Đăng ký thành công', data: newAccount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập tài khoản
const login = async (req, res) => {
  try {
    const { TenTaiKhoan, MatKhau } = req.body;
    const dbAccount = await Account.findOne({ TenTaiKhoan });
    if (!dbAccount) return res.status(409).json({ message: 'Tài khoản không tồn tại' });
    
    if (MatKhau !== dbAccount.MatKhau) return res.status(409).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ id: dbAccount._id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách tài khoản
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thông tin tài khoản
const getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.account.id);
    if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật tài khoản
const updateAccount = async (req, res) => {
  try {
    const { TenTaiKhoan } = req.params;

    // Lấy thông tin cũ trước khi cập nhật
    const oldAccount = await Account.findOne({ TenTaiKhoan });
    if (!oldAccount) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    const updateFields = {};
    const allowedFields = ['TenHienThi', 'MatKhau', 'Loai', 'SDT', 'CCCD', 'KhoaHocDaThamGia', 'KyThiDaThamGia'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updatedAccount = await Account.findOneAndUpdate(
      { TenTaiKhoan },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedAccount) return res.status(404).json({ message: 'Không tìm thấy tài khoản để cập nhật' });

    // Cập nhật sĩ số dựa trên sự khác biệt cũ/mới
    await updateEnrollmentCounts(
      oldAccount.KhoaHocDaThamGia || [],
      updatedAccount.KhoaHocDaThamGia || [],
      oldAccount.KyThiDaThamGia || [],
      updatedAccount.KyThiDaThamGia || []
    );

    // Cập nhật chứng chỉ đã nhận
    await updateReceivedCertificates(updatedAccount);

    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa tài khoản
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);
    
    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    // Kiểm tra điều kiện xóa tài khoản
    if (
      account.KhoaHocDaThamGia && account.KhoaHocDaThamGia.length > 0 ||
      account.KyThiDaThamGia && account.KyThiDaThamGia.length > 0 ||
      account.ChungChiDaNhan && account.ChungChiDaNhan.length > 0
    ) {
      return res.status(400).json({ 
        message: 'Không thể xóa tài khoản. Tài khoản vẫn còn dữ liệu khóa học, kỳ thi hoặc chứng chỉ.' 
      });
    }

    await Account.findByIdAndDelete(id);

    res.status(200).json({ message: 'Xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Hàm cập nhật sĩ số khóa học và kỳ thi (dựa trên old/new lists)
const updateEnrollmentCounts = async (oldCourses, newCourses, oldExams, newExams) => {
  const addedCourses = newCourses.filter(id => !oldCourses.includes(id));
  const removedCourses = oldCourses.filter(id => !newCourses.includes(id));

  const addedExams = newExams.filter(id => !oldExams.includes(id));
  const removedExams = oldExams.filter(id => !newExams.includes(id));

  await Promise.all([
    ...addedCourses.map(id => Course.findByIdAndUpdate(id, { $inc: { SiSoHienTai: 1 } })),
    ...removedCourses.map(id => Course.findByIdAndUpdate(id, { $inc: { SiSoHienTai: -1 } })),
    ...addedExams.map(id => Exam.findByIdAndUpdate(id, { $inc: { SiSoHienTai: 1 } })),
    ...removedExams.map(id => Exam.findByIdAndUpdate(id, { $inc: { SiSoHienTai: -1 } }))
  ]);
};

// Hàm cập nhật chứng chỉ đã nhận
const updateReceivedCertificates = async (updatedAccount) => {
  const results = await Result.find({
    IDNguoiDung: updatedAccount._id,
    TrangThai: 'Đã lấy'
  }).populate({ path: 'IDKyThi', select: 'IDChungChi' });

  const newChungChiDaNhan = results
    .map(r => r.IDKyThi?.IDChungChi)
    .filter(Boolean)
    .map(id => id.toString());

  updatedAccount.ChungChiDaNhan = newChungChiDaNhan;
  await updatedAccount.save();
};

export default {
  register,
  login,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount
};
