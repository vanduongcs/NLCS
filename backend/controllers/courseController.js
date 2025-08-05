import Course from '../models/Course.js'
import Certificate from '../models/Certificate.js'
import Account from '../models/Account.js'
import CourseHistory from '../models/CourseHistory.js'

// Hàm định dạng ngày
const formatDate = (date) => {
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`
}

// Hàm tìm số thứ tự tiếp theo cho khóa học
const findNextCourseNumber = async (IDChungChi, NgayKhaiGiang, Buoi, excludeId = null) => {
  const certificate = await Certificate.findById(IDChungChi)
  const baseName = `${certificate.TenChungChi}-${formatDate(NgayKhaiGiang)}-${Buoi.charAt(0).toUpperCase()}`

  // Tìm tất cả khóa học có cùng pattern
  const query = {
    IDChungChi: IDChungChi,
    Buoi: Buoi,
    NgayKhaiGiang: {
      $gte: new Date(NgayKhaiGiang).setHours(0, 0, 0, 0),
      $lt: new Date(NgayKhaiGiang).setHours(23, 59, 59, 999)
    }
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  const existingCourses = await Course.find(query).select('TenKhoaHoc')

  // Lấy các số thứ tự đã sử dụng
  const usedNumbers = existingCourses
    .map(course => {
      const match = course.TenKhoaHoc.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`))
      return match ? parseInt(match[1]) : null
    })
    .filter(num => num !== null)

  // Tìm số lớn nhất và trả về số tiếp theo
  const maxNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0
  return maxNumber + 1
}

// Hàm cập nhật lại tên cho tất cả khóa học cùng điều kiện
const updateCourseNames = async (IDChungChi, NgayKhaiGiang, Buoi) => {
  const certificate = await Certificate.findById(IDChungChi)
  const baseName = `${certificate.TenChungChi}-${formatDate(NgayKhaiGiang)}-${Buoi.charAt(0).toUpperCase()}`

  const courses = await Course.find({
    IDChungChi: IDChungChi,
    Buoi: Buoi,
    NgayKhaiGiang: {
      $gte: new Date(NgayKhaiGiang).setHours(0, 0, 0, 0),
      $lt: new Date(NgayKhaiGiang).setHours(23, 59, 59, 999)
    }
  }).sort({ createdAt: 1 }) // Sắp xếp theo thời gian tạo

  // Cập nhật tên cho từng khóa học
  for (let i = 0; i < courses.length; i++) {
    const newName = `${baseName}${i + 1}`
    await Course.findByIdAndUpdate(courses[i]._id, { TenKhoaHoc: newName })
  }
}

// Thêm khóa học
const addCourse = async (req, res) => {
  try {
    const { IDChungChi, NgayKhaiGiang, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body

    if (NgayKhaiGiang > NgayKetThuc) {
      return res.status(400).json({ message: 'Ngày khai giảng phải nhỏ hơn ngày kết thúc', error: 'SAI_MIEN_GIA_TRI' })
    }

    const now = new Date()
    if (NgayKhaiGiang < now) {
      return res.status(400).json({ message: 'Ngày khai giảng không được nhỏ hơn ngày hiện tại', error: 'SAI_MIEN_GIA_TRI' })
    }

    // Add schedule validation with correct day numbers
    const ThuTrongTuan = new Date(NgayKhaiGiang).getDay()
    if (LichHoc === 'T2 - T4 - T6') {
      if (![1, 3, 5].includes(ThuTrongTuan)) {
        return res.status(400).json({
          message: 'Ngày khai giảng và kết thúc phải là thứ 2, 4 hoặc 6',
          error: 'SAI_MIEN_GIA_TRI'
        })
      }
    } else if (LichHoc === 'T3 - T5 - T7') {
      if (![2, 4, 6].includes(ThuTrongTuan)) {
        return res.status(400).json({
          message: 'Ngày khai giảng và kết thúc phải là thứ 3, 5 hoặc 7',
          error: 'SAI_MIEN_GIA_TRI'
        })
      }
    }

    const certificate = await Certificate.findById(IDChungChi)

    if (!certificate) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })

    // Tìm số thứ tự tiếp theo cho khóa học
    const nextNumber = await findNextCourseNumber(IDChungChi, NgayKhaiGiang, Buoi)
    const TenKhoaHoc = `${certificate.TenChungChi}-${formatDate(NgayKhaiGiang)}-${Buoi.charAt(0).toUpperCase()}${nextNumber}`

    const newCourse = new Course({
      IDChungChi,
      TenKhoaHoc,
      NgayKhaiGiang,
      NgayKetThuc,
      Buoi,
      SiSoToiDa,
      LichHoc,
      SiSoHienTai: 0
    })

    await newCourse.save()

    const history = new CourseHistory({
      IDKhoaOn: newCourse._id,
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
    res.status(201).json({ message: 'Thêm khóa ôn thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getCourse = async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id).populate('IDChungChi')
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học', error: 'KHONG_TIM_THAY' })

    res.status(200).json(course)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Lấy danh sách khóa học
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('IDChungChi')
    res.status(200).json(courses)
  } catch (error) {
    console.error('Lỗi lấy khóa ôn:', error.message)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Cập nhật khóa học
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params
    const { IDChungChi, NgayKhaiGiang, IDTaiKhoan, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body

    const allowedFields = ['IDChungChi', 'NgayKhaiGiang', 'IDTaiKhoan', 'NgayKetThuc', 'Buoi', 'SiSoToiDa', 'LichHoc']

    // Lấy thông tin course hiện tại
    const oldCourse = await Course.findById(id)
    if (!oldCourse) return res.status(404).json({ message: 'Không tìm thấy khóa học để cập nhật', error: 'KHONG_TIM_THAY' })

    // Validation ngày và lịch học
    const finalNgayKhaiGiang = NgayKhaiGiang || oldCourse.NgayKhaiGiang
    const finalNgayKetThuc = NgayKetThuc || oldCourse.NgayKetThuc
    const finalLichHoc = LichHoc || oldCourse.LichHoc

    if (finalNgayKhaiGiang > finalNgayKetThuc) {
      return res.status(400).json({ message: 'Ngày khai giảng phải nhỏ hơn ngày kết thúc', error: 'SAI_MIEN_GIA_TRI' })
    }

    const now = new Date()
    if (finalNgayKhaiGiang < now) {
      return res.status(400).json({ message: 'Ngày khai giảng không được nhỏ hơn ngày hiện tại', error: 'SAI_MIEN_GIA_TRI' })
    }

    const ThuTrongTuan = new Date(finalNgayKhaiGiang).getDay()
    if (finalLichHoc === 'T2 - T4 - T6') {
      if (![1, 3, 5].includes(ThuTrongTuan)) {
        return res.status(400).json({
          message: 'Ngày khai giảng và kết thúc phải là thứ 2, 4 hoặc 6',
          error: 'SAI_MIEN_GIA_TRI'
        })
      }
    } else if (finalLichHoc === 'T3 - T5 - T7') {
      if (![2, 4, 6].includes(ThuTrongTuan)) {
        return res.status(400).json({
          message: 'Ngày khai giảng và kết thúc phải là thứ 3, 5 hoặc 7',
          error: 'SAI_MIEN_GIA_TRI'
        })
      }
    }

    // Tạo object update
    const updateData = {}

    if (IDChungChi !== undefined) {
      const cert = await Certificate.findById(IDChungChi)
      if (!cert) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' })
      updateData.IDChungChi = IDChungChi
    }

    // Xử lý IDTaiKhoan
    const finalIDTaiKhoan = IDTaiKhoan !== undefined ? IDTaiKhoan : oldCourse.IDTaiKhoan
    const finalSiSoToiDa = SiSoToiDa !== undefined ? SiSoToiDa : oldCourse.SiSoToiDa

    if (IDTaiKhoan !== undefined) {
      // Kiểm tra danh sách tài khoản có hợp lệ không
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

    // Kiểm tra sĩ số
    if (finalSiSoToiDa < finalIDTaiKhoan.length) {
      return res.status(400).json({
        message: 'Sĩ số tối đa không thể nhỏ hơn sĩ số hiện tại',
        error: 'SI_SO_TOI_DA_KHONG_HOP_LE'
      })
    }

    // Cập nhật các trường khác
    if (NgayKhaiGiang !== undefined) updateData.NgayKhaiGiang = NgayKhaiGiang
    if (NgayKetThuc !== undefined) updateData.NgayKetThuc = NgayKetThuc
    if (Buoi !== undefined) updateData.Buoi = Buoi
    if (SiSoToiDa !== undefined) updateData.SiSoToiDa = SiSoToiDa
    if (LichHoc !== undefined) updateData.LichHoc = LichHoc

    // Kiểm tra xem có cần cập nhật tên khóa học không
    const needsNameUpdate = NgayKhaiGiang !== undefined || Buoi !== undefined || IDChungChi !== undefined

    if (needsNameUpdate) {
      const finalIDChungChi = IDChungChi || oldCourse.IDChungChi
      const finalBuoi = Buoi || oldCourse.Buoi

      const certificate = await Certificate.findById(finalIDChungChi)

      // Tìm số thứ tự tiếp theo cho khóa học (loại trừ khóa học hiện tại)
      const nextNumber = await findNextCourseNumber(finalIDChungChi, finalNgayKhaiGiang, finalBuoi, id)
      updateData.TenKhoaHoc = `${certificate.TenChungChi}-${formatDate(finalNgayKhaiGiang)}-${finalBuoi.charAt(0).toUpperCase()}${nextNumber}`
    }

    // Cập nhật khóa học
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    // Cập nhật tài khoản liên kết
    if (IDTaiKhoan !== undefined) {
      // Lấy danh sách tài khoản cũ và mới
      const oldAccountIds = oldCourse.IDTaiKhoan || []
      const newAccountIds = IDTaiKhoan || []

      // Tìm tài khoản được thêm và bị xóa
      const addedAccountIds = newAccountIds.filter(id => !oldAccountIds.map(String).includes(String(id)))
      const removedAccountIds = oldAccountIds.filter(id => !newAccountIds.map(String).includes(String(id)))

      // Thêm khóa học vào tài khoản mới
      if (addedAccountIds.length > 0) {
        await Account.updateMany(
          { _id: { $in: addedAccountIds } },
          { $addToSet: { KhoaHocDaThamGia: updatedCourse._id } }
        )
      }

      // Xóa khóa học khỏi tài khoản bị xóa
      if (removedAccountIds.length > 0) {
        await Account.updateMany(
          { _id: { $in: removedAccountIds } },
          { $pull: { KhoaHocDaThamGia: updatedCourse._id } }
        )
      }
    }

    // Cập nhật lịch sử
    const history = await CourseHistory.findOne({ IDKhoaOn: id })
    if (history) {
      const chiTietThayDoi = []
      allowedFields.forEach(field => {
        const oldValue = oldCourse[field]
        const newValue = updatedCourse[field]

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
              KieuThayDoi: 'Sửa',
              ThoiGian: new Date(),
              ChiTietThayDoi: chiTietThayDoi
            }
          }
        })
      }
    }

    res.status(200).json({ message: 'Cập nhật khóa ôn thành công' })
  } catch (error) {
    console.error('Lỗi cập nhật khóa học:', error)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Xóa khóa học
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id)
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học để xóa', error: 'KHONG_TIM_THAY' })

    const hasData = course.IDTaiKhoan.length > 0
    if (hasData) {
      return res.status(400).json({ message: 'Không thể xóa khóa học còn liên kết dữ liệu', error: 'KHONG_THE_XOA' })
    }

    const history = await CourseHistory.findOne({ IDKhoaOn: id })
    if (history) {
      await history.deleteOne()
    }
    await Course.findByIdAndDelete(id)

    res.status(200).json({ message: 'Xóa khóa ôn thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  deleteCourse
}
