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
    const certificate = await Certificate.findById(id);

    const hasDependencies = await Promise.all([
      Result.exists({ IDChungChi: id }),
      Course.exists({ TenChungChi: certificate.TenChungChi }),
      Exam.exists({ TenChungChi: certificate.TenChungChi })
    ]);

    if (hasDependencies.some((exists) => exists)) {
      return res.status(400).json({
        message: 'Không thể xóa chứng chỉ. Đang có dữ liệu liên kết với khóa học, kỳ thi hoặc kết quả.'
      });
    }

    await Certificate.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xóa chứng chỉ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export default {
  addCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate
};
