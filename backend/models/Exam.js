import mongoose from 'mongoose'

const ExamSchema = new mongoose.Schema({
  IDChungChi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  IDTaiKhoan: [{
    type: mongoose.Schema.Types.ObjectId,
    default: []
  }],
  TenKyThi: {
    type: String,
    required: true,
    trim: true
  },
  NgayThi: {
    type: Date,
    required: true
  },
  Buoi: {
    type: String,
    required: true
  },
  SiSoToiDa: {
    type: Number,
    required: true,
    min: 0,
    max: 300,
    default: 1
  },
  SiSoHienTai: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
    default: 0
  }
})

const Exam = mongoose.model('Exam', ExamSchema)

export default Exam