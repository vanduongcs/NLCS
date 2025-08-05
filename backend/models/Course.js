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
  IDTaiKhoan: [{
    type: mongoose.Schema.Types.ObjectId,
    default: []
  }],
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
    max: 80
  },
  SiSoHienTai: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 80
  },
  LichHoc: {
    type: String,
    required: true,
    trim: true,
    enum: ['T2 - T4 - T6', 'T3 - T5 - T7']
  }
})

const Course = mongoose.model('Course', CourseSchema)

export default Course