import mongoose from "mongoose"

const saleProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
})

const saleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio"],
    },
    userName: String,
    userEmail: String,
    products: [saleProductSchema],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "cash", "transfer"],
      required: [true, "El método de pago es obligatorio"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    deliveryMethod: {
      type: String,
      enum: ["home_delivery", "local_pickup"],
      required: [true, "Método de entrega es obligatorio"],
    },
    deliveryAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
      notes: String,
    },
    orderStatus: {
      type: String,
      enum: ["En preparación", "En envío", "Preparado", "Entregado", "Completado"],
      default: "En preparación",
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for queries
saleSchema.index({ user: 1 })
saleSchema.index({ createdAt: -1 })
saleSchema.index({ status: 1 })
saleSchema.index({ orderStatus: 1 })
saleSchema.index({ deliveryMethod: 1 })

export default mongoose.model("Sale", saleSchema)
