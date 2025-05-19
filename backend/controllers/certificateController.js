import Certificate from '../models/Certificate.js'

const createCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.create(req.body)
    res.status(200).json(certificate)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

const getCertificate = async (req, res) => {
  try {
    const { id } = req.params
    const certificate = await Certificate.findById(id)
    res.status(200).json(certificate)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({})
    res.status(200).json(certificates)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Certificate.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params
    const item = await Certificate.findByIdAndDelete(id)

    if (!item) {
      return res.status(404).json({message: "Certificate not found"})
    }

    res.status(200).json({message: "Certificate deleted successfully"})

  } 
  catch (error) {
    return res.status(500).json({message: error.message})    
  }
}

export default {
  createCertificate,
  getCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate
}