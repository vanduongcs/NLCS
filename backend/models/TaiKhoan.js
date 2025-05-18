import mongoose from 'mongoose'

const TaiKhoanSchema = new mongoose.Schema({
  Loai: {
    type: String,
    required: [true, 'Lack of \'Loai\''],
    default: 'user'
  },
  TenTK: {
    type: String,
    require: [true, 'Lack of username']
  },
  MatKhau: {
    type: String,
    require: [true, 'Lack of password']
  },
  Email: {
    type: String
  },
  SDT: {
    type: String
  }
})

const TaiKhoan = mongoose.model('TaiKhoan', TaiKhoanSchema)

export default TaiKhoan