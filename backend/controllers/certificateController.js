import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import Exam from '../models/Exam.js';

// Thêm chứng chỉ
const addCertificate = async (req, res) => {
  try {
    const { Loai, TenChungChi, LePhiThi, HocPhi, ThoiHan, DiemToiThieu, DiemToiDa } = req.body;

    const certCount = await Certificate.findOne({ TenChungChi: TenChungChi })
    if (certCount) {
      return res.status(400).json({ message: 'Chứng chỉ đã tồn tại trong hệ thống', error: 'CHUNG_CHI_DA_TON_TAI' })
    }

    if (DiemToiThieu > DiemToiDa) {
      return res.status(400).json({ message: 'Điểm tối thiểu không được lớn hơn điểm tối đa', error: 'SAI_MIEN_GIA_TRI' })
    }

    if (HocPhi < 0) {
      return res.status(400).json({ message: 'Học phí không thể âm', error: 'SAI_MIEN_GIA_TRI' })
    }

    const newCertificate = new Certificate({ Loai, TenChungChi, LePhiThi, HocPhi, ThoiHan, DiemToiThieu, DiemToiDa });
    await newCertificate.save();

    res.status(201).json({ message: 'Thêm chứng chỉ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm chứng chỉ', error: error.message });
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
    const { Loai, TenChungChi, LePhiThi, HocPhi, ThoiHan, DiemToiThieu, DiemToiDa } = req.body;

    // Kiểm tra chứng chỉ đã tồn tại chưa
    const existingCert = await Certificate.findOne({ 
      TenChungChi: TenChungChi, 
      _id: { $ne: id }
    });

    if (existingCert) {
      return res.status(400).json({ 
        message: 'Chứng chỉ đã tồn tại trong hệ thống',
        error: 'CHUNG_CHI_DA_TON_TAI'
      });
    }

    if (DiemToiThieu > DiemToiDa) {
      return res.status(400).json({ 
        message: 'Điểm tối thiểu không được lớn hơn điểm tối đa',
        error: 'SAI_MIEN_GIA_TRI'
      });
    }

    if (HocPhi < 0) {
      return res.status(400).json({ message: 'Học phí không thể âm', error: 'SAI_MIEN_GIA_TRI' })
    }

    if (ThoiHan < 0) {
      return res.status(400).json({
        message: 'Thời hạn không thể âm',
        error: 'SAI_MIEN_GIA_TRI'
      })
    }

    

    // Tiến hành cập nhật
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id,
      { 
        Loai, 
        TenChungChi, 
        LePhiThi, 
        HocPhi, 
        ThoiHan, 
        DiemToiThieu, 
        DiemToiDa 
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    // Kiểm tra xem có tìm thấy chứng chỉ không
    if (!updatedCertificate) {
      return res.status(404).json({ 
        message: 'Không tìm thấy chứng chỉ',
        error: 'KHONG_TIM_THAY'
      });
    }

    res.status(200).json({ message: 'Cập nhật chứng chỉ thành công' });

  } catch (error) {
    console.error('Lỗi khi cập nhật chứng chỉ:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật chứng chỉ', 
      error: error.message 
    });
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
        message: 'Không thể xóa. Chứng chỉ đang được sử dụng trong khóa học hoặc kỳ thi.',
        error: 'KHONG_THE_XOA'
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
