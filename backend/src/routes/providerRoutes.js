import express from "express"
import {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../controllers/providerController.js"
import { protect, authorize } from "../middlewares/auth.js"

const router = express.Router()

router.get("/", protect, getProviders)
router.get("/:id", protect, getProvider)
router.post("/", protect, authorize("admin"), createProvider)
router.put("/:id", protect, authorize("admin"), updateProvider)
router.delete("/:id", protect, authorize("admin"), deleteProvider)

export default router
