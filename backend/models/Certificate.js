import mongoose from 'mongoose'

const CertificateSchema = new mongoose.Schema({
  Ten: {
    type: String,
    required: [true, 'Please enter name']
  },
  Loai: {
    type: String,
    required: [true, 'Lack of Loai']
  },
  MaSo: {
    type: String,
    required: [true, 'Please enter user code']
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
  Diem_TK: {
    type: Number,
    required: [true, 'Error, lack of summary points'],
    min: 0
  },
  Hang: {
    type: String
  },
  NgayCap: {
    type: Date,
    required: [true, 'Please enter issue date']
  },
  NgayHetHan: {
    type: Date,
    required: [true, 'Please enter exp']
  }
});

const Certificate = mongoose.model('Certificate', CertificateSchema)

export default Certificate