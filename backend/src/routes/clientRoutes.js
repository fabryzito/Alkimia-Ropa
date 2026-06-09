import express from "express"
import {
  getClients,
  getClient,
  searchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js"
import { protect, authorize } from "../middlewares/auth.js"

const router = express.Router()

router.use(protect)

router.get("/search", searchClients)
router.get("/", getClients)
router.get("/:id", getClient)
router.post("/", authorize("admin", "employee"), createClient)
router.put("/:id", authorize("admin", "employee"), updateClient)
router.delete("/:id", authorize("admin"), deleteClient)

export default router
