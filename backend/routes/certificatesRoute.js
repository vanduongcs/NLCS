import express from 'express'
import certificateController from '../controllers/certificateController.js';

const router = express.Router()

router.post('/', certificateController.createCertificate)

router.get('/:id', certificateController.getCertificate)

router.get('/', certificateController.getCertificates)

router.put('/:id', certificateController.updateCertificate)

router.delete('/:id', certificateController.deleteCertificate)

export default router