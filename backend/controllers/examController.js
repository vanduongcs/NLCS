import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Certificate from '../models/Certificate.js';
import Account from '../models/Account.js';

// Hàm định dạng ngày
const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
};

// Thêm đợt thi
const addExam = async (req, res) => {
  try {
    const { IDChungChi, NgayThi, Buoi, SiSoToiDa } = req.body;
    const certificate = await Certificate.findById(IDChungChi);

    if (!certificate) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' });

    const today = new Date().setHours(0, 0, 0, 0);
    const examDate = new Date(NgayThi).setHours(0, 0, 0, 0);
    if (examDate < today) return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.' });

    // Đếm số lượng kỳ thi trùng điều kiện
    const existingExamsCount = await Exam.countDocuments({
      IDChungChi: IDChungChi,
      Buoi: Buoi,
      NgayThi: {
        $gte: new Date(examDate),
        $lt: new Date(examDate + 24 * 60 * 60 * 1000)
      }
    });

    const TenKyThi = `${certificate.TenChungChi}-${formatDate(NgayThi)}-${Buoi === 'Sáng' ? 'S' : 'C'}${existingExamsCount + 1}`;
    
    const newExam = new Exam({ 
      IDChungChi, 
      TenKyThi, 
      NgayThi, 
      Buoi, 
      SiSoToiDa,
      SiSoHienTai: 0 
    });

    await newExam.save();
    res.status(201).json({ message: 'Thêm đợt thi thành công', data: newExam });
  } catch (error) {
    console.error('Lỗi thêm đợt thi:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách đợt thi
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('IDChungChi');
    res.status(200).json(exams);
  } catch (error) {
    console.error('Lỗi lấy đợt thi:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật đợt thi
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { IDChungChi, NgayThi, Buoi, SiSoToiDa } = req.body;

    const today = new Date().setHours(0, 0, 0, 0);
    const examDate = new Date(NgayThi).setHours(0, 0, 0, 0);
    if (examDate < today) return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.' });

    // Đếm số lượng kỳ thi trùng điều kiện
    const existingExamsCount = await Exam.countDocuments({
      IDChungChi: IDChungChi,
      Buoi: Buoi,
      NgayThi: {
        $gte: new Date(examDate),
        $lt: new Date(examDate + 24 * 60 * 60 * 1000)
      },
      _id: { $ne: id } // Loại trừ kỳ thi hiện tại
    });

    const certificate = await Certificate.findById(IDChungChi);
    const TenKyThi = `${certificate.TenChungChi}-${formatDate(NgayThi)}-${Buoi.charAt(0).toUpperCase()}${existingExamsCount + 1}`;

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { IDChungChi, NgayThi, Buoi, SiSoToiDa, TenKyThi },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error('Lỗi cập nhật đợt thi:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa đợt thi
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem đợt thi có trong KyThiDaThamGia của bất kỳ tài khoản nào không
    const accountWithExam = await Account.findOne({ 
      KyThiDaThamGia: { $elemMatch: { $eq: id } } 
    });
    
    // Nếu có tài khoản đã tham gia kỳ thi này
    if (accountWithExam) {
      return res.status(400).json({ 
        message: 'Không thể xóa. Đợt thi đã có học viên đăng ký.' 
      });
    }

    // Xóa đợt thi nếu không có học viên đăng ký
    const deletedExam = await Exam.findByIdAndDelete(id);

    if (!deletedExam) {
      return res.status(404).json({ 
        message: 'Không tìm thấy đợt thi để xóa' 
      });
    }

    res.status(200).json({ 
      message: 'Xóa đợt thi thành công',
      deletedExam 
    });

  } catch (error) {
    console.error('Lỗi xóa đợt thi:', error.message);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

export default {
  addExam,
  getExams,
  updateExam,
  deleteExam
};
