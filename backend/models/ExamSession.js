import mongoose from 'mongoose'

const ExamSessionSchema = new mongoose.Schema({
  Loai: {
    type: String,
    required: [true, 'Lack of \'Loai\'']
  },
  NgayThi: {
    type: Date,
    required: [true, 'Lack of \'NgayThi\'']
  },
  CaThi: {
    type: String,
    required: true
  },
  TGThi: {
    typde: Date,
    required: [true, 'Lack of TGThi']
  },
  SiSo: {
    type: Number,
    required: true
  },
  LePhi: {
    type: Number,
    required: true
  }
})

const ExamSession = mongoose.model('ExamSession', ExamSessionSchema)

export default ExamSession