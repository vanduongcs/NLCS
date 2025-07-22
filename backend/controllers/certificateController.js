import Certificate from '../models/Certificate.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';
import Exam from '../models/Exam.js';

// Thêm chứng chỉ
const addCertificate = async (req, res) => {
  try {
    const { Loai, TenChungChi, LePhiThi, HocPhi, ThoiHan, DiemToiThieu } = req.body;

    // Log đầu vào để kiểm tra
    console.log('[DEBUG] Dữ liệu thêm chứng chỉ:', req.body);

    const newCertificate = new Certificate({ Loai, TenChungChi, LePhiThi, HocPhi, ThoiHan, DiemToiThieu });
    await newCertificate.save();

    res.status(201).json({ message: 'Thêm chứng chỉ thành công', data: newCertificate });
  } catch (error) {
    console.error('[ERROR] Không thể thêm chứng chỉ:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm chứng chỉ', error: error.message });
  }
};

// Lấy danh sách chứng chỉ
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật chứng chỉ
const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCertificate);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa chứng chỉ
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem có course hoặc exam nào sử dụng chứng chỉ này không
    const [courseCount, examCount] = await Promise.all([
      Course.countDocuments({ IDChungChi: id }),
      Exam.countDocuments({ IDChungChi: id })
    ]);

    // Nếu có liên kết thì không cho xóa
    if (courseCount > 0 || examCount > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa. Chứng chỉ đang được sử dụng trong khóa học hoặc kỳ thi.' 
      });
    }

    // Tiến hành xóa
    await Certificate.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xóa chứng chỉ thành công' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export default {
  addCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate
};
