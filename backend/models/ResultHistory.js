import mongoose from 'mongoose'

const ResultHistorySchema = new mongoose.Schema({
  IDKetQua: {
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
});


const ResultHistory = mongoose.model('ResultHistory', ResultHistorySchema)

export default ResultHistory