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
    required: true
  },
  HocPhi: {
    type: Number,
    required: true,
    default: 0
  },
  ThoiHan: {
    type: Number
  },
  DiemToiThieu: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 5
  }
}, { timestamps: true })

const Certificate = mongoose.model('Certificate', CertificateSchema)

export default Certificate