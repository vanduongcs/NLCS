import express from 'express'
import examHistoryController from '../controllers/examHistoryController.js'

const router = express.Router()

router.get('/tim-lich-su-ky-thi/:IDKyThi', examHistoryController.getExamHistory)

export default router