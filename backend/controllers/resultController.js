import Result from '../models/Result.js'
import Account from '../models/Account.js'
import Exam from '../models/Exam.js'
import Certificate from '../models/Certificate.js'
import certReceivedController from '../controllers/CertReceivedController.js'
import CertReceived from '../models/CertReceived.js'
import ResultHistory from '../models/ResultHistory.js'

function tinhDiemTK(diemArray) {
  const avg = diemArray.reduce((a, b) => a + b, 0) / diemArray.length
  const nguyen = Math.floor(avg)
  const phanLe = avg - nguyen

  if (phanLe < 0.25) return parseFloat(nguyen.toFixed(2))
  if (phanLe < 0.75) return parseFloat((nguyen + 0.5).toFixed(2))
  return parseFloat((nguyen + 1).toFixed(2))
}

const addResult = async (req, res) => {
  try {
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4 } = req.body
    if (!IDNguoiDung || !IDKyThi || Diem1 === undefined || Diem2 === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
    }

    const hasResultWithSameExam = await Result.findOne({ IDNguoiDung, IDKyThi })
    if (hasResultWithSameExam) {
      return res.status(400).json({ message: 'Người dùng đã có kết quả cho kỳ thi này', error: 'DA_CO_KET_QUA' })
    }

    // Kiểm tra thông tin kỳ thi có hợp lệ không
    const exam = await Exam.findById(IDKyThi).populate('IDChungChi')
    if (!exam) return res.status(404).json({ message: 'Không tìm thấy kỳ thi', error: 'KHONG_TIM_THAY' })

    // Kiểm tra có bao nhiêu trường dữ liệu điểm
    const diemArray = [Diem1, Diem2]
    if (Diem3 !== undefined) diemArray.push(Diem3)
    if (Diem4 !== undefined) diemArray.push(Diem4)

    // Tính điểm tổng kết
    const DiemTK = tinhDiemTK(diemArray)

    const KQ = DiemTK >= exam.IDChungChi.DiemToiThieu ? 'Đạt' : 'Không đạt'

    const ChungChiTuongUng = await Certificate.findById(exam.IDChungChi)
    const ThoiHan = ChungChiTuongUng.ThoiHan

    const NgayCap = KQ === 'Đạt' ? exam.NgayThi > new Date() ? exam.NgayThi : new Date() : null

    // Tính ngày hết hạn dựa trên NgayCap và ThoiHan nếu ThoiHan là 0 hoặc null hoặc undefined thì NgayHetHan sẽ trở thành null
    const NgayHetHan = ThoiHan && NgayCap ? new Date(NgayCap) : null
    if (NgayHetHan) {
      NgayHetHan.setFullYear(NgayHetHan.getFullYear() + ThoiHan)
    }

    const newResult = new Result({ IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4, DiemTK, KQ, NgayCap, NgayHetHan })
    await newResult.save()

    if (KQ === 'Đạt') {
      await certReceivedController.updateCertStatus(IDNguoiDung, newResult._id, 'Chưa lấy')
    }

    const history = new ResultHistory({
      IDKetQua: newResult._id,
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
    res.status(200).json({ message: 'Thêm kết quả thành công' })
  } catch (error) {
    console.error(error) // Thêm dòng này để log lỗi ra console
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const updateResult = async (req, res) => {
  try {
    const { id } = req.params
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4 } = req.body

    const allowedFields = ['IDNguoiDung', 'IDKyThi', 'Diem1', 'Diem2', 'Diem3', 'Diem4']

    // Kiểm tra thông tin kỳ thi có hợp lệ không
    const exam = await Exam.findById(IDKyThi).populate('IDChungChi')
    if (!exam) return res.status(404).json({ message: 'Không tìm thấy kỳ thi', error: 'KHONG_TIM_THAY' })

    const existingIDKyThi = await Result.findOne({ IDNguoiDung, IDKyThi })
    if (existingIDKyThi && existingIDKyThi._id.toString() !== id) {
      return res.status(400).json({ message: 'Người dùng đã có kết quả cho kỳ thi này', error: 'DA_CO_KET_QUA' })
    }

    // Kiểm tra có bao nhiêu trường dữ liệu điểm
    const diemArray = [Diem1, Diem2]
    if (Diem3 !== undefined) diemArray.push(Diem3)
    if (Diem4 !== undefined) diemArray.push(Diem4)

    const DiemTK = tinhDiemTK(diemArray)
    const KQ = DiemTK >= exam.IDChungChi.DiemToiThieu ? 'Đạt' : 'Không đạt'

    const oldResult = await Result.findById(id)

    console.log('oldResult', oldResult)

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      {
        IDNguoiDung,
        IDKyThi,
        Diem1,
        Diem2,
        Diem3,
        Diem4,
        DiemTK,
        KQ
      },
      { new: true, runValidators: true }
    )

    if (KQ !== 'Đạt') {
      const certReceivedNeedToDelete = await CertReceived.findOne({ IDKetQua: id })
      if (certReceivedNeedToDelete) {
        await certReceivedNeedToDelete.deleteOne()
      }
    } else {
      await certReceivedController.updateCertStatus(IDNguoiDung, updatedResult._id, 'Chưa lấy')
    }

    const history = await ResultHistory.findOne({ IDKetQua: id })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử kết quả', error: 'KHONG_TIM_THAY' })
    } else {
      const chiTietThayDoi = []
      allowedFields.forEach(field => {
        if (oldResult[field]?.toString() !== updatedResult[field]?.toString()) {
          chiTietThayDoi.push({
            TruongDLThayDoi: field,
            DLTruoc: oldResult[field],
            DLSau: updatedResult[field]
          })
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

    res.status(200).json(updatedResult)
  } catch (error) {
    console.error(error) // Thêm dòng này để log lỗi ra console
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getResult = async (req, res) => {
  try {
    const { id } = req.params
    const result = await Result.findById(id)
      .populate('IDNguoiDung', 'TenHienThi')
      .populate({ path: 'IDKyThi', populate: { path: 'IDChungChi' } })

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(result)
  } catch (error) {
    console.error(error) // Thêm dòng này để log lỗi ra console
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('IDNguoiDung', 'TenHienThi')
      .populate({ path: 'IDKyThi', populate: { path: 'IDChungChi' } })
    res.status(200).json(results)
  } catch (error) {
    console.error(error) // Thêm dòng này để log lỗi ra console
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params

    const thisCertReceived = await CertReceived.findOne({ IDKetQua: id })

    if (thisCertReceived) return res.status(404).json({ message: 'Người dùng thi đạt và chứng chỉ đã được cấp, không thể xóa', error: 'CON_LIEN_KET' })

    // xóa resultHistory liên quan
    const history = await ResultHistory.findOne({ IDKetQua: id })

    if (history) {
      await history.deleteOne()
    }
    const deleted = await Result.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy kết quả để xóa' })
    res.status(200).json({ message: 'Xóa kết quả thành công' })
  } catch (error) {
    console.error(error) // Thêm dòng này để log lỗi ra console
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default
  {
    addResult,
    updateResult,
    getResult,
    getResults,
    deleteResult
  }