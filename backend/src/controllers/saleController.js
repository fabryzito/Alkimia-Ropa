import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendSaleEmail } from "../services/emailService.js";

const normalizeOrderStatus = (status) => {
  const map = {
    "En preparaciÃ³n": "En preparación",
    "En envÃ­o": "En envío",
    "En preparación": "En preparación",
    "En envío": "En envío",
    Preparado: "Preparado",
    Entregado: "Entregado",
    Completado: "Completado",
  };
  return map[status] || status;
};

const formatSale = (sale) => ({
  id: sale._id,
  userId: sale.user?._id || sale.user,
  userName: sale.userName || sale.user?.name,
  userEmail: sale.userEmail || sale.user?.email,
  customerName: sale.customerName,
  customerEmail: sale.customerEmail,
  saleChannel: sale.saleChannel || "online",
  products: sale.products.map((p) => ({
    productId: p.product?._id || p.product,
    productName: p.productName,
    quantity: p.quantity,
    price: p.price,
  })),
  total: sale.total,
  paymentMethod: sale.paymentMethod,
  paymentStatus: sale.paymentStatus || "pending",
  status: sale.status,
  deliveryMethod: sale.deliveryMethod,
  orderStatus: normalizeOrderStatus(sale.orderStatus),
  deliveryAddress: sale.deliveryAddress,
  shippingCost: sale.shippingCost || 0,
  date: sale.createdAt.toISOString().split("T")[0],
});

const requireRole = (req, roles) => roles.includes(req.user?.role);

const restoreStockForSale = async (sale) => {
  for (const item of sale.products || []) {
    if (!item.product) continue;
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
};

export const getSales = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const query = {};

    if (userId) query.user = userId;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const sales = await Sale.find(query)
      .populate("user", "name email")
      .populate("products.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: sales.map(formatSale) });
  } catch (error) {
    next(error);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("user", "name email").populate("products.product", "name");

    if (!sale) return res.status(404).json({ success: false, error: "Venta no encontrada" });

    res.status(200).json({ success: true, data: formatSale(sale) });
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const {
      products,
      paymentMethod,
      deliveryMethod = "local_pickup",
      deliveryAddress,
      saleChannel,
      customerName,
      customerEmail,
    } = req.body;

    if (!products?.length) return res.status(400).json({ success: false, error: "Debe agregar al menos un producto" });
    if (!paymentMethod) return res.status(400).json({ success: false, error: "Método de pago requerido" });

    if (["credit_card", "debit_card"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        error: "El pago con tarjeta estará disponible próximamente con Mercado Pago",
      });
    }

    const isLocalSale = saleChannel === "local" || ["admin", "employee"].includes(req.user.role);

    if (!isLocalSale && req.user.role !== "client") {
      return res.status(403).json({ success: false, error: "Solo los clientes pueden comprar online" });
    }

    if (isLocalSale && !["admin", "employee"].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "No autorizado para venta local" });
    }

    if (!isLocalSale && deliveryMethod === "home_delivery") {
      if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.postalCode || !deliveryAddress?.country) {
        return res.status(400).json({ success: false, error: "La dirección completa es requerida" });
      }
    }

    const userDoc = await User.findById(req.user._id);
    if (!userDoc) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    let total = 0;
    const saleProducts = [];

    for (const item of products) {
      const productId = item.product || item.productId;
      const product = await Product.findById(productId);

      if (!product) return res.status(404).json({ success: false, error: "Producto no encontrado" });
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, error: "La cantidad debe ser mayor a 0" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      saleProducts.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
      total += product.price * item.quantity;
    }

    const paymentStatus = isLocalSale || paymentMethod === "cash" ? "paid" : "pending";
    const status = paymentStatus === "paid" ? "completed" : "pending";

    const sale = await Sale.create({
      user: req.user._id,
      userName: isLocalSale ? customerName || "Venta local" : userDoc.name,
      userEmail: isLocalSale ? customerEmail || userDoc.email : userDoc.email,
      customerName: customerName || "",
      customerEmail: customerEmail || "",
      saleChannel: isLocalSale ? "local" : "online",
      products: saleProducts,
      total,
      paymentMethod,
      paymentStatus,
      status,
      deliveryMethod: isLocalSale ? "local_pickup" : deliveryMethod,
      deliveryAddress: !isLocalSale && deliveryMethod === "home_delivery" ? deliveryAddress : null,
      orderStatus: isLocalSale ? "Entregado" : "En preparación",
      shippingCost: 0,
    });

    const populatedSale = await Sale.findById(sale._id).populate("user", "name email").populate("products.product", "name");
    res.status(201).json({ success: true, data: formatSale(populatedSale) });
  } catch (error) {
    next(error);
  }
};

export const updateSaleStatus = async (req, res, next) => {
  try {
    const { status, orderStatus, paymentStatus } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) return res.status(404).json({ success: false, error: "Venta no encontrada" });

    if (paymentStatus) {
      if (!["pending", "paid", "cancelled"].includes(paymentStatus)) {
        return res.status(400).json({ success: false, error: "Estado de pago inválido" });
      }
      sale.paymentStatus = paymentStatus;
      sale.status = paymentStatus === "paid" ? "completed" : paymentStatus === "cancelled" ? "cancelled" : "pending";
    }

    if (status) sale.status = status;

    if (orderStatus) {
      const normalizedStatus = normalizeOrderStatus(orderStatus);
      const validStatuses =
        sale.deliveryMethod === "home_delivery"
          ? ["En preparación", "En envío", "Entregado"]
          : ["En preparación", "Preparado", "Entregado"];

      if (!validStatuses.includes(normalizedStatus)) {
        return res.status(400).json({ success: false, error: "Estado de orden inválido" });
      }

      sale.orderStatus = normalizedStatus;

      if (normalizedStatus === "Entregado") {
        try {
          await sendSaleEmail(formatSale(sale));
        } catch (emailError) {
          console.error("[Email error]", emailError.message);
        }
      }
    }

    await sale.save();

    const populatedSale = await Sale.findById(sale._id).populate("user", "name email").populate("products.product", "name");
    res.status(200).json({ success: true, data: formatSale(populatedSale) });
  } catch (error) {
    next(error);
  }
};

export const deleteSale = async (req, res, next) => {
  try {
    if (!requireRole(req, ["admin"])) {
      return res.status(403).json({ success: false, error: "Solo admin puede eliminar ventas" });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, error: "Venta no encontrada" });

    await restoreStockForSale(sale);
    await sale.deleteOne();

    res.status(200).json({ success: true, message: "Venta eliminada y stock restaurado" });
  } catch (error) {
    next(error);
  }
};

export const resetSalesReports = async (req, res, next) => {
  try {
    if (!requireRole(req, ["admin"])) {
      return res.status(403).json({ success: false, error: "Solo admin puede reiniciar reportes" });
    }

    const sales = await Sale.find();
    for (const sale of sales) {
      await restoreStockForSale(sale);
    }

    const deleted = await Sale.deleteMany();

    res.status(200).json({
      success: true,
      message: "Reportes reiniciados. Ventas eliminadas y stock restaurado.",
      data: { deletedSales: deleted.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesStatistics = async (req, res, next) => {
  try {
    const sales = await Sale.find();
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    res.status(200).json({
      success: true,
      data: {
        totalSales: sales.length,
        totalRevenue,
        completedSales: sales.filter((s) => s.status === "completed").length,
        pendingSales: sales.filter((s) => s.status === "pending").length,
        pendingPayments: sales.filter((s) => s.paymentStatus === "pending").length,
        paidPayments: sales.filter((s) => s.paymentStatus === "paid").length,
        localSales: sales.filter((s) => s.saleChannel === "local").length,
        onlineSales: sales.filter((s) => s.saleChannel !== "local").length,
        homeDeliveries: sales.filter((s) => s.deliveryMethod === "home_delivery").length,
        localPickups: sales.filter((s) => s.deliveryMethod === "local_pickup").length,
        averageSale: sales.length > 0 ? totalRevenue / sales.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};