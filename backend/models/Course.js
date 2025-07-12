import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  TenKhoaHoc: {
    type: String,
    required: true,
    trim: true
  },
  IDChungChi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  NgayKhaiGiang: {
    type: Date,
    required: true
  },
  NgayKetThuc: {
    type: Date,
    required: true
  },
  Buoi: {
    type: String,
    required: true,
    trim: true,
    enum: ['Sáng', 'Chiều', 'Tối']
  },
  SiSoToiDa: {
    type: Number,
    default: 1,
    required: true,
    min: 1,
    max: 40
  },
  SiSoHienTai: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 40
  },
  LichHoc: {
    type: String,
    required: true,
    trim: true,
    enum: ['T2 - T4 - T6', 'T3 - T5 - T7']
  }
}, { timestamps: true })

const Course = mongoose.model('Course', CourseSchema)

export default Course