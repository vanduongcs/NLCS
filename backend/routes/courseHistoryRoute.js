import express from 'express'
import courseHistoryController from '../controllers/courseHistoryController.js'

const router = express.Router()

router.get('/tim-lich-su-khoa-hoc/:IDKhoaOn', courseHistoryController.getCourseHistory)

export default router