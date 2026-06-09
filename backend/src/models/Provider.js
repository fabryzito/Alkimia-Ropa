import mongoose from "mongoose"

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del proveedor es obligatorio"],
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"],
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Provider", providerSchema)
