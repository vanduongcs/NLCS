import Result from '../models/Result.js';
import Account from '../models/Account.js';
import Exam from '../models/Exam.js';

// Hàm tính điểm tổng kết
function tinhDiemTK(diemArray) {
  const avg = diemArray.reduce((a, b) => a + b, 0) / diemArray.length;
  const nguyen = Math.floor(avg);
  const phanLe = avg - nguyen;
  
  if (phanLe < 0.25) return parseFloat(nguyen.toFixed(2));
  if (phanLe < 0.75) return parseFloat((nguyen + 0.5).toFixed(2));
  return parseFloat((nguyen + 1).toFixed(2));
}

// Thêm kết quả mới
const addResult = async (req, res) => {
  try {
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4, NgayCap } = req.body;

    const exam = await Exam.findById(IDKyThi).populate('IDChungChi');
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy kỳ thi' });
    }

    const diemArray = [Diem1, Diem2];
    if (Diem3 !== undefined) diemArray.push(Diem3);
    if (Diem4 !== undefined) diemArray.push(Diem4);

    const DiemTK = tinhDiemTK(diemArray);
    const diemToiThieu = exam?.IDChungChi?.DiemToiThieu ?? 0;
    const KQ = DiemTK >= diemToiThieu ? 'Đạt' : 'Không đạt';

    const newResult = new Result({
      IDNguoiDung, 
      IDKyThi, 
      Diem1, 
      Diem2, 
      Diem3, 
      Diem4, 
      DiemTK, 
      KQ, 
      NgayCap
    });
    await newResult.save();

    // Cập nhật kỳ thi đã tham gia
    await Account.findByIdAndUpdate(
      IDNguoiDung, 
      { $addToSet: { KyThiDaThamGia: IDKyThi } }
    );

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
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4, NgayCap } = req.body;

    const exam = await Exam.findById(IDKyThi).populate('IDChungChi');
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy kỳ thi' });
    }

    const diemArray = [Diem1, Diem2];
    if (Diem3 !== undefined) diemArray.push(Diem3);
    if (Diem4 !== undefined) diemArray.push(Diem4);

    const DiemTK = tinhDiemTK(diemArray);
    const diemToiThieu = exam?.IDChungChi?.DiemToiThieu ?? 0;
    const KQ = DiemTK >= diemToiThieu ? 'Đạt' : 'Không đạt';

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      {
        IDNguoiDung, 
        IDKyThi, 
        Diem1, 
        Diem2, 
        Diem3, 
        Diem4, 
        DiemTK, 
        KQ, 
        NgayCap
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedResult);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa kết quả
const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Result.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả để xóa' });
    }

    res.status(200).json({ message: 'Xóa kết quả thành công' });
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
