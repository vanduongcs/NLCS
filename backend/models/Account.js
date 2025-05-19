import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema({
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

const Account = mongoose.model('Account', AccountSchema)

export default Account