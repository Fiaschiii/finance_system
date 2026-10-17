import * as categoryService from '../services/categoryService.js'
import { asyncHandler } from '../middlewares/errorHandler.js'

// GET /api/categories
export const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.supabase, req.user.id)
  res.json({ categories })
})
