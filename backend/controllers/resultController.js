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

    // Populate IDChungChi để đảm bảo có đầy đủ thông tin
    const account = await Account.findById(IDNguoiDung)
    const exam = await Exam.findById(IDKyThi).populate('IDChungChi')
    
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

    // Fix: Xử lý DiemToiThieu một cách nhất quán
    const diemToiThieu = exam?.IDChungChi?.DiemToiThieu ?? 0
    const KQ = DiemTK >= diemToiThieu ? 'Đạt' : 'Không đạt'

    console.log('ADD - DiemTK:', DiemTK, 'DiemToiThieu:', diemToiThieu, 'KQ:', KQ)

    const newResult = new Result({
      IDNguoiDung,
      IDKyThi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      DiemTK,
      KQ,
      NgayCap,
      NgayHetHan
    })

    await newResult.save()

    // Cập nhật KyThiDaThamGia cho account
    const examId = String(IDKyThi)
    const examExists = account.KyThiDaThamGia.map(String).includes(examId)
    if (!examExists) {
      account.KyThiDaThamGia.push(examId)
      await account.save()
    }

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

    // Lấy thông tin result cũ để so sánh
    const oldResult = await Result.findById(id)
    if (!oldResult) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả để cập nhật' })
    }

    const [account, exam, oldAccount] = await Promise.all([
      Account.findById(IDNguoiDung),
      Exam.findById(IDKyThi).populate('IDChungChi'),
      // Lấy account cũ nếu IDNguoiDung thay đổi
      oldResult.IDNguoiDung.toString() !== IDNguoiDung ? 
        Account.findById(oldResult.IDNguoiDung) : null
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

    // Fix: Xử lý DiemToiThieu một cách nhất quán
    const diemToiThieu = exam?.IDChungChi?.DiemToiThieu ?? 0
    const KQ = DiemTK >= diemToiThieu ? 'Đạt' : 'Không đạt'

    console.log('UPDATE - DiemTK:', DiemTK, 'DiemToiThieu:', diemToiThieu, 'KQ:', KQ)

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
          KQ,
          NgayCap,
          NgayHetHan: ngayHetHan,
          TrangThai
        }
      },
      { new: true, runValidators: true }
    )

    // Cập nhật KyThiDaThamGia khi thay đổi IDKyThi hoặc IDNguoiDung
    const oldExamId = String(oldResult.IDKyThi)
    const newExamId = String(IDKyThi)
    const oldUserId = String(oldResult.IDNguoiDung)
    const newUserId = String(IDNguoiDung)

    // Nếu thay đổi kỳ thi hoặc người dùng
    if (oldExamId !== newExamId || oldUserId !== newUserId) {
      // Xóa kỳ thi cũ khỏi account cũ
      if (oldAccount) {
        // Trường hợp đổi user
        oldAccount.KyThiDaThamGia = oldAccount.KyThiDaThamGia.filter(
          examId => String(examId) !== oldExamId
        )
        await oldAccount.save()
      } else if (oldUserId === newUserId) {
        // Trường hợp cùng user nhưng đổi kỳ thi
        account.KyThiDaThamGia = account.KyThiDaThamGia.filter(
          examId => String(examId) !== oldExamId
        )
      }

      // Thêm kỳ thi mới vào account mới
      const examExists = account.KyThiDaThamGia.map(String).includes(newExamId)
      if (!examExists) {
        account.KyThiDaThamGia.push(newExamId)
      }
    }

    // Cập nhật ChungChiDaNhan
    const certId = String(exam.IDChungChi?._id)
    if (certId) {
      const exists = account.ChungChiDaNhan.map(String).includes(certId)
      if (TrangThai === 'Đã lấy' && !exists) {
        account.ChungChiDaNhan.push(certId)
      } else if (TrangThai === 'Chưa lấy' && exists) {
        account.ChungChiDaNhan = account.ChungChiDaNhan.filter(id => String(id) !== certId)
      }
    }

    // Xử lý chứng chỉ cũ nếu thay đổi user hoặc kỳ thi
    if (oldUserId !== newUserId || oldExamId !== newExamId) {
      const oldExam = await Exam.findById(oldExamId).populate('IDChungChi')
      const oldCertId = String(oldExam?.IDChungChi?._id)
      
      if (oldCertId && oldResult.TrangThai === 'Đã lấy') {
        // Xóa chứng chỉ cũ khỏi account cũ
        const targetAccount = oldAccount || account
        targetAccount.ChungChiDaNhan = targetAccount.ChungChiDaNhan.filter(
          id => String(id) !== oldCertId
        )
        if (oldAccount) await oldAccount.save()
      }
    }

    await account.save()

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

    const [account, exam] = await Promise.all([
      Account.findById(result.IDNguoiDung),
      Exam.findById(result.IDKyThi).populate('IDChungChi')
    ])

    // Xóa chứng chỉ khỏi ChungChiDaNhan nếu đã lấy
    if (result.TrangThai === 'Đã lấy' && exam?.IDChungChi && account) {
      account.ChungChiDaNhan = account.ChungChiDaNhan.filter(
        certId => String(certId) !== String(exam.IDChungChi._id)
      )
    }

    // Kiểm tra xem có result khác của cùng user và cùng kỳ thi không
    const otherResults = await Result.find({
      IDNguoiDung: result.IDNguoiDung,
      IDKyThi: result.IDKyThi,
      _id: { $ne: id }
    })

    // Nếu không có result khác cho kỳ thi này, xóa khỏi KyThiDaThamGia
    if (otherResults.length === 0 && account) {
      account.KyThiDaThamGia = account.KyThiDaThamGia.filter(
        examId => String(examId) !== String(result.IDKyThi)
      )
    }

    if (account) {
      await account.save()
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