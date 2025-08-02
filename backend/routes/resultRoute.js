import express from 'express'
import resultController from '../controllers/resultController.js'

const router = express.Router()

router.post('/them-ket-qua', resultController.addResult)

router.get('/tim-ket-qua/:id', resultController.getResult)

router.get('/tat-ca-ket-qua', resultController.getResults)

router.put('/cap-nhat-ket-qua/:id', resultController.updateResult)

router.delete('/xoa-ket-qua/:id', resultController.deleteResult)

export default router