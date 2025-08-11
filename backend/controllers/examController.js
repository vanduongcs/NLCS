import mongoose from 'mongoose'
import Exam from '../models/Exam.js'
import Certificate from '../models/Certificate.js'
import Account from '../models/Account.js'
import ExamHistory from '../models/ExamHistory.js'

// Định dạng ngày thành DDMMYYYY để ghép tên
const formatDate = (date) => {
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`
}

// Tìm số thứ tự tiếp theo cho kỳ thi cùng chứng chỉ/ngày/buổi (loại trừ 1 id nếu cập nhật)
const findNextExamNumber = async (IDChungChi, NgayThi, Buoi, excludeId = null) => {
  const certificate = await Certificate.findById(IDChungChi)
  if (!certificate) return 1

  const baseName = `${certificate.TenChungChi}-${formatDate(NgayThi)}-${Buoi.charAt(0).toUpperCase()}`
  const start = new Date(NgayThi); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setDate(start.getDate() + 1)

  const query = { IDChungChi, Buoi, NgayThi: { $gte: start, $lt: end } }
  if (excludeId) query._id = { $ne: excludeId }

  const existingExams = await Exam.find(query).select('TenKyThi')
  const usedNumbers = existingExams
    .map(e => {
      const match = e.TenKyThi?.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(\\d+)$`))
      return match ? parseInt(match[1], 10) : null
    })
    .filter(n => n !== null)

  return (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1
}

// Thêm đợt thi
const addExam = async (req, res) => {
  try {
    const { IDChungChi, IDTaiKhoan = [], NgayThi, Buoi, SiSoToiDa } = req.body

    if (!IDChungChi) {
      return res.status(400).json({ message: 'Vui lòng nhập chứng chỉ', error: 'SAI_MIEN_GIA_TRI' })
    }
    const certificate = await Certificate.findById(IDChungChi)
    if (!certificate) {
      return res.status(400).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })
    }

    if (!NgayThi) {
      return res.status(400).json({ message: 'Vui lòng nhập ngày thi', error: 'SAI_MIEN_GIA_TRI' })
    }
    const examDate = new Date(NgayThi)
    if (Number.isNaN(examDate.getTime())) {
      return res.status(400).json({ message: 'Ngày thi không hợp lệ', error: 'NGAY_KHONG_HOP_LE' })
    }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    examDate.setHours(0, 0, 0, 0)
    if (examDate < today) {
      return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.', error: 'SAI_MIEN_GIA_TRI' })
    }

    if (!Buoi) {
      return res.status(400).json({ message: 'Vui lòng nhập buổi thi', error: 'SAI_MIEN_GIA_TRI' })
    }
    // Chấp nhận các biến thể 'sáng/sang' và 'chiều/chieu'
    const buoiNorm = String(Buoi).trim().toLowerCase()
    if (buoiNorm !== 'sáng' && buoiNorm !== 'sang' && buoiNorm !== 'chiều' && buoiNorm !== 'chieu') {
      return res.status(400).json({ message: 'Buổi thi không hợp lệ (phải là "Sáng" hoặc "Chiều")', error: 'SAI_MIEN_GIA_TRI' })
    }
    const finalBuoi = buoiNorm.startsWith('s') ? 'Sáng' : 'Chiều'

    const sstd = Number(SiSoToiDa)
    if (!Number.isFinite(sstd) || sstd <= 0) {
      return res.status(400).json({ message: 'Vui lòng nhập sĩ số tối đa hợp lệ (> 0)', error: 'SAI_MIEN_GIA_TRI' })
    }

    const nextNumber = await findNextExamNumber(IDChungChi, examDate, finalBuoi)
    const TenKyThi = `${certificate.TenChungChi}-${formatDate(examDate)}-${finalBuoi.charAt(0).toUpperCase()}${nextNumber}`

    const newExam = new Exam({
      IDChungChi,
      IDTaiKhoan,
      TenKyThi,
      NgayThi: examDate,
      Buoi: finalBuoi,
      SiSoToiDa: sstd,
      SiSoHienTai: 0
    })
    await newExam.save()

    // Lưu lịch sử (không chặn nếu lỗi)
    try {
      const history = new ExamHistory({
        IDKyThi: newExam._id,
        DSTruongDLThayDoi: [{
          KieuThayDoi: 'Thêm',
          ThoiGian: new Date(),
          ChiTietThayDoi: [{ TruongDLThayDoi: null, DLTruoc: null, DLSau: null }]
        }]
      })
      await history.save()
    } catch (e) {
      console.warn('Ghi lịch sử kỳ thi thất bại:', e?.message)
    }

    return res.status(201).json({ message: 'Thêm đợt thi thành công' })
  } catch (error) {
    console.error('Lỗi khi thêm đợt thi:', error)
    return res.status(500).json({ message: 'Lỗi khi thêm đợt thi', error: error.message })
  }
}

// Lấy 1 đợt thi
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
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Cập nhật đợt thi
const updateExam = async (req, res) => {
  try {
    const { examId } = req.params
    const updates = req.body

    const currentExam = await Exam.findById(examId)
    if (!currentExam) {
      return res.status(404).json({ message: 'Không tìm thấy kỳ thi' })
    }

    // Nếu cập nhật danh sách thí sinh, kiểm tra trùng lịch cùng ngày/buổi
    if (updates.IDTaiKhoan && Array.isArray(updates.IDTaiKhoan)) {
      const currentStudents = currentExam.IDTaiKhoan || []
      const newStudents = updates.IDTaiKhoan.filter(id => !currentStudents.includes(String(id)))

      if (newStudents.length > 0) {
        const examDate = new Date(currentExam.NgayThi); examDate.setHours(0, 0, 0, 0)
        const conflictingExams = await Exam.find({
          _id: { $ne: examId },
          NgayThi: { $gte: examDate, $lt: new Date(examDate.getTime() + 86400000) },
          Buoi: currentExam.Buoi
        }).select('_id IDTaiKhoan TenKyThi')

        for (const sid of newStudents) {
          for (const ex of conflictingExams) {
            if (ex.IDTaiKhoan && ex.IDTaiKhoan.includes(String(sid))) {
              return res.status(400).json({
                message: `Thí sinh đã đăng ký kỳ thi khác (${ex.TenKyThi}) vào cùng ngày và buổi`,
                error: 'TRUNG_LICH'
              })
            }
          }
        }
      }
      updates.SiSoHienTai = updates.IDTaiKhoan.length
    }

    // Nếu đổi chứng chỉ/ngày/buổi thì đổi tên kỳ thi cho đồng nhất
    const needRename = updates.IDChungChi || updates.NgayThi || updates.Buoi
    if (needRename) {
      const finalIDChungChi = updates.IDChungChi ?? currentExam.IDChungChi
      const finalNgayThi = updates.NgayThi ?? currentExam.NgayThi
      const finalBuoi = updates.Buoi ?? currentExam.Buoi

      const certificate = await Certificate.findById(finalIDChungChi)
      if (!certificate) {
        return res.status(400).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })
      }

      const nextNumber = await findNextExamNumber(finalIDChungChi, finalNgayThi, finalBuoi, examId)
      updates.TenKyThi = `${certificate.TenChungChi}-${formatDate(finalNgayThi)}-${finalBuoi.charAt(0).toUpperCase()}${nextNumber}`
    }

    const exam = await Exam.findByIdAndUpdate(examId, updates, { new: true, runValidators: true })
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy kỳ thi' })
    }

    return res.status(200).json(exam)
  } catch (error) {
    // 400 để FE hiển thị đúng message
    return res.status(400).json({ message: error.message })
  }
}

// Xóa đợt thi
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params

    const examToDelete = await Exam.findById(id)
    if (!examToDelete) {
      return res.status(404).json({ message: 'Không tìm thấy đợt thi để xóa', error: 'KHONG_TIM_THAY' })
    }

    // Không cho xóa nếu đã có ràng buộc
    const accountWithExam = await Account.findOne({
      KyThiDaThamGia: { $elemMatch: { $eq: id } }
    })
    if (accountWithExam) {
      return res.status(400).json({ message: 'Không thể xóa. Đợt thi đã có học viên đăng ký.', error: 'CO_RANG_BUOC' })
    }

    await Account.updateMany({ KyThiDaThamGia: id }, { $pull: { KyThiDaThamGia: id } })

    const history = await ExamHistory.findOne({ IDKyThi: id })
    if (history) await history.deleteOne()

    await Exam.findByIdAndDelete(id)

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
