import jwt from 'jsonwebtoken'
import Account from '../models/Account.js'
import Course from '../models/Course.js'
import Exam from '../models/Exam.js'
import Result from '../models/Result.js'
import CertReceived from '../models/CertReceived.js'
import AccountHistory from '../models/AccountHistory.js'

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { Loai, TenHienThi, TenTaiKhoan, MatKhau, CCCD = '', SDT = '' } = req.body

    const [existUser, existCCCD, existSDT] = await Promise.all([
      Account.findOne({ TenTaiKhoan }),
      Account.findOne({ CCCD }),
      Account.findOne({ SDT })
    ])

    if (existUser) return res.status(400).json({ message: 'Tài khoản đã tồn tại', error: 'LOI_TRUNG_LAP_DU_LIEU' })

    if (existCCCD) return res.status(400).json({ message: 'Căn cước đã tồn tại', error: 'LOI_TRUNG_LAP_DU_LIEU' })

    if (existSDT) return res.status(400).json({ message: 'Số điện thoại đã tồn tại', error: 'LOI_TRUNG_LAP_DU_LIEU' })

    const newAccount = new Account({ Loai, TenHienThi, TenTaiKhoan, MatKhau, CCCD, SDT })
    await newAccount.save()

    const history = new AccountHistory({
      IDTaiKhoan: newAccount._id,
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

    res.status(201).json({ message: 'Đăng ký thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Đăng nhập
const login = async (req, res) => {
  try {
    const { TenTaiKhoan, MatKhau } = req.body
    const user = await Account.findOne({ TenTaiKhoan })
    if (!user || user.MatKhau !== MatKhau) {
      return res.status(409).json({ message: 'Sai thông tin đăng nhập', error: 'SAI_DANG_NHAP' })
    }
    const token = jwt.sign({ id: user._id, TenTaiKhoan, Loai: user.Loai }, process.env.JWT_SECRET)
    res.status(200).json({ token })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Lấy danh sách tài khoản
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find()
    res.status(200).json(accounts)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Lấy thông tin tài khoản
const getAccount = async (req, res) => {
  try {
    const { TenTaiKhoan } = req.params
    const account = await Account.findOne({ TenTaiKhoan })
    if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản', error: 'KHONG_TIM_THAY' })

    res.status(200).json(account)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

// Cập nhật tài khoản
const updateAccount = async (req, res) => {
  try {
    const { TenTaiKhoan } = req.params
    const oldAccount = await Account.findOne({ TenTaiKhoan })
    if (!oldAccount) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })

    const allowedFields = ['TenHienThi', 'TenTaiKhoan', 'MatKhau', 'Loai', 'SDT', 'CCCD', 'KhoaHocDaThamGia', 'KyThiDaThamGia', 'ChungChiDaNhan']
    // Lọc ra những trường DL từ request có trong tập các trường DL cho phép chỉnh sửa
    const updateFields = {}
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field]
    })

    const updatedAccount = await Account.findOneAndUpdate(
      { TenTaiKhoan },
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    // Cập nhật trạng thái CertReceived theo sự thay đổi ChungChiDaNhan
    if (updateFields.ChungChiDaNhan) {
      const oldCertIds = (oldAccount.ChungChiDaNhan || []).map(id => id.toString())
      const newCertIds = (updateFields.ChungChiDaNhan || []).map(id => id.toString())

      const added = newCertIds.filter(id => !oldCertIds.includes(id))
      const removed = oldCertIds.filter(id => !newCertIds.includes(id))

      await Promise.all([
        ...added.map(async (ketQuaId) => {
          await CertReceived.findOneAndUpdate(
            { IDNguoiDung: updatedAccount._id, IDKetQua: ketQuaId },
            { TrangThai: 'Đã lấy' },
            { upsert: true }
          )
        }),
        ...removed.map(async (ketQuaId) => {
          await CertReceived.findOneAndUpdate(
            { IDNguoiDung: updatedAccount._id, IDKetQua: ketQuaId },
            { TrangThai: 'Chưa lấy' },
            { upsert: true }
          )
        })
      ])
    }

    if (updateFields.KhoaHocDaThamGia) {
      const oldCourseIds = (oldAccount.KhoaHocDaThamGia || []).map(id => id.toString())
      const newCourseIds = (updateFields.KhoaHocDaThamGia || []).map(id => id.toString())

      const addedCourses = newCourseIds.filter(id => !oldCourseIds.includes(id))
      const removedCourses = oldCourseIds.filter(id => !newCourseIds.includes(id))

      await Promise.all([
        ...addedCourses.map(id => Course.findByIdAndUpdate(id, { $addToSet: { IDTaiKhoan: updatedAccount._id } })),
        ...removedCourses.map(id => Course.findByIdAndUpdate(id, { $pull: { IDTaiKhoan: updatedAccount._id } }))
      ])

      // Cập nhật lại SiSoHienTai cho các course bị ảnh hưởng
      const affectedCourseIds = [...addedCourses, ...removedCourses]
      await Promise.all(
        affectedCourseIds.map(async id => {
          const course = await Course.findById(id)
          if (course) {
            course.SiSoHienTai = course.IDTaiKhoan.length
            await course.save()
          }
        })
      )
    }

    if (updateFields.KyThiDaThamGia) {
      const oldExamIds = (oldAccount.KyThiDaThamGia || []).map(id => id.toString())
      const newExamIds = (updateFields.KyThiDaThamGia || []).map(id => id.toString())

      const addedExams = newExamIds.filter(id => !oldExamIds.includes(id))
      const removedExams = oldExamIds.filter(id => !newExamIds.includes(id))

      await Promise.all([
        ...addedExams.map(id => Exam.findByIdAndUpdate(id, { $addToSet: { IDTaiKhoan: updatedAccount._id } })),
        ...removedExams.map(id => Exam.findByIdAndUpdate(id, { $pull: { IDTaiKhoan: updatedAccount._id } }))
      ])
      // Cập nhật lại SiSoHienTai cho các exam bị ảnh hưởng
      const affectedExamIds = [...addedExams, ...removedExams]
      await Promise.all(
        affectedExamIds.map(async id => {
          const exam = await Exam.findById(id)
          if (exam) {
            exam.SiSoHienTai = exam.IDTaiKhoan.length
            await exam.save()
          }
        })
      )
    }

    const history = await AccountHistory.findOne({ IDTaiKhoan: updatedAccount._id })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử tài khoản' })
    } else {
      const chiTietThayDoi = []
      allowedFields.forEach(field => {
        if (oldAccount[field]?.toString() !== updatedAccount[field]?.toString()) {
          chiTietThayDoi.push({
            TruongDLThayDoi: field,
            DLTruoc: oldAccount[field],
            DLSau: updatedAccount[field]
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
    res.status(200).json({ message: 'Cập nhật tài khoản thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật tài khoản', error: error.message })
  }
}

// Xóa tài khoản
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params
    const account = await Account.findById(id)
    if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản', error: 'KHONG_TIM_THAY' })

    const hasData = account.KhoaHocDaThamGia.length > 0 || account.KyThiDaThamGia.length > 0 || account.ChungChiDaNhan.length > 0
    if (hasData) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản còn liên kết dữ liệu' })
    }

    const history = await AccountHistory.findOne({ IDTaiKhoan: id });
    if (history) {
      await history.deleteOne();
    }
    await Account.findByIdAndDelete(id)
    res.status(200).json({ message: 'Xóa tài khoản thành công' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getResultWithThisAccount = async (req, res) => {
  try {
    const { userId } = req.params
    const results = await Result.find({ IDNguoiDung: userId })
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  register,
  login,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getResultWithThisAccount
}
