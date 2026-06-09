import mongoose from "mongoose"

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },
    dni: {
      type: String,
      required: [true, "El DNI es obligatorio"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"],
    },
    phone: {
      type: String,
      trim: true,
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

// Index for search functionality
clientSchema.index({ name: "text", lastName: "text", dni: "text", email: "text" })

export default mongoose.model("Client", clientSchema)
