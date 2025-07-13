import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema({
  Loai: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: 'user',
    enum: ['user', 'admin']
  },
  TenHienThi: {
    type: String,
    required: true,
    trim: true
  },
  TenTaiKhoan: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxLength: 256
  },
  MatKhau: {
    type: String,
    required: true,
    trim: true,
    minLength: 6,
    maxLength: 256
  },
  CCCD: {
    type: String,
    required: true,
    trim: true,
    minLength: 12,
    maxLength: 12
  },
  SDT: {
    type: String,
    required: true,
    trim: true,
    minLenght: 10,
    maxLength: 10
  },
  KhoaHocDaThamGia: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: []
  }],
  KhoaThiThamGia: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    default: []
  }],
  KetQua: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
    default: []
  }],
  ChungChiDaNhan: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: []
  }]
}, { timestamps: true })

const Account = mongoose.model('Account', AccountSchema)

export default Account