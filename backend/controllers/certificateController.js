import Certificate from '../models/Certificate.js'
import Result from '../models/Result.js'
import Course from '../models/Course.js'
import Exam from '../models/Exam.js'

const addCertificate = async (req, res) => {
  try {
    const {
      Loai,
      TenChungChi,
      LePhiThi,
      HocPhi,
      ThoiHan
    } = req.body

    const newCertificate = new Certificate({
      Loai,
      TenChungChi,
      LePhiThi,
      HocPhi,
      ThoiHan
    })

    await newCertificate.save()

    res.status(201).json({
      message: 'Thêm chứng chỉ thành công',
      data: newCertificate
    })
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
    res.status(200).json(certificates)
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    res.status(200).json(updatedCertificate)
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params

    const certificate = await Certificate.findById(id)

    const hasResult = await Result.exists({ IDChungChi: id })
    const hasCourse = await Course.exists({ TenChungChi: certificate.TenChungChi })
    const hasExam = await Exam.exists({ TenChungChi: certificate.TenChungChi })

    if (hasResult || hasCourse || hasExam) {
      return res.status(400).json({
        message: 'Không thể xóa chứng chỉ. Đang có dữ liệu liên kết với khóa học, kỳ thi hoặc kết quả.'
      })
    }

    await Certificate.findByIdAndDelete(id)

    res.status(200).json({
      message: 'Xóa chứng chỉ thành công'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

export default {
  addCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate
}