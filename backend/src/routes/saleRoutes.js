import express from "express"
import { getSales, getSale, createSale, updateSaleStatus, getSalesStatistics } from "../controllers/saleController.js"
import { protect } from "../middlewares/auth.js"

const router = express.Router()

router.use(protect)

router.get("/statistics", getSalesStatistics)
router.post("/", createSale)
router.get("/", getSales)
router.get("/:id", getSale)
router.patch("/:id/status", updateSaleStatus)

export default router
