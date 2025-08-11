import CertReceived from '../models/CertReceived.js'

// Hỗ trợ cập nhật trực tiếp từ controller khác (nội bộ)
const updateCertStatus = async (IDNguoiDung, IDKetQua, TrangThai) => {
  try {
    const CertificateReceived = await CertReceived.findOne({ IDNguoiDung: IDNguoiDung, IDKetQua: IDKetQua })

    if (CertificateReceived) {
      CertificateReceived.TrangThai = TrangThai
      await CertificateReceived.save()
    } else {
      const newCert = new CertReceived({ IDNguoiDung, IDKetQua, TrangThai })
      await newCert.save()
    }
  } catch (error) {
    console.error('Lỗi nội bộ khi cập nhật CertReceived:', error.message)
    throw new Error('Lỗi nội bộ CertReceived')
  }
}

const getCertReceivedByUserId = async (req, res) => {
  try {
    const userId = req.params.IDNguoiDung

    const certsReceived = await CertReceived.find({ IDNguoiDung: userId })
      .populate('IDNguoiDung', 'TenHienThi TenTaiKhoan')
      .populate({
        path: 'IDKetQua',
        populate: {
          path: 'IDKyThi',
          populate: {
            path: 'IDChungChi'
          }
        }
      })

    res.status(200).json(certsReceived)
  } catch (error) {
    console.error('Lỗi khi lấy chứng chỉ đã nhận:', error.message)
    res.status(500).json({ error: 'Lỗi khi lấy chứng chỉ đã nhận' })
  }
}

// Add this method to your existing controller
const getAllCertReceived = async (req, res) => {
  try {
    const certReceived = await CertReceived.find()
      .populate('IDNguoiDung')
      .populate('IDKetQua')
    res.status(200).json(certReceived)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Don't forget to export the new method
export default {
  updateCertStatus,
  getCertReceivedByUserId,
  getAllCertReceived
}
