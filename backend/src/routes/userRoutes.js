import express from "express"
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/userController.js"
import { protect, authorize } from "../middlewares/auth.js"

const router = express.Router()

router.use(protect)
router.use(authorize("admin"))

router.get("/", getUsers)
router.get("/:id", getUser)
router.post("/", createUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)
router.patch("/:id/status", toggleUserStatus)

export default router
