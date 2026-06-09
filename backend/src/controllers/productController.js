import Product from "../models/Product.js"

// @desc     Get all products
// @route    GET /api/products
// @access   Private
export const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query

    const query = {}
    if (category) {
      query.category = category
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("provider", "name")
      .sort({ createdAt: -1 })

    // Format response to match frontend expectations
    const formattedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || null,
      categoryName: product.category?.name || "Sin Categoría",
      provider: product.provider?._id || null,
      providerName: product.provider?.name || "Sin Proveedor",
      image: product.image,
      createdAt: product.createdAt ? product.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedProducts,
    })
  } catch (error) {
    next(error)
  }
}

// @desc     Get single product
// @route    GET /api/products/:id
// @access   Private
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name").populate("provider", "name")

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado",
      })
    }

    const formattedProduct = {
      id: product._id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || null,
      categoryName: product.category?.name || "Sin Categoría",
      provider: product.provider?._id || null,
      providerName: product.provider?.name || "Sin Proveedor",
      image: product.image,
      createdAt: product.createdAt ? product.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }

    res.status(200).json({
      success: true,
      data: formattedProduct,
    })
  } catch (error) {
    next(error)
  }
}

// @desc     Search products
// @route    GET /api/products/search
// @access   Private
export const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Query de búsqueda requerido",
      })
    }

    const products = await Product.find({
      $text: { $search: q },
    })
      .populate("category", "name")
      .populate("provider", "name")

    const formattedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || null,
      categoryName: product.category?.name || "Sin Categoría",
      provider: product.provider?._id || null,
      providerName: product.provider?.name || "Sin Proveedor",
      image: product.image,
      createdAt: product.createdAt ? product.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedProducts,
    })
  } catch (error) {
    next(error)
  }
}

// @desc     Create product
// @route    POST /api/products
// @access   Private (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body)

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("provider", "name")

    const formattedProduct = {
      id: populatedProduct._id,
      name: populatedProduct.name,
      brand: populatedProduct.brand,
      description: populatedProduct.description,
      price: populatedProduct.price,
      stock: populatedProduct.stock,
      category: populatedProduct.category?._id || null,
      categoryName: populatedProduct.category?.name || "Sin Categoría",
      provider: populatedProduct.provider?._id || null,
      providerName: populatedProduct.provider?.name || "Sin Proveedor",
      image: populatedProduct.image,
      createdAt: populatedProduct.createdAt ? populatedProduct.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }

    res.status(201).json({
      success: true,
      data: formattedProduct,
    })
  } catch (error) {
    next(error)
  }
}

// @desc     Update product
// @route    PUT /api/products/:id
// @access   Private (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado",
      })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("provider", "name")

    const formattedProduct = {
      id: product._id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || null,
      categoryName: product.category?.name || "Sin Categoría",
      provider: product.provider?._id || null,
      providerName: product.provider?.name || "Sin Proveedor",
      image: product.image,
      createdAt: product.createdAt ? product.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }

    res.status(200).json({
      success: true,
      data: formattedProduct,
    })
  } catch (error) {
    next(error)
  }
}

// @desc     Delete product
// @route    DELETE /api/products/:id
// @access   Private (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado",
      })
    }

    await product.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}

// @desc     Update product stock
// @route    PATCH /api/products/:id/stock
// @access   Private
export const updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado",
      })
    }

    product.stock = quantity
    await product.save()

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("provider", "name")

    const formattedProduct = {
      id: populatedProduct._id,
      name: populatedProduct.name,
      brand: populatedProduct.brand,
      description: populatedProduct.description,
      price: populatedProduct.price,
      stock: populatedProduct.stock,
      category: populatedProduct.category?._id || null,
      categoryName: populatedProduct.category?.name || "Sin Categoría",
      provider: populatedProduct.provider?._id || null,
      providerName: populatedProduct.provider?.name || "Sin Proveedor",
      image: populatedProduct.image,
      createdAt: populatedProduct.createdAt ? populatedProduct.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    }

    res.status(200).json({
      success: true,
      data: formattedProduct,
    })
  } catch (error) {
    next(error)
  }
}