import jwt from 'jsonwebtoken'
import Account from '../models/Account.js'
import Result from '../models/Result.js'
import Course from '../models/Course.js'
import Exam from '../models/Exam.js'

const register = async (req, res) => {
  try {
    const {
      Loai,
      TenHienThi,
      TenTaiKhoan,
      MatKhau,
      CCCD,
      SDT,
      KhoaHocDaThamGia = [],
      KyThiDaThamGia = []
    } = req.body

    const existingAccount = await Account.findOne({ TenTaiKhoan })
    if (existingAccount) return res.status(409).json({ message: 'Tài khoản đã tồn tại' })

    const newAccount = new Account({
      Loai,
      TenHienThi,
      TenTaiKhoan,
      MatKhau,
      CCCD,
      SDT,
      KhoaHocDaThamGia,
      KyThiDaThamGia
    })

    await newAccount.save()

    res.status(201).json({ message: 'Đăng ký thành công', data: newAccount })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { TenTaiKhoan, MatKhau } = req.body
    const dbAccount = await Account.findOne({ TenTaiKhoan })
    if (!dbAccount) return res.status(409).json({ message: 'Tài khoản không tồn tại' })
    const isMatch = MatKhau === dbAccount.MatKhau
    if (!isMatch) return res.status(409).json({ message: 'Sai mật khẩu' })

    const token = jwt.sign({ id: dbAccount._id }, process.env.JWT_SECRET)
    res.status(200).json({ token })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find()
    res.status(200).json(accounts)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.account.id)
    if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
    res.status(200).json(account)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const updateAccount = async (req, res) => {
  try {
    const { TenTaiKhoan } = req.params
    const updateFields = {}

    const allowedFields = [
      'TenHienThi',
      'MatKhau',
      'Loai',
      'SDT',
      'CCCD',
      'KhoaHocDaThamGia',
      'KyThiDaThamGia'
    ]
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field]
      }
    })

    const updatedAccount = await Account.findOneAndUpdate(
      { TenTaiKhoan },
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản để cập nhật' })
    }

    // Xử lý cập nhật sĩ số
    if (updateFields.KhoaHocDaThamGia || updateFields.KyThiDaThamGia) {
      const {
        KhoaHocDaThamGia = [],
        KyThiDaThamGia = [],
        DSKhoaHocDaThamGia = [],
        DSKyThiDaThamGia = []
      } = req.body

      const addedCourses = KhoaHocDaThamGia.filter(id => !DSKhoaHocDaThamGia.includes(id))
      const removedCourses = DSKhoaHocDaThamGia.filter(id => !KhoaHocDaThamGia.includes(id))

      const addedExams = KyThiDaThamGia.filter(id => !DSKyThiDaThamGia.includes(id))
      const removedExams = DSKyThiDaThamGia.filter(id => !KyThiDaThamGia.includes(id))

      await Promise.all([
        ...addedCourses.map(id => Course.findByIdAndUpdate(id, { $inc: { SiSoHienTai: 1 } })),
        ...removedCourses.map(id => Course.findByIdAndUpdate(id, { $inc: { SiSoHienTai: -1 } })),
        ...addedExams.map(id => Exam.findByIdAndUpdate(id, { $inc: { SiSoHienTai: 1 } })),
        ...removedExams.map(id => Exam.findByIdAndUpdate(id, { $inc: { SiSoHienTai: -1 } }))
      ])
    }

    // Cập nhật chứng chỉ đã nhận (ChungChiDaNhan)
    const results = await Result.find({
      IDNguoiDung: updatedAccount._id,
      TrangThai: 'Đã lấy'
    }).populate({
      path: 'IDKyThi',
      select: 'IDChungChi'
    })

    const newChungChiDaNhan = results
      .map(r => r.IDKyThi?.IDChungChi)
      .filter(Boolean)
      .map(id => id.toString())

    updatedAccount.ChungChiDaNhan = newChungChiDaNhan
    await updatedAccount.save()

    res.status(200).json(updatedAccount)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params
    const account = await Account.findById(id)
    if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })

    const updateCourses = account.KhoaHocDaThamGia?.map(id =>
      Course.findByIdAndUpdate(id, { $inc: { SiSoHienTai: -1 } })
    ) || []

    const updateExams = account.KyThiDaThamGia?.map(id =>
      Exam.findByIdAndUpdate(id, { $inc: { SiSoHienTai: -1 } })
    ) || []

    await Promise.all([...updateCourses, ...updateExams])
    await Account.findByIdAndDelete(id)

    res.status(200).json({ message: 'Xóa tài khoản thành công' })
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
  deleteAccount
}
