import Course from '../models/Course.js'
import Certificate from '../models/Certificate.js'
import Account from '../models/Account.js'

const formatDate = (date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}${month}${year}`
}

const addCourse = async (req, res) => {
  try {
    const { IDChungChi, NgayKhaiGiang, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body

    const certificate = await Certificate.findById(IDChungChi)
    if (!certificate) {
      return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' })
    }

    const buoiFormatted = Buoi.charAt(0).toUpperCase() // S/C/T
    const ngayFormatted = formatDate(NgayKhaiGiang)
    const TenKhoaHoc = `${certificate.TenChungChi}-${ngayFormatted}-${buoiFormatted}`

    const newCourse = new Course({
      IDChungChi,
      TenKhoaHoc,
      NgayKhaiGiang,
      NgayKetThuc,
      Buoi,
      SiSoToiDa,
      LichHoc
    })

    await newCourse.save()
    res.status(201).json({ message: 'Thêm khóa ôn thành công', data: newCourse })
  } catch (error) {
    console.error('Lỗi thêm khóa ôn:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('IDChungChi')
    res.status(200).json(courses)
  } catch (error) {
    console.error('Lỗi lấy khóa ôn:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params
    const { IDChungChi, NgayKhaiGiang, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body

    const certificate = await Certificate.findById(IDChungChi)

    const buoiFormatted = Buoi.charAt(0).toUpperCase() // S/C/T
    const ngayFormatted = formatDate(NgayKhaiGiang)
    const TenKhoaHoc = `${certificate.TenChungChi}-${ngayFormatted}-${buoiFormatted}`

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        IDChungChi,
        TenKhoaHoc,
        NgayKhaiGiang,
        NgayKetThuc,
        Buoi,
        SiSoToiDa,
        LichHoc
      },
      { new: true, runValidators: true }
    )

    res.status(200).json(updatedCourse)
  } catch (error) {
    console.error('Lỗi cập nhật khóa ôn:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params

    const updateCourseAccountPromises = [
      
      ...await Course.findByIdAndDelete(id),

      ...await Account.updateMany(
        { KhoaHocDaThamGia: id },
        { $pull: { KhoaHocDaThamGia: id } }
      )
    ]

    await Promise.all(updateCourseAccountPromises)

    res.status(200).json({ message: 'Xóa khóa ôn thành công và cập nhật các tài khoản liên quan' })
  } catch (error) {
    console.error('Lỗi xóa khóa ôn:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse
}
