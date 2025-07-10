import express from 'express'
import examController from '../controllers/examController.js'

const router = express.Router()

router.post('/them-dot-thi', examController.addExam)

router.get('/tat-ca-dot-thi', examController.getExams)

router.put('/cap-nhat-dot-thi/:id', examController.updateExam)

router.delete('/xoa-dot-thi/:id', examController.deleteExam)

export default router