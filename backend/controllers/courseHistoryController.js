import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import CourseHistory from '../models/CourseHistory.js'

const getCourseHistory = async (req, res) => {
  try {
    const { IDKhoaOn } = req.params
    const IDKKhoaOnEpKieu = new mongoose.Types.ObjectId(String(IDKhoaOn))
    // Lấy hết dữ liệu từ lịch sử khóa học tương ứng với IDKhoaOn
    const history = await CourseHistory.findOne({ IDKhoaOn: IDKKhoaOnEpKieu })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử khóa học', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(history)
  }
  catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  getCourseHistory
}