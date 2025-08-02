import express from 'express'
import courseController from '../controllers/courseController.js'

const router = express.Router()

router.post('/them-khoa-on', courseController.addCourse)

router.get('/tim-khoa-on/:id', courseController.getCourse)

router.get('/tat-ca-khoa-on', courseController.getCourses)

router.put('/cap-nhat-khoa-on/:id', courseController.updateCourse)

router.delete('/xoa-khoa-on/:id', courseController.deleteCourse)

export default router