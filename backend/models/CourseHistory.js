import mongoose from 'mongoose'

const CourseHistorySchema = new mongoose.Schema({
  IDKhoaOn: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  DSTruongDLThayDoi: [{
    KieuThayDoi: {
      type: String,
      enum: ['Thêm', 'Sửa', 'Xóa']
    },
    ThoiGian: {
      type: Date
    },
    ChiTietThayDoi: [{
      TruongDLThayDoi: {
        type: String,
        trim: true,
        default: null
      },
      DLTruoc: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      DLSau: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    }]
  }]
})


const CourseHistory = mongoose.model('CourseHistory', CourseHistorySchema)

export default CourseHistory