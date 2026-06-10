import express from "express";
import {
  getSales,
  getSale,
  createSale,
  updateSaleStatus,
  deleteSale,
  resetSalesReports,
  getSalesStatistics,
} from "../controllers/saleController.js";
import { optionalProtect, protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", optionalProtect, createSale);

router.use(protect);

router.get("/statistics", getSalesStatistics);
router.delete("/reports/reset", resetSalesReports);
router.get("/", getSales);
router.get("/:id", getSale);
router.patch("/:id/status", updateSaleStatus);
router.delete("/:id", deleteSale);

export default router;