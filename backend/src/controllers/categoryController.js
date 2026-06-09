import Category from "../models/Category.js"

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })

    const formattedCategories = categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.createdAt.toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedCategories,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body)

    res.status(201).json({
      success: true,
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      })
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: {
        id: category._id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      })
    }

    await category.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}
