import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"
import Category from "../models/Category.js"
import Provider from "../models/Provider.js"
import Product from "../models/Product.js"
import Client from "../models/Client.js"

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await User.deleteMany()
    await Category.deleteMany()
    await Provider.deleteMany()
    await Product.deleteMany()
    await Client.deleteMany()
    console.log("🗑️  Cleared existing data")

    // Create users
    const users = await User.create([
      {
        name: "Mariano Lopera",
        email: "marianoo@gmail.com",
        password: "123321",
        role: "admin",
      },
      {
        name: "JNatalia Balegno",
        email: "natalia@gmail.com",
        password: "123321",
        role: "employee",
      },
      {
        name: "Cliente Alkimia",
        email: "cliente@alkimia.com",
        password: "123321",
        role: "client",
      },
    ])
    console.log("👥 Created users")

    // Create categories
    const categories = await Category.create([
      
    ])
    console.log("📚 Created categories")

    // Create providers
    const providers = await Provider.create([
      {
        
      },
    ])
    console.log("🏢 Created providers")

    // Create products
    const products = await Product.create([
      
       
    ])
    console.log("📖 Created products")

    // Create clients
    const clients = await Client.create([
      {
       
      },
    ])
    console.log("👤 Created clients")

    console.log("✅ Database seeded successfully!")
    console.log("\n📝 Test credentials:")
    console.log("Admin: mariano@gmail.com / 123321")
    console.log("Employee: natalia@gmail.com / 123321")
    console.log("Client: cliente@alkimia.com / 123321")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedData()
