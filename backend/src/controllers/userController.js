import User from "../models/User.js"

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query

    const query = {}
    if (role) {
      query.role = role
    }

    const users = await User.find(query).sort({ createdAt: -1 })

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedUsers,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body)

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      })
    }

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.role = req.body.role || user.role
    user.status = req.body.status || user.status

    // Only update password if provided and not empty
    if (req.body.password && req.body.password.trim()) {
      user.password = req.body.password
    }

    // Save will trigger the pre-save hook which will hash the password if modified
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Toggle user status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      })
    }

    user.status = user.status === "active" ? "inactive" : "active"
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}
