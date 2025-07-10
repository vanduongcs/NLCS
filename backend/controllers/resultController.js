import Result from '../models/Result.js'
import Account from '../models/Account.js'

const addResult = async (req, res) => {
  try {
    const {
      IDNguoiDung,
      IDChungChi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      NgayCap,
      NgayHetHan,
      TrangThai
    } = req.body

    const account = await Account.findById(IDNguoiDung)

    const diemArray = [Diem1, Diem2]
    if (Diem3 !== undefined && Diem3 !== null) diemArray.push(Diem3)
    if (Diem4 !== undefined && Diem4 !== null) diemArray.push(Diem4)

    const DiemTK = parseFloat(
      (diemArray.reduce((a, b) => a + b, 0) / diemArray.length).toFixed(1)
    )

    const newResult = new Result({
      IDNguoiDung,
      IDChungChi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      DiemTK,
      NgayCap,
      NgayHetHan,
      TrangThai
    })

    await newResult.save()

    if (TrangThai === 'Đã lấy') {
      const certId = String(IDChungChi)
      if (!account.ChungChiDaNhan.includes(certId)) {
        account.ChungChiDaNhan.push(certId)
        await account.save()
      }
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
      IDChungChi,
      Diem1,
      Diem2,
      Diem3,
      Diem4,
      NgayCap,
      NgayHetHan,
      TrangThai
    } = req.body

    const account = await Account.findById(IDNguoiDung)

    const diemArray = [Diem1, Diem2]
    if (Diem3 !== undefined && Diem3 !== null) diemArray.push(Diem3)
    if (Diem4 !== undefined && Diem4 !== null) diemArray.push(Diem4)

    const DiemTK = parseFloat(
      (diemArray.reduce((a, b) => a + b, 0) / diemArray.length).toFixed(1)
    )

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      {
        $set: {
          IDNguoiDung,
          IDChungChi,
          Diem1,
          Diem2,
          Diem3,
          Diem4,
          DiemTK,
          NgayCap,
          NgayHetHan,
          TrangThai
        }
      },
      { new: true, runValidators: true }
    )

    const certificateId = String(updatedResult.IDChungChi)

    if (updatedResult.TrangThai === 'Đã lấy') {
      if (!account.ChungChiDaNhan.includes(certificateId)) {
        account.ChungChiDaNhan.push(certificateId)
        await account.save()
      }
    } else if (updatedResult.TrangThai === 'Chưa lấy') {
      if (account.ChungChiDaNhan.includes(certificateId)) {
        account.ChungChiDaNhan = account.ChungChiDaNhan.filter(
          idItem => String(idItem) !== certificateId
        )
        await account.save()
      }
    }

    res.status(200).json(updatedResult)
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    })
  }
}

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Result.findById(id)

    if (result.TrangThai === 'Đã lấy') {
      await Account.findByIdAndUpdate(
        result.IDNguoiDung,
        { $pull: { ChungChiDaNhan: result.IDChungChi } }
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