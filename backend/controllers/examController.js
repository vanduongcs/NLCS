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

// Hàm tìm số thứ tự tiếp theo cho kỳ thi
const findNextExamNumber = async (IDChungChi, NgayThi, Buoi, excludeId = null) => {
  const certificate = await Certificate.findById(IDChungChi)
  const baseName = `${certificate.TenChungChi}-${formatDate(NgayThi)}-${Buoi.charAt(0).toUpperCase()}`

  // Tìm tất cả kỳ thi có cùng pattern
  const examDate = new Date(NgayThi).setHours(0, 0, 0, 0)
  const query = {
    IDChungChi: IDChungChi,
    Buoi: Buoi,
    NgayThi: {
      $gte: new Date(examDate),
      $lt: new Date(examDate + 24 * 60 * 60 * 1000)
    }
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  const existingExams = await Exam.find(query).select('TenKyThi')

  // Lấy các số thứ tự đã sử dụng
  const usedNumbers = existingExams
    .map(exam => {
      const match = exam.TenKyThi.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`))
      return match ? parseInt(match[1]) : null
    })
    .filter(num => num !== null)

  // Tìm số lớn nhất và trả về số tiếp theo
  const maxNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0
  return maxNumber + 1
}

// Thêm đợt thi
const addExam = async (req, res) => {
  try {
    const { IDChungChi, IDTaiKhoan = [], NgayThi, Buoi, SiSoToiDa } = req.body

    if (!IDChungChi) {
      return res.status(400).json({ message: 'Vui lòng nhập chứng chỉ', error: 'SAI_MIEN_GIA_TRI' })
    }

    let certificate = null
    try {
      certificate = await Certificate.findById(IDChungChi)
    } catch (error) {
      return res.status(400).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })
    }

    if (!NgayThi) {
      return res.status(400).json({ message: 'Vui lòng nhập ngày thi', error: 'SAI_MIEN_GIA_TRI' })
    }

    // Kiểm tra ngày thi có nhỏ hơn ngày hiện tại không
    const today = new Date().setHours(0, 0, 0, 0)
    const examDate = new Date(NgayThi).setHours(0, 0, 0, 0)
    if (examDate < today) return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.', error: 'SAI_MIEN_GIA_TRI' })

    if (!Buoi) {
      return res.status(400).json({ message: 'Vui lòng nhập buổi thi', error: 'SAI_MIEN_GIA_TRI' })
    }

    if (!SiSoToiDa) {
      return res.status(400).json({ message: 'Vui lòng nhập sĩ số tối đa', error: 'SAI_MIEN_GIA_TRI' })
    }
    
    // Tìm số thứ tự tiếp theo cho kỳ thi
    const nextNumber = await findNextExamNumber(IDChungChi, NgayThi, Buoi)
    const TenKyThi = `${certificate.TenChungChi}-${formatDate(NgayThi)}-${Buoi.charAt(0).toUpperCase()}${nextNumber}`

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
    })

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

    // Validation trước
    const finalNgayThi = NgayThi || oldExam.NgayThi
    const finalSiSoToiDa = SiSoToiDa !== undefined ? SiSoToiDa : oldExam.SiSoToiDa
    const finalIDTaiKhoan = IDTaiKhoan !== undefined ? IDTaiKhoan : oldExam.IDTaiKhoan

    if (NgayThi !== undefined) {
      // Kiểm tra ngày thi có nhỏ hơn ngày hiện tại không
      const today = new Date().setHours(0, 0, 0, 0)
      const examDate = new Date(NgayThi).setHours(0, 0, 0, 0)
      if (examDate < today) return res.status(400).json({ message: 'Ngày thi không thể nhỏ hơn ngày hiện tại.', error: 'SAI_MIEN_GIA_TRI' })
    }

    if (finalSiSoToiDa < finalIDTaiKhoan.length) {
      return res.status(400).json({
        message: 'Sĩ số tối đa không thể nhỏ hơn sĩ số hiện tại',
        error: 'SI_SO_TOI_DA_KHONG_HOP_LE'
      })
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

      // Cập nhật KyThiDaThamGia cho các tài khoản
      const oldAccountIds = oldExam.IDTaiKhoan || []
      const newAccountIds = IDTaiKhoan || []

      // Tài khoản được thêm vào
      const addedAccounts = newAccountIds.filter(id => !oldAccountIds.map(oldId => oldId.toString()).includes(id.toString()))

      // Tài khoản bị xóa
      const removedAccounts = oldAccountIds.filter(id => !newAccountIds.map(newId => newId.toString()).includes(id.toString()))

      // Thêm examId vào KyThiDaThamGia của các tài khoản mới
      await Promise.all(
        addedAccounts.map(accountId =>
          Account.findByIdAndUpdate(
            accountId,
            { $addToSet: { KyThiDaThamGia: examId } }
          )
        )
      )

      // Xóa examId khỏi KyThiDaThamGia của các tài khoản bị loại
      await Promise.all(
        removedAccounts.map(accountId =>
          Account.findByIdAndUpdate(
            accountId,
            { $pull: { KyThiDaThamGia: examId } }
          )
        )
      )

      updateData.IDTaiKhoan = IDTaiKhoan
      updateData.SiSoHienTai = IDTaiKhoan.length
    }

    if (NgayThi !== undefined) {
      updateData.NgayThi = NgayThi
    }

    if (Buoi !== undefined) {
      updateData.Buoi = Buoi
    }

    if (SiSoToiDa !== undefined) {
      updateData.SiSoToiDa = SiSoToiDa
    }

    // Kiểm tra xem có cần cập nhật tên kỳ thi không
    const needsNameUpdate = NgayThi !== undefined || Buoi !== undefined || IDChungChi !== undefined

    if (needsNameUpdate) {
      const finalIDChungChi = IDChungChi || oldExam.IDChungChi
      const finalBuoi = Buoi || oldExam.Buoi

      const certificate = await Certificate.findById(finalIDChungChi)

      // Tìm số thứ tự tiếp theo cho kỳ thi (loại trừ kỳ thi hiện tại)
      const nextNumber = await findNextExamNumber(finalIDChungChi, finalNgayThi, finalBuoi, examId)
      updateData.TenKyThi = `${certificate.TenChungChi}-${formatDate(finalNgayThi)}-${finalBuoi.charAt(0).toUpperCase()}${nextNumber}`
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
        const oldValue = oldExam[field]
        const newValue = updatedExam[field]

        if (updateData[field] !== undefined) {
          // So sánh array
          if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            if (JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort())) {
              chiTietThayDoi.push({
                TruongDLThayDoi: field,
                DLTruoc: oldValue,
                DLSau: newValue
              })
            }
          }
          // So sánh ObjectId
          else if (oldValue?.toString() !== newValue?.toString()) {
            chiTietThayDoi.push({
              TruongDLThayDoi: field,
              DLTruoc: oldValue,
              DLSau: newValue
            })
          }
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

    res.status(200).json({ message: 'Cập nhật đợt thi thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Xóa đợt thi
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params

    // Lấy thông tin exam trước khi xóa
    const examToDelete = await Exam.findById(id)
    if (!examToDelete) {
      return res.status(404).json({ message: 'Không tìm thấy đợt thi để xóa', error: 'KHONG_TIM_THAY' })
    }

    // Kiểm tra xem đợt thi có trong KyThiDaThamGia của bất kỳ tài khoản nào không
    const accountWithExam = await Account.findOne({
      KyThiDaThamGia: { $elemMatch: { $eq: id } }
    })

    // Nếu có tài khoản đã tham gia kỳ thi này
    if (accountWithExam) {
      return res.status(400).json({ message: 'Không thể xóa. Đợt thi đã có học viên đăng ký.', error: 'CO_RANG_BUOC' })
    }

    // Xóa examId khỏi KyThiDaThamGia của tất cả tài khoản
    await Account.updateMany(
      { KyThiDaThamGia: id },
      { $pull: { KyThiDaThamGia: id } }
    )

    // Xóa lịch sử
    const history = await ExamHistory.findOne({ IDKyThi: id })
    if (history) {
      await history.deleteOne()
    }

    // Xóa đợt thi
    const deletedExam = await Exam.findByIdAndDelete(id)

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
