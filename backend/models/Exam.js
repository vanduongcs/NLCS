import mongoose from 'mongoose'

const ExamSchema = new mongoose.Schema({
  CertificateID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  TenKhoaThi: {
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
    required: true,
    enum: ['Sáng', 'Chiều']
  },
  SiSoToiDa: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
    default: 1
  },
  SiSoHienTai: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
    default: 0
  }
}, { timestamps: true })

const Exam = mongoose.model('Exam', ExamSchema)

export default Exam