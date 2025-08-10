import express from 'express'
import accountController from '../controllers/accountController.js'

const router = express.Router()

router.post('/dang-ky', accountController.register)

router.post('/dang-nhap', accountController.login)

router.get('/tat-ca-tai-khoan', accountController.getAccounts)

router.get('/tim-tai-khoan/:TenTaiKhoan', accountController.getAccount)

router.get('/lay-ket-qua-nguoi-dung/:userId', accountController.getResultWithThisAccount)

router.put('/cap-nhat-tai-khoan/:TenTaiKhoan', accountController.updateAccount)

router.delete('/xoa-tai-khoan/:id', accountController.deleteAccount)

export default router