import express from 'express'
import certificateController from '../controllers/certificateController.js'

const router = express.Router()

router.post('/them-chung-chi', certificateController.addCertificate)

router.get('/tat-ca-chung-chi', certificateController.getCertificates)

router.put('/cap-nhat-chung-chi/:id', certificateController.updateCertificate)

router.delete('/xoa-chung-chi/:id', certificateController.deleteCertificate)

export default router