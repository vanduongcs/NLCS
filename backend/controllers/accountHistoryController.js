import mongoose from 'mongoose'
import AccountHistory from '../models/AccountHistory.js'

const getAccountHistory = async (req, res) => {
  try {
    const { IDTaiKhoan } = req.params
    const IDTaiKhoanEpKieu = new mongoose.Types.ObjectId(String(IDTaiKhoan))
    // Lấy hết dữ liệu từ lịch sử tài khoản tương ứng với IDTaiKhoan
    const history = await AccountHistory.findOne({ IDTaiKhoan: IDTaiKhoanEpKieu })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử tài khoản', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(history)
  }
  catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  getAccountHistory
}