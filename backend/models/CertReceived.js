import mongoose from 'mongoose'

const CertReceivedSchema = new mongoose.Schema({
  IDNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    trim: true
  },
  IDKetQua: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    required: true,
    trim: true
  },
  TrangThai: {
    type: String,
    trim: true,
    default: 'Chưa lấy',
    enum: ['Chưa lấy', 'Đã lấy']
  }
})

const CertReceived = mongoose.model('CertReceived', CertReceivedSchema)

export default CertReceived