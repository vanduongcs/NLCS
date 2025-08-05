import express from 'express'
import resultHistoryController from '../controllers/resultHistoryController.js'

const router = express.Router()

router.get('/tim-lich-su-ket-qua/:IDKetQua', resultHistoryController.getResultHistory)

export default router