import express from 'express'
import CertReceivedController from '../controllers/CertReceivedController.js'

const router = express.Router()

router.get('/tat-ca-chung-chi-da-nhan/:IDNguoiDung', CertReceivedController.getCertReceivedByUserId)
router.get('/tat-ca-chung-chi-da-nhan', CertReceivedController.getAllCertReceived)

export default router