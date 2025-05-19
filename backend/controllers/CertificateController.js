import Item from '../../../Web_CRUD_Sample/backend/models/Item'
import ChungChi from '../models/Certificate.js'

const createChungChi = async (req, res) => {
  try {
    const chungChi = await ChungChi.create(req.body)
    res.status(200).json(chungChi)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

const getAllChungChi = async (req, res) => {
  try {
    const allChungChi = await Item.find({})
    res
  } catch (error) {
    
  }
}

export default {
  createChungChi
}