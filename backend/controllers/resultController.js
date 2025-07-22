import Result from '../models/Result.js';
import Account from '../models/Account.js';
import Exam from '../models/Exam.js';

// Hàm tính điểm tổng kết
function tinhDiemTK(diemArray) {
  const avg = diemArray.reduce((a, b) => a + b, 0) / diemArray.length;
  const nguyen = Math.floor(avg);
  const phanLe = avg - nguyen;
  
  if (phanLe < 0.25) return parseFloat(nguyen.toFixed(2));
  if (phanLe <= 0.75) return parseFloat((nguyen + 0.5).toFixed(2));
  return parseFloat((nguyen + 1).toFixed(2));
}

// Hàm tính ngày hết hạn
function tinhNgayHetHan(ngayCap, thoiHan) {
  if (!thoiHan || thoiHan <= 0) return undefined;
  
  const ngay = new Date(ngayCap);
  ngay.setFullYear(ngay.getFullYear() + thoiHan);
  return ngay;
}

// Thêm kết quả mới
const addResult = async (req, res) => {
  try {
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4, NgayCap } = req.body;

    // Kiểm tra ngày cấp
    const today = new Date().setHours(0, 0, 0, 0);
    const ngayCap = new Date(NgayCap).setHours(0, 0, 0, 0);
    if (ngayCap < today) {
      return res.status(400).json({ message: 'Ngày cấp không thể nhỏ hơn ngày hiện tại.' });
    }

    // Lấy thông tin tài khoản và kỳ thi
    const account = await Account.findById(IDNguoiDung);
    const exam = await Exam.findById(IDKyThi).populate('IDChungChi');
    
    if (!account || !exam) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản hoặc kỳ thi' });
    }

    // Tính điểm và kết quả
    const diemArray = [Diem1, Diem2];
    if (Diem3 !== undefined && Diem3 !== null) diemArray.push(Diem3);
    if (Diem4 !== undefined && Diem4 !== null) diemArray.push(Diem4);

    const DiemTK = tinhDiemTK(diemArray);
    const NgayHetHan = tinhNgayHetHan(NgayCap, exam.IDChungChi?.ThoiHan);
    const diemToiThieu = exam?.IDChungChi?.DiemToiThieu ?? 0;
    const KQ = DiemTK >= diemToiThieu ? 'Đạt' : 'Không đạt';

    // Tạo kết quả mới
    const newResult = new Result({
      IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4, 
      DiemTK, KQ, NgayCap, NgayHetHan
    });
    await newResult.save();

    // Cập nhật kỳ thi đã tham gia
    const examId = String(IDKyThi);
    if (!account.KyThiDaThamGia.map(String).includes(examId)) {
      account.KyThiDaThamGia.push(examId);
      await account.save();
    }

    res.status(201).json({
      message: 'Thêm kết quả thành công',
      data: newResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách kết quả
const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('IDNguoiDung', 'TenHienThi')
      .populate({
        path: 'IDKyThi',
        populate: { path: 'IDChungChi', model: 'Certificate' }
      });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật kết quả
const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4, NgayCap, TrangThai } = req.body;

    // Lấy thông tin kết quả cũ
    const oldResult = await Result.findById(id);
    if (!oldResult) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả để cập nhật' });
    }

    // Lấy thông tin tài khoản và kỳ thi
    const [account, exam, oldAccount] = await Promise.all([
      Account.findById(IDNguoiDung),
      Exam.findById(IDKyThi).populate('IDChungChi'),
      oldResult.IDNguoiDung.toString() !== IDNguoiDung ? Account.findById(oldResult.IDNguoiDung) : null
    ]);
    
    if (!account || !exam) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản hoặc kỳ thi' });
    }

    // Tính điểm và kết quả
    const diemArray = [Diem1, Diem2];
    if (Diem3 !== undefined) diemArray.push(Diem3);
    if (Diem4 !== undefined) diemArray.push(Diem4);

    const DiemTK = tinhDiemTK(diemArray);
    const ngayHetHan = tinhNgayHetHan(NgayCap, exam.IDChungChi?.ThoiHan);
    const diemToiThieu = exam?.IDChungChi?.DiemToiThieu ?? 0;
    const KQ = DiemTK >= diemToiThieu ? 'Đạt' : 'Không đạt';

    // Cập nhật kết quả
    const updatedResult = await Result.findByIdAndUpdate(
      id,
      {
        $set: {
          IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4,
          DiemTK, KQ, NgayCap, NgayHetHan: ngayHetHan, TrangThai
        }
      },
      { new: true, runValidators: true }
    );

    // Xử lý kỳ thi đã tham gia
    const oldExamId = String(oldResult.IDKyThi);
    const newExamId = String(IDKyThi);
    const oldUserId = String(oldResult.IDNguoiDung);
    const newUserId = String(IDNguoiDung);

    if (oldExamId !== newExamId || oldUserId !== newUserId) {
      // Xử lý khi thay đổi người dùng hoặc kỳ thi
      if (oldAccount) {
        oldAccount.KyThiDaThamGia = oldAccount.KyThiDaThamGia.filter(id => String(id) !== oldExamId);
        await oldAccount.save();
      } else if (oldUserId === newUserId) {
        account.KyThiDaThamGia = account.KyThiDaThamGia.filter(id => String(id) !== oldExamId);
      }

      if (!account.KyThiDaThamGia.map(String).includes(newExamId)) {
        account.KyThiDaThamGia.push(newExamId);
      }
    }

    // Xử lý chứng chỉ đã nhận
    const certId = String(exam.IDChungChi?._id);
    if (certId) {
      const hasCert = account.ChungChiDaNhan.map(String).includes(certId);
      if (TrangThai === 'Đã lấy' && !hasCert) {
        account.ChungChiDaNhan.push(certId);
      } else if (TrangThai === 'Chưa lấy' && hasCert) {
        account.ChungChiDaNhan = account.ChungChiDaNhan.filter(id => String(id) !== certId);
      }
    }

    // Xử lý chứng chỉ cũ
    if (oldUserId !== newUserId || oldExamId !== newExamId) {
      const oldExam = await Exam.findById(oldExamId).populate('IDChungChi');
      const oldCertId = String(oldExam?.IDChungChi?._id);
      
      if (oldCertId && oldResult.TrangThai === 'Đã lấy') {
        const targetAccount = oldAccount || account;
        targetAccount.ChungChiDaNhan = targetAccount.ChungChiDaNhan.filter(id => String(id) !== oldCertId);
        if (oldAccount) await oldAccount.save();
      }
    }

    await account.save();
    res.status(200).json(updatedResult);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa kết quả
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findById(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả để xóa' });
    }

    const [account, exam] = await Promise.all([
      Account.findById(result.IDNguoiDung),
      Exam.findById(result.IDKyThi).populate('IDChungChi')
    ]);

    if (account) {
      // Xóa chứng chỉ khỏi danh sách đã nhận
      if (result.TrangThai === 'Đã lấy' && exam?.IDChungChi) {
        account.ChungChiDaNhan = account.ChungChiDaNhan.filter(
          certId => String(certId) !== String(exam.IDChungChi._id)
        );
      }

      // Kiểm tra và xóa kỳ thi khỏi danh sách đã tham gia
      const otherResults = await Result.find({
        IDNguoiDung: result.IDNguoiDung,
        IDKyThi: result.IDKyThi,
        _id: { $ne: id }
      });

      if (otherResults.length === 0) {
        account.KyThiDaThamGia = account.KyThiDaThamGia.filter(
          examId => String(examId) !== String(result.IDKyThi)
        );
      }

      await account.save();
    }

    await Result.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xóa kết quả thành công và đã cập nhật tài khoản liên quan' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export default {
  addResult,
  getResults,
  updateResult,
  deleteResult
};
