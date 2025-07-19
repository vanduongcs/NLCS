import mongoose from 'mongoose'

const ResultSchema = new mongoose.Schema({
  IDNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    trim: true
  },
  IDKyThi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    trim: true
  },
  Diem1: {
    type: Number,
    required: true,
    min: 0
  },
  Diem2: {
    type: Number,
    required: true,
    min: 0
  },
  Diem3: {
    type: Number,
    min: 0
  },
  Diem4: {
    type: Number,
    min: 0
  },
  DiemTK: {
    type: Number,
    min: 0
  },
  NgayCap: {
    type: Date,
    required: true
  },
  NgayHetHan: {
    type: Date
  },
  TrangThai: {
    type: String,
    trim: true,
    default: 'Chưa lấy',
    enum: ['Chưa lấy', 'Đã lấy']
  },
  KQ: {
    type: String,
    required: true,
    trim: true,
    default: 'Không đạt',
  }
}, { timestamps: true })

const Result = mongoose.model('Result', ResultSchema)

export default Result