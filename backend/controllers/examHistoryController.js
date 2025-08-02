import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import ExamHistory from '../models/ExamHistory.js'

const getExamHistory = async (req, res) => {
  try {
    const { IDKyThi } = req.params
    const IDKyThiEpKieu = new mongoose.Types.ObjectId(String(IDKyThi))
    // Lấy hết dữ liệu từ lịch sử kỳ thi tương ứng với IDKyThi
    const history = await ExamHistory.findOne({ IDKyThi: IDKyThiEpKieu })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử kỳ thi', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(history)
  }
  catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  getExamHistory
}