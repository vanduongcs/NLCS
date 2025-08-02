import mongoose from 'mongoose'
import Exam from '../models/Exam.js'
import Certificate from '../models/Certificate.js'
import Account from '../models/Account.js'

import ExamHistory from '../models/ExamHistory.js'

// Hàm định dạng ngày
const formatDate = (date) => {
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`
}

// Thêm đợt thi
const addExam = async (req, res) => {
  try {
    const { IDChungChi, IDTaiKhoan = [], NgayThi, Buoi, SiSoToiDa } = req.body

    // Kiểm tra xem chứng chỉ có tồn tại không
    const certificate = await Certificate.findById(IDChungChi)
    if (!certificate) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })

    // Kiểm tra ngày thi có nhỏ hơn ngày hiện tại không
    const today = new Date().setHours(0, 0, 0, 0)
    const examDate = new Date(NgayThi).setHours(0, 0, 0, 0)
    if (examDate < today) return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.', error: 'SAI_MIEN_GIA_TRI' })

    // Đếm số lượng kỳ thi trùng điều kiện
    const existingExamsCount = await Exam.countDocuments({
      IDChungChi: IDChungChi,
      Buoi: Buoi,
      NgayThi: {
        $gte: new Date(examDate),
        $lt: new Date(examDate + 24 * 60 * 60 * 1000)
      }
    })

    const TenKyThi = `${certificate.TenChungChi}-${formatDate(NgayThi)}-${Buoi === 'Sáng' ? 'S' : 'C'}${existingExamsCount + 1}`

    const newExam = new Exam({
      IDChungChi,
      IDTaiKhoan,
      TenKyThi,
      NgayThi,
      Buoi,
      SiSoToiDa,
      SiSoHienTai: 0
    })

    await newExam.save()

    const history = new ExamHistory({
      IDKyThi: newExam._id,
      DSTruongDLThayDoi: [{
        KieuThayDoi: 'Thêm',
        ThoiGian: new Date(),
        ChiTietThayDoi: [{
          TruongDLThayDoi: null,
          DLTruoc: null,
          DLSau: null
        }]
      }]
    });

    await history.save()
    res.status(201).json({ message: 'Thêm đợt thi thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm đợt thi', error: error.message })
  }
}

const getExam = async (req, res) => {
  try {
    const { examId } = req.params
    const exam = await Exam.findById(examId).populate('IDChungChi')
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đợt thi', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(exam)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Lấy danh sách đợt thi
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('IDChungChi')
    res.status(200).json(exams)
  } catch (error) {
    console.error('Lỗi lấy đợt thi:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Cập nhật đợt thi
const updateExam = async (req, res) => {
  try {
    const { examId } = req.params
    const { IDChungChi, IDTaiKhoan, NgayThi, Buoi, SiSoToiDa } = req.body

    const allowedFields = ['IDChungChi', 'IDTaiKhoan', 'NgayThi', 'Buoi', 'SiSoToiDa']

    // Lấy thông tin exam hiện tại
    const oldExam = await Exam.findById(examId)
    if (!oldExam) {
      return res.status(404).json({ message: 'Không tìm thấy đợt thi', error: 'KHONG_TIM_THAY' })
    }

    // Tạo object update chỉ với những field được gửi
    const updateData = {}

    if (IDChungChi !== undefined) {
      // Kiểm tra chứng chỉ có tồn tại không
      const certificate = await Certificate.findById(IDChungChi)
      if (!certificate) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })
      updateData.IDChungChi = IDChungChi
    }

    if (IDTaiKhoan !== undefined) {
      // Kiểm tra danh sách tài khoản có tài khoản nào không hợp lệ không
      if (IDTaiKhoan.length > 0) {
        const validAccounts = await Account.find({ _id: { $in: IDTaiKhoan } })
        if (validAccounts.length !== IDTaiKhoan.length) {
          return res.status(400).json({
            message: 'Danh sách tài khoản không hợp lệ',
            error: 'DANH_SACH_TAI_KHOAN_KHONG_HOP_LE'
          })
        }
      }
      updateData.IDTaiKhoan = IDTaiKhoan
      updateData.SiSoHienTai = IDTaiKhoan.length
    }

    if (NgayThi !== undefined) {
      // Kiểm tra ngày thi có nhỏ hơn ngày hiện tại không
      const today = new Date().setHours(0, 0, 0, 0)
      const examDate = new Date(NgayThi).setHours(0, 0, 0, 0)
      if (examDate < today) return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.', error: 'SAI_MIEN_GIA_TRI' })
      updateData.NgayThi = NgayThi
    }

    if (Buoi !== undefined) {
      updateData.Buoi = Buoi
    }

    if (SiSoToiDa !== undefined) {
      updateData.SiSoToiDa = SiSoToiDa
    }

    if (SiSoToiDa < IDTaiKhoan.length) {
      return res.status(400).json({
        message: 'Sĩ số tối đa không thể nhỏ hơn sĩ số hiện tại',
        error: 'SI_SO_TOI_DA_KHONG_HOP_LE'
      })
    }

    // Tạo tên kỳ thi mới nếu có thay đổi về chứng chỉ, ngày thi hoặc buổi
    if (NgayThi !== undefined || Buoi !== undefined || IDChungChi !== undefined) {
      const finalIDChungChi = IDChungChi || oldExam.IDChungChi
      const finalNgayThi = NgayThi || oldExam.NgayThi
      const finalBuoi = Buoi || oldExam.Buoi

      const certificate = await Certificate.findById(finalIDChungChi)

      // Đếm số lượng kỳ thi trùng điều kiện
      const examDate = new Date(finalNgayThi).setHours(0, 0, 0, 0)
      const existingExamsCount = await Exam.countDocuments({
        IDChungChi: finalIDChungChi,
        Buoi: finalBuoi,
        NgayThi: {
          $gte: new Date(examDate),
          $lt: new Date(examDate + 24 * 60 * 60 * 1000)
        },
        _id: { $ne: examId }
      })

      updateData.TenKyThi = `${certificate.TenChungChi}-${formatDate(finalNgayThi)}-${finalBuoi.charAt(0).toUpperCase()}${existingExamsCount + 1}`
    }

    // Cập nhật đợt thi
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      updateData,
      { new: true, runValidators: true }
    )

    // Cập nhật lịch sử thay đổi
    const history = await ExamHistory.findOne({ IDKyThi: examId })
    if (history) {
      const chiTietThayDoi = []
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined && oldExam[field]?.toString() !== updatedExam[field]?.toString()) {
          chiTietThayDoi.push({
            TruongDLThayDoi: field,
            DLTruoc: oldExam[field],
            DLSau: updatedExam[field]
          });
        }
      })

      if (chiTietThayDoi.length > 0) {
        await history.updateOne({
          $push: {
            DSTruongDLThayDoi: {
              KieuThayDoi: 'Cập nhật',
              ThoiGian: new Date(),
              ChiTietThayDoi: chiTietThayDoi
            }
          }
        })
      }
    }

    res.status(200).json(updatedExam)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Xóa đợt thi
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params

    // Kiểm tra xem đợt thi có trong KyThiDaThamGia của bất kỳ tài khoản nào không
    const accountWithExam = await Account.findOne({
      KyThiDaThamGia: { $elemMatch: { $eq: id } }
    })

    // Nếu có tài khoản đã tham gia kỳ thi này
    if (accountWithExam) {
      return res.status(400).json({ message: 'Không thể xóa. Đợt thi đã có học viên đăng ký.', error: 'CO_RANG_BUOC' })
    }

    const history = await ExamHistory.findOne({ IDKyThi: id });
    if (history) {
      await history.deleteOne();
    }


    // Xóa đợt thi nếu không có học viên đăng ký
    const deletedExam = await Exam.findByIdAndDelete(id)

    if (!deletedExam) {
      return res.status(404).json({ message: 'Không tìm thấy đợt thi để xóa', error: 'KHONG_TIM_THAY' })
    }

    res.status(200).json({ message: 'Xóa đợt thi thành công' })

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  addExam,
  getExam,
  getExams,
  updateExam,
  deleteExam
}
