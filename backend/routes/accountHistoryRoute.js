import express from 'express'
import accountHistoryController from '../controllers/accountHistoryController.js'

const router = express.Router()

router.get('/tim-lich-su-tai-khoan/:IDTaiKhoan', accountHistoryController.getAccountHistory)

export default router