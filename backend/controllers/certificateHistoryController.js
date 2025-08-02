import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import CertificateHistory from '../models/CertificateHistory.js'

const getCertificateHistory = async (req, res) => {
  try {
    const { IDChungChi } = req.params
    const IDChungChiEpKieu = new mongoose.Types.ObjectId(String(IDChungChi))
    // Lấy hết dữ liệu từ lịch sử chứng chỉ tương ứng với IDChungChi
    const history = await CertificateHistory.findOne({ IDChungChi: IDChungChiEpKieu })
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử chứng chỉ', error: 'KHONG_TIM_THAY' })
    }
    res.status(200).json(history)
  }
  catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

export default {
  getCertificateHistory
}