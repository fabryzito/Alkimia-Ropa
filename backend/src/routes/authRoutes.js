import express from "express"
import { login, logout, getMe, forgotPassword, resetPassword, register } from "../controllers/authController.js"
import { protect } from "../middlewares/auth.js"

const router = express.Router()

router.post("/login", login)
router.post("/register", register)
router.post("/logout", protect, logout)
router.get("/me", protect, getMe)
router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:resetToken", resetPassword)

export default router
