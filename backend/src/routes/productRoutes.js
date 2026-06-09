import express from "express"
import {
  getProducts,
  getProduct,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from "../controllers/productController.js"
import { protect, authorize } from "../middlewares/auth.js"

const router = express.Router()

router.get("/search", searchProducts)
router.get("/", getProducts)
router.get("/:id", getProduct)

router.post("/", protect, authorize("admin"), createProduct)
router.put("/:id", protect, authorize("admin"), updateProduct)
router.delete("/:id", protect, authorize("admin"), deleteProduct)
router.patch("/:id/stock", protect, authorize("admin", "employee"), updateStock)

export default router
