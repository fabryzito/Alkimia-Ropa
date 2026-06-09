import Sale from "../models/Sale.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import { sendSaleEmail } from "../services/emailService.js"

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query

    const query = {}

    if (userId) {
      query.user = userId
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const sales = await Sale.find(query)
      .populate("user", "name email")
      .populate("products.product", "name")
      .sort({ createdAt: -1 })

    const formattedSales = sales
      .map((sale) => {
        if (!sale.user) {
          console.warn(`[v0] Venta ${sale._id} no tiene usuario asociado`)
          return null
        }
        if (!sale.products || sale.products.some((p) => !p.product)) {
          console.warn(`[v0] Venta ${sale._id} tiene productos sin referencia`)
          return null
        }

        return {
          id: sale._id,
          userId: sale.user._id,
          userName: sale.userName || sale.user.name,
          userEmail: sale.userEmail || sale.user.email,
          products: sale.products.map((p) => ({
            productId: p.product._id,
            productName: p.productName,
            quantity: p.quantity,
            price: p.price,
          })),
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          status: sale.status,
          deliveryMethod: sale.deliveryMethod,
          orderStatus: sale.orderStatus,
          deliveryAddress: sale.deliveryAddress,
          shippingCost: sale.shippingCost,
          date: sale.createdAt.toISOString().split("T")[0],
        }
      })
      .filter((sale) => sale !== null) // Filtrar ventas null

    res.status(200).json({
      success: true,
      data: formattedSales,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("user", "name email").populate("products.product", "name")

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: "Venta no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: sale._id,
        userId: sale.user._id,
        userName: sale.userName || sale.user.name,
        userEmail: sale.userEmail || sale.user.email,
        products: sale.products.map((p) => ({
          productId: p.product._id,
          productName: p.productName,
          quantity: p.quantity,
          price: p.price,
        })),
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        deliveryMethod: sale.deliveryMethod,
        orderStatus: sale.orderStatus,
        deliveryAddress: sale.deliveryAddress,
        shippingCost: sale.shippingCost,
        date: sale.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
export const createSale = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { products, paymentMethod, deliveryMethod, deliveryAddress, shippingCost } = req.body

   
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Debe agregar al menos un producto",
      })
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Método de pago es requerido",
      })
    }

    if (!deliveryMethod) {
      return res.status(400).json({
        success: false,
        error: "Método de entrega es requerido",
      })
    }

    if (deliveryMethod === "home_delivery") {
      if (
        !deliveryAddress ||
        !deliveryAddress.street ||
        !deliveryAddress.city ||
        !deliveryAddress.postalCode ||
        !deliveryAddress.country
      ) {
        return res.status(400).json({
          success: false,
          error: "Para envío a domicilio, la dirección completa es requerida (calle, ciudad, código postal, país)",
        })
      }
    }

    // Verify user exists
    const userDoc = await User.findById(userId)
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      })
    }

    // Verify user has client role
    if (userDoc.role !== "client") {
      return res.status(403).json({
        success: false,
        error: "Solo los clientes pueden realizar compras",
      })
    }

    // Verify products and calculate total
    let total = 0
    const saleProducts = []

    for (const item of products) {
      const productId = item.product || item.productId

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: "ID de producto inválido",
        })
      }

      const product = await Product.findById(productId)

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Producto no encontrado`,
        })
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: "Cantidad debe ser mayor a 0",
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        })
      }

      // Update product stock
      product.stock -= item.quantity
      await product.save()

      saleProducts.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      })

      total += product.price * item.quantity
    }

    if (total <= 0) {
      return res.status(400).json({
        success: false,
        error: "El total debe ser mayor a 0",
      })
    }

    const finalTotal = total + (shippingCost || 0)

    const initialOrderStatus = "En preparación"

    // Create sale
    const sale = await Sale.create({
      user: userId,
      userName: userDoc.name,
      userEmail: userDoc.email,
      products: saleProducts,
      total: finalTotal,
      paymentMethod,
      status: "completed",
      deliveryMethod,
      deliveryAddress: deliveryMethod === "home_delivery" ? deliveryAddress : null,
      orderStatus: initialOrderStatus,
      shippingCost: shippingCost || 0,
    })


    const populatedSale = await Sale.findById(sale._id)
      .populate("user", "name email")
      .populate("products.product", "name")

    res.status(201).json({
      success: true,
      data: {
        id: populatedSale._id,
        userId: populatedSale.user._id,
        userName: populatedSale.userName,
        userEmail: populatedSale.userEmail,
        products: populatedSale.products.map((p) => ({
          productId: p.product._id,
          productName: p.productName,
          quantity: p.quantity,
          price: p.price,
        })),
        total: populatedSale.total,
        paymentMethod: populatedSale.paymentMethod,
        status: populatedSale.status,
        deliveryMethod: populatedSale.deliveryMethod,
        orderStatus: populatedSale.orderStatus,
        deliveryAddress: populatedSale.deliveryAddress,
        shippingCost: populatedSale.shippingCost,
        date: populatedSale.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("[v0] Sale creation error:", error.message)
    next(error)
  }
}

// @desc    Update sale status
// @route   PATCH /api/sales/:id/status
// @access  Private
export const updateSaleStatus = async (req, res, next) => {
  try {
    const { status, orderStatus } = req.body

    const sale = await Sale.findById(req.params.id)

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: "Venta no encontrada",
      })
    }

    if (status) {
      sale.status = status
    }

    if (orderStatus) {
      // Validate order status based on delivery method
      const validStatusesForDeliveryMethod =
        sale.deliveryMethod === "home_delivery"
          ? ["En preparación", "En envío", "Entregado"]
          : ["En preparación", "Preparado", "Entregado"]

      if (!validStatusesForDeliveryMethod.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          error: `Estado de orden inválido para ${sale.deliveryMethod}`,
        })
      }

      sale.orderStatus = orderStatus

      if (orderStatus === "Entregado") {
        const saleData = {
          id: sale._id.toString().slice(-8),
          date: sale.createdAt,
          userName: sale.userName,
          userEmail: sale.userEmail,
          products: sale.products,
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          status: sale.status,
          deliveryMethod: sale.deliveryMethod,
          deliveryAddress: sale.deliveryAddress,
          orderStatus: sale.orderStatus,
          shippingCost: sale.shippingCost,
        }

        try {
          await sendSaleEmail(saleData)
        } catch (emailError) {
          console.error("[v0] Error sending email:", emailError.message)
          // Don't fail the update if email fails, just log it
        }
      }
    }

    await sale.save()

    const populatedSale = await Sale.findById(sale._id)
      .populate("user", "name email")
      .populate("products.product", "name")

    res.status(200).json({
      success: true,
      data: {
        id: populatedSale._id,
        userId: populatedSale.user._id,
        userName: populatedSale.userName,
        userEmail: populatedSale.userEmail,
        products: populatedSale.products.map((p) => ({
          productId: p.product._id,
          productName: p.productName,
          quantity: p.quantity,
          price: p.price,
        })),
        total: populatedSale.total,
        paymentMethod: populatedSale.paymentMethod,
        status: populatedSale.status,
        deliveryMethod: populatedSale.deliveryMethod,
        orderStatus: populatedSale.orderStatus,
        deliveryAddress: populatedSale.deliveryAddress,
        shippingCost: populatedSale.shippingCost,
        date: populatedSale.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get sales statistics
// @route   GET /api/sales/statistics
// @access  Private (Admin/Employee)
export const getSalesStatistics = async (req, res, next) => {
  try {
    const sales = await Sale.find()

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const completedSales = sales.filter((s) => s.status === "completed").length
    const pendingSales = sales.filter((s) => s.status === "pending").length
    const homeDeliveries = sales.filter((s) => s.deliveryMethod === "home_delivery").length
    const localPickups = sales.filter((s) => s.deliveryMethod === "local_pickup").length

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalRevenue,
        completedSales,
        pendingSales,
        homeDeliveries,
        localPickups,
        averageSale: totalSales > 0 ? totalRevenue / totalSales : 0,
      },
    })
  } catch (error) {
    next(error)
  }
}
