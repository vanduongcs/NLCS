import Exam from '../models/Exam.js'
import Certificate from '../models/Certificate.js'
import Account from '../models/Account.js'

const formatDate = (date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}${month}${year}`
}

const addExam = async (req, res) => {
  try {
    const { CertificateID, NgayThi, Buoi, SiSoToiDa } = req.body

    const certificate = await Certificate.findById(CertificateID)

    const buoiFormatted = Buoi === 'Sáng' ? 'S' : 'C'
    const ngayFormatted = formatDate(NgayThi)
    const TenKhoaThi = `${certificate.TenChungChi}-${ngayFormatted}-${buoiFormatted}`

    const newExam = new Exam({
      CertificateID,
      TenKhoaThi,
      NgayThi,
      Buoi,
      SiSoToiDa
    })

    await newExam.save()
    res.status(201).json({ message: 'Thêm đợt thi thành công', data: newExam })
  } catch (error) {
    console.error('Lỗi thêm đợt thi:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('CertificateID')
    res.status(200).json(exams)
  } catch (error) {
    console.error('Lỗi lấy đợt thi:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const updateExam = async (req, res) => {
  try {
    const { id } = req.params
    const {CertificateID, NgayThi, Buoi, SiSoToiDa } = req.body

    const certificate = await Certificate.findById(CertificateID)
    const buoiFormatted = Buoi.charAt(0).toUpperCase() // S/C
    const ngayFormatted = formatDate(NgayThi)
    const TenKhoaThi = `${certificate.TenChungChi}-${ngayFormatted}-${buoiFormatted}`

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { CertificateID, NgayThi, Buoi, SiSoToiDa, TenKhoaThi },
      { new: true, runValidators: true }
    )

    res.status(200).json(updatedExam)
  } catch (error) {
    console.error('Lỗi cập nhật đợt thi:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params

    await Promise.all([
      Account.updateMany({ KhoaThi: id }, { $pull: { KhoaThi: id } }),
      Exam.findByIdAndDelete(id)
    ])

    res.status(200).json({ message: 'Xóa đợt thi thành công và cập nhật các tài khoản liên quan' })
  } catch (error) {
    console.error('Lỗi xóa đợt thi:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  addExam,
  getExams,
  updateExam,
  deleteExam
}