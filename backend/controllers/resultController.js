import Result from '../models/Result.js'
import Account from '../models/Account.js'
import Exam from '../models/Exam.js'

const addResult = async (req, res) => {
  try {
    const {
      IDNguoiDung,
      IDKyThi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      NgayCap
    } = req.body

    const account = await Account.findById(IDNguoiDung)
    const exam = await Exam.findById(IDKyThi)
    if (!account || !exam) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản hoặc kỳ thi' })
    }

    const diemArray = [Diem1, Diem2]
    if (Diem3 !== undefined && Diem3 !== null) diemArray.push(Diem3)
    if (Diem4 !== undefined && Diem4 !== null) diemArray.push(Diem4)

    const avg = diemArray.reduce((a, b) => a + b, 0) / diemArray.length
    const nguyen = Math.floor(avg)
    const DiemTKTam = avg - nguyen

    const DiemTK = parseFloat(
      DiemTKTam < 0.25
        ? (nguyen).toFixed(2)
        : DiemTKTam <= 0.75
        ? (nguyen + 0.5).toFixed(2)
        : (nguyen + 1).toFixed(2)
    )

    let NgayHetHan = undefined
    if (exam.IDChungChi?.ThoiHan && exam.IDChungChi.ThoiHan > 0) {
      const ngay = new Date(NgayCap)
      ngay.setFullYear(ngay.getFullYear() + exam.IDChungChi.ThoiHan)
      NgayHetHan = ngay
    }

    const newResult = new Result({
      IDNguoiDung,
      IDKyThi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      DiemTK,
      NgayCap,
      NgayHetHan
    })

    await newResult.save()

    res.status(201).json({
      message: 'Thêm kết quả thành công',
      data: newResult
    })
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('IDNguoiDung', 'TenHienThi')
      .populate({
        path: 'IDKyThi',
        populate: {
          path: 'IDChungChi',
          model: 'Certificate'
        }
      })

    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

const updateResult = async (req, res) => {
  try {
    const { id } = req.params
    const {
      IDNguoiDung,
      IDKyThi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      NgayCap,
      TrangThai
    } = req.body

    const [account, exam] = await Promise.all([
      Account.findById(IDNguoiDung),
      Exam.findById(IDKyThi).populate('IDChungChi')
    ])
    if (!account || !exam) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản hoặc kỳ thi' })
    }

    const diemArray = [Diem1, Diem2]
    if (Diem3 !== undefined) diemArray.push(Diem3)
    if (Diem4 !== undefined) diemArray.push(Diem4)

    const avg = diemArray.reduce((a, b) => a + b, 0) / diemArray.length
    const nguyen = Math.floor(avg)
    const DiemTKTam = avg - nguyen

    const DiemTK = parseFloat(
      DiemTKTam < 0.25
        ? (nguyen).toFixed(2)
        : DiemTKTam <= 0.75
        ? (nguyen + 0.5).toFixed(2)
        : (nguyen + 1).toFixed(2)
    )

    let ngayHetHan = undefined
    if (exam.IDChungChi?.ThoiHan > 0) {
      const ngay = new Date(NgayCap)
      ngay.setFullYear(ngay.getFullYear() + exam.IDChungChi.ThoiHan)
      ngayHetHan = ngay
    }

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      {
        $set: {
          IDNguoiDung,
          IDKyThi,
          Diem1,
          Diem2,
          Diem3,
          Diem4,
          DiemTK,
          NgayCap,
          NgayHetHan: ngayHetHan,
          TrangThai
        }
      },
      { new: true, runValidators: true }
    )

    const certId = String(exam.IDChungChi?._id)
    if (certId) {
      const exists = account.ChungChiDaNhan.map(String).includes(certId)
      if (TrangThai === 'Đã lấy' && !exists) {
        account.ChungChiDaNhan.push(certId)
      } else if (TrangThai === 'Chưa lấy' && exists) {
        account.ChungChiDaNhan = account.ChungChiDaNhan.filter(id => String(id) !== certId)
      }
      await account.save()
    }

    res.status(200).json(updatedResult)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Result.findById(id)
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả để xóa' })
    }

    const exam = await Exam.findById(result.IDKyThi)

    if (result.TrangThai === 'Đã lấy' && exam?.IDChungChi) {
      await Account.findByIdAndUpdate(
        result.IDNguoiDung,
        { $pull: { ChungChiDaNhan: exam.IDChungChi } }
      )
    }

    await Result.findByIdAndDelete(id)

    res.status(200).json({
      message: 'Xóa kết quả thành công và đã cập nhật tài khoản liên quan'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

export default {
  addResult,
  getResults,
  updateResult,
  deleteResult
}
