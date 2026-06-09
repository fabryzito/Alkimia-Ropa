import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/User.js"

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  }

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      data: {
        user: {
          _id: user._id.toString(),
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    })
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Por favor proporcione email y contraseña",
      })
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Check if user is active
    if (user.status === "inactive") {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo",
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Register new user (client signup)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body

    // Validate all fields
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: "Por favor proporcione nombre, email y contraseña",
      })
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: "Las contraseñas no coinciden",
      })
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() })
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "El email ya está registrado",
      })
    }

    // Create user with default role: client
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: "client", // Default role for new registrations
      status: "active",
    })

    sendTokenResponse(user, 201, res)
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      data: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })

    res.status(200).json({
      success: true,
      message: "Sesión cerrada correctamente",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No existe usuario con ese email",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    user.resetPasswordExpires = Date.now() + Number.parseInt(process.env.RESET_TOKEN_EXPIRES_IN)

    await user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: "Token de recuperación generado",
      resetToken, // In production, send this via email
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex")

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Token inválido o expirado",
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}
