import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import resultHistory from '../models/ResultHistory.js'

const getResultHistory = async (req, res) => {
  try {
    const { IDKetQua } = req.params
    const IDKetQuaEpKieu = new mongoose.Types.ObjectId(String(IDKetQua))
    // Lấy hết dữ liệu từ lịch sử kết quả tương ứng với IDKetQua
    const history = await resultHistory.findOne({ IDKetQua: IDKetQuaEpKieu })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử kết quả', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(history)
  }
  catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  getResultHistory
}