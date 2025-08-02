import express from 'express'
import CertificateHistory from '../controllers/certificateHistoryController.js'

const router = express.Router()

router.get('/tim-lich-su-chung-chi/:IDChungChi', CertificateHistory.getCertificateHistory)

export default router