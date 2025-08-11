import mongoose from 'mongoose'

const CertificateSchema = new mongoose.Schema({
  Loai: {
    type: String,
    required: true,
    trim: true,
    enum: ['Tin học', 'Ngoại ngữ']
  },
  TenChungChi: {
    type: String,
    required: true,
    trim: true
  },
  LePhiThi: {
    type: Number,
    required: true,
    min: 0
  },
  HocPhi: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  ThoiHan: {
    type: Number,
    min: 0
  },
  DiemToiThieu: {
    type: Number,
    required: true,
    min: 0
  },
  DiemToiDa: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  CachTinhDiem: {
    type: String,
    required: true,
    trim: true,
    enum: ['Trung bình', 'Tổng'],
    default: 'Trung bình'
  }
})

const Certificate = mongoose.model('Certificate', CertificateSchema)

export default Certificate