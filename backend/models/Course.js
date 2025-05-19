import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  Loai: {
    type: String,
    required: [true, 'Lack of \'Loai\'']
  },
  NgayKG: {
    type: Date,
    required: [true, 'Lack of \'NgayThi\'']
  },
  Buoi: {
    type: String,
    required: true
  },
  TGHoc: {
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

const Course = mongoose.model('Course', CourseSchema)

export default Course