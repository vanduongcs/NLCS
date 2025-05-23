import mongoose from 'mongoose'

const ResultSchema = new mongoose.Schema({
  Ten: {
    type: String,
    required: [true, 'Please enter name']
  },
  MaSo: {
    type: String,
    require: [true, 'Please enter user code']
  },
  Diem_KN1: {
    type: Number,
    required: false,
    default: -1,
  },
  Diem_KN2: {
    type: Number,
    required: false,
    default: -1,
  },
  Diem_KN3: {
    type: Number,
    required: false,
    default: -1,
  },
  Diem_KN4: {
    type: Number,
    required: false,
    default: -1,
  },
  DiemTK: {
    type: Number,
    required: [true, 'Error, lack of summary points'],
    min: 0
  },
  Hang: {
    type: String
  },
  NgayThi: {
    type: Date,
    required: [true, 'Please enter issue date']
  },
});

const Result = mongoose.model('Result ', ResultSchema)

export default Result