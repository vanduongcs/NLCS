import Result from '../models/Result.js'
import Account from '../models/Account.js'
import Exam from '../models/Exam.js'
import Certificate from '../models/Certificate.js'
import certReceivedController from '../controllers/CertReceivedController.js'
import CertReceived from '../models/CertReceived.js'
import ResultHistory from '../models/ResultHistory.js'
import mongoose from 'mongoose'

// ======================= Helpers =======================

// Kiểm tra ObjectId hợp lệ
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id))

// Chuẩn hóa + kiểm tra điểm 1 field
function parseAndValidateScore(fieldName, raw, { required = false, max }) {
  if (raw === undefined || raw === null || raw === '') {
    if (required) {
      return { ok: false, message: `Thiếu điểm ${fieldName}`, code: 'DIEM_THIEU' }
    }
    return { ok: true, value: undefined }
  }
  const num = Number(raw)
  if (!Number.isFinite(num)) {
    return { ok: false, message: `Điểm ${fieldName} không hợp lệ (phải là số)`, code: 'DIEM_KHONG_HOP_LE' }
  }
  if (num < 0 || (typeof max === 'number' && num > max)) {
    return { ok: false, message: `Điểm ${fieldName} phải từ 0 đến ${max}`, code: 'DIEM_NGOAI_KHOANG' }
  }
  return { ok: true, value: Number(parseFloat(num.toFixed(2))) }
}

// Cách tính điểm tổng kết
function tinhDiemTK(diemArray, cachTinhDiem) {
  if (cachTinhDiem === 'Tổng') {
    const sum = diemArray.reduce((a, b) => a + b, 0)
    return parseFloat(sum.toFixed(2))
  } else {
    const avg = diemArray.reduce((a, b) => a + b, 0) / diemArray.length
    const nguyen = Math.floor(avg)
    const phanLe = avg - nguyen
    if (phanLe < 0.25) return parseFloat(nguyen.toFixed(2))
    if (phanLe < 0.75) return parseFloat((nguyen + 0.5).toFixed(2))
    return parseFloat((nguyen + 1).toFixed(2))
  }
}

// ======================= Controllers =======================

const addResult = async (req, res) => {
  try {
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4 } = req.body

    // --- Kiểm tra người dùng ---
    if (!IDNguoiDung) {
      return res.status(400).json({ message: 'Vui lòng nhập người dùng', error: 'SAI_MIEN_GIA_TRI' })
    }
    if (!isValidObjectId(IDNguoiDung)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ', error: 'ID_KHONG_HOP_LE' })
    }
    const user = await Account.findById(IDNguoiDung)
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng', error: 'NGUOI_DUNG_KHONG_TON_TAI' })
    }

    // --- Kiểm tra kỳ thi ---
    if (!IDKyThi) {
      return res.status(400).json({ message: 'Vui lòng nhập kỳ thi', error: 'SAI_MIEN_GIA_TRI' })
    }
    if (!isValidObjectId(IDKyThi)) {
      return res.status(400).json({ message: 'ID kỳ thi không hợp lệ', error: 'ID_KHONG_HOP_LE' })
    }
    const exam = await Exam.findById(IDKyThi).populate('IDChungChi')
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy kỳ thi', error: 'KHONG_TIM_THAY' })
    }

    // --- Kiểm tra người dùng có tham gia kỳ thi chưa ---
    const joined = (exam.IDTaiKhoan || []).map(String).includes(String(IDNguoiDung))
    if (!joined) {
      return res.status(400).json({
        message: 'Người dùng chưa đăng ký tham gia kỳ thi này',
        error: 'NGUOI_DUNG_CHUA_THAM_GIA_KY_THI'
      })
    }

    // --- Không cho trùng kết quả cùng kỳ thi ---
    const hasResultWithSameExam = await Result.findOne({ IDNguoiDung, IDKyThi })
    if (hasResultWithSameExam) {
      return res.status(400).json({ message: 'Người dùng đã có kết quả cho kỳ thi này', error: 'DA_CO_KET_QUA' })
    }

    // --- Kiểm tra & ép kiểu điểm ---
    const diemToiDa = exam.IDChungChi?.DiemToiDa
    const cachTinhDiem = exam.IDChungChi?.CachTinhDiem || 'Trung bình'
    if (typeof diemToiDa !== 'number') {
      return res.status(500).json({ message: 'Thiếu cấu hình điểm tối đa cho chứng chỉ', error: 'CAU_HINH_THIEU' })
    }

    const v1 = parseAndValidateScore('thành phần 1', Diem1, { required: true, max: diemToiDa })
    if (!v1.ok) return res.status(400).json({ message: v1.message, error: v1.code })

    const v2 = parseAndValidateScore('thành phần 2', Diem2, { required: true, max: diemToiDa })
    if (!v2.ok) return res.status(400).json({ message: v2.message, error: v2.code })

    const v3 = parseAndValidateScore('thành phần 3', Diem3, { required: false, max: diemToiDa })
    if (!v3.ok) return res.status(400).json({ message: v3.message, error: v3.code })

    const v4 = parseAndValidateScore('thành phần 4', Diem4, { required: false, max: diemToiDa })
    if (!v4.ok) return res.status(400).json({ message: v4.message, error: v4.code })

    const diemArray = [v1.value, v2.value]
    if (v3.value !== undefined) diemArray.push(v3.value)
    if (v4.value !== undefined) diemArray.push(v4.value)

    const DiemTK = tinhDiemTK(diemArray, cachTinhDiem)
    if (cachTinhDiem === 'Trung bình' && DiemTK > diemToiDa) {
      return res.status(400).json({
        message: `Điểm tổng kết không được vượt quá ${diemToiDa} theo cách tính Trung bình`,
        error: 'DIEM_TONG_KHONG_HOP_LE'
      })
    }

    const KQ = DiemTK >= exam.IDChungChi.DiemToiThieu ? 'Đạt' : 'Không đạt'

    // Ngày cấp / hết hạn chứng chỉ
    const ChungChiTuongUng = await Certificate.findById(exam.IDChungChi)
    const ThoiHan = ChungChiTuongUng?.ThoiHan
    const now = new Date()
    const NgayCap = KQ === 'Đạt' ? (exam.NgayThi > now ? exam.NgayThi : now) : null

    let NgayHetHan = null
    if (ThoiHan && NgayCap) {
      NgayHetHan = new Date(NgayCap)
      NgayHetHan.setFullYear(NgayHetHan.getFullYear() + ThoiHan)
    }

    const newResult = new Result({
      IDNguoiDung,
      IDKyThi,
      Diem1: v1.value,
      Diem2: v2.value,
      Diem3: v3.value,
      Diem4: v4.value,
      DiemTK,
      KQ,
      NgayCap,
      NgayHetHan
    })
    await newResult.save()

    if (KQ === 'Đạt') {
      await certReceivedController.updateCertStatus(IDNguoiDung, newResult._id, 'Chưa lấy')
    }

    const history = new ResultHistory({
      IDKetQua: newResult._id,
      DSTruongDLThayDoi: [{
        KieuThayDoi: 'Thêm',
        ThoiGian: new Date(),
        ChiTietThayDoi: [{ TruongDLThayDoi: null, DLTruoc: null, DLSau: null }]
      }]
    })
    await history.save()

    res.status(200).json({ message: 'Thêm kết quả thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const updateResult = async (req, res) => {
  try {
    const { id } = req.params
    const { IDNguoiDung, IDKyThi, Diem1, Diem2, Diem3, Diem4 } = req.body

    const allowedFields = ['IDNguoiDung', 'IDKyThi', 'Diem1', 'Diem2', 'Diem3', 'Diem4']

    // --- Kiểm tra người dùng ---
    if (!IDNguoiDung || !isValidObjectId(IDNguoiDung)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ', error: 'ID_KHONG_HOP_LE' })
    }
    const user = await Account.findById(IDNguoiDung)
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng', error: 'NGUOI_DUNG_KHONG_TON_TAI' })
    }

    // --- Kiểm tra kỳ thi ---
    if (!IDKyThi || !isValidObjectId(IDKyThi)) {
      return res.status(400).json({ message: 'ID kỳ thi không hợp lệ', error: 'ID_KHONG_HOP_LE' })
    }
    const exam = await Exam.findById(IDKyThi).populate('IDChungChi')
    if (!exam) return res.status(404).json({ message: 'Không tìm thấy kỳ thi', error: 'KHONG_TIM_THAY' })

    // --- Người dùng phải thuộc kỳ thi ---
    const joined = (exam.IDTaiKhoan || []).map(String).includes(String(IDNguoiDung))
    if (!joined) {
      return res.status(400).json({
        message: 'Người dùng chưa đăng ký tham gia kỳ thi này',
        error: 'NGUOI_DUNG_CHUA_THAM_GIA_KY_THI'
      })
    }

    // --- Không cho trùng kết quả cùng kỳ thi ---
    const existingIDKyThi = await Result.findOne({ IDNguoiDung, IDKyThi })
    if (existingIDKyThi && existingIDKyThi._id.toString() !== id) {
      return res.status(400).json({ message: 'Người dùng đã có kết quả cho kỳ thi này', error: 'DA_CO_KET_QUA' })
    }

    // --- Kiểm tra & ép kiểu điểm ---
    const diemToiDa = exam.IDChungChi?.DiemToiDa
    const cachTinhDiem = exam.IDChungChi?.CachTinhDiem || 'Trung bình'
    if (typeof diemToiDa !== 'number') {
      return res.status(500).json({ message: 'Thiếu cấu hình điểm tối đa cho chứng chỉ', error: 'CAU_HINH_THIEU' })
    }

    const v1 = parseAndValidateScore('thành phần 1', Diem1, { required: true, max: diemToiDa })
    if (!v1.ok) return res.status(400).json({ message: v1.message, error: v1.code })

    const v2 = parseAndValidateScore('thành phần 2', Diem2, { required: true, max: diemToiDa })
    if (!v2.ok) return res.status(400).json({ message: v2.message, error: v2.code })

    const v3 = parseAndValidateScore('thành phần 3', Diem3, { required: false, max: diemToiDa })
    if (!v3.ok) return res.status(400).json({ message: v3.message, error: v3.code })

    const v4 = parseAndValidateScore('thành phần 4', Diem4, { required: false, max: diemToiDa })
    if (!v4.ok) return res.status(400).json({ message: v4.message, error: v4.code })

    const diemArray = [v1.value, v2.value]
    if (v3.value !== undefined) diemArray.push(v3.value)
    if (v4.value !== undefined) diemArray.push(v4.value)

    const DiemTK = tinhDiemTK(diemArray, cachTinhDiem)
    if (cachTinhDiem === 'Trung bình' && DiemTK > diemToiDa) {
      return res.status(400).json({
        message: `Điểm tổng kết không được vượt quá ${diemToiDa} theo cách tính Trung bình`,
        error: 'DIEM_TONG_KHONG_HOP_LE'
      })
    }

    const KQ = DiemTK >= exam.IDChungChi.DiemToiThieu ? 'Đạt' : 'Không đạt'

    const oldResult = await Result.findById(id)
    if (!oldResult) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả để cập nhật', error: 'KHONG_TIM_THAY' })
    }

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      {
        IDNguoiDung,
        IDKyThi,
        Diem1: v1.value,
        Diem2: v2.value,
        Diem3: v3.value,
        Diem4: v4.value,
        DiemTK,
        KQ
      },
      { new: true, runValidators: true }
    )

    // Cập nhật chứng chỉ nhận được theo KQ
    if (KQ !== 'Đạt') {
      const certReceivedNeedToDelete = await CertReceived.findOne({ IDKetQua: id })
      if (certReceivedNeedToDelete) {
        await certReceivedNeedToDelete.deleteOne()
      }
    } else {
      await certReceivedController.updateCertStatus(IDNguoiDung, updatedResult._id, 'Chưa lấy')
    }

    // Lịch sử
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
    console.error(error)
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
    console.error(error)
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
    console.error(error)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params

    const thisCertReceived = await CertReceived.findOne({ IDKetQua: id })
    if (thisCertReceived) {
      return res.status(404).json({ message: 'Người dùng thi đạt và chứng chỉ đã được cấp, không thể xóa', error: 'CON_LIEN_KET' })
    }

    const history = await ResultHistory.findOne({ IDKetQua: id })
    if (history) await history.deleteOne()

    const deleted = await Result.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy kết quả để xóa' })

    res.status(200).json({ message: 'Xóa kết quả thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  addResult,
  updateResult,
  getResult,
  getResults,
  deleteResult
}
