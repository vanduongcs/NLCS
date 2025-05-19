import express from 'express'
import certificateController from '../controllers/certificateController.js';

const router = express.Router()

router.post('/', certificateController.createCertificate)

router.get('/:id', certificateController.getCertificate)

router.get('/', certificateController.getCertificates)

export default router