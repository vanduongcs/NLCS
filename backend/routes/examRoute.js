import express from 'express'
import examController from '../controllers/examController.js'

const router = express.Router()

router.post('/them-ky-thi', examController.addExam)

router.get('/tim-ky-thi/:examId', examController.getExam)

router.get('/tat-ca-ky-thi', examController.getExams)

router.put('/cap-nhat-ky-thi/:examId', examController.updateExam)

router.delete('/xoa-ky-thi/:id', examController.deleteExam)

export default router