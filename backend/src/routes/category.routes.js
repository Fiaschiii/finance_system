import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import * as categoryController from '../controllers/categoryController.js'

const router = Router()

router.use(requireAuth)

router.get('/', categoryController.list)

export default router
