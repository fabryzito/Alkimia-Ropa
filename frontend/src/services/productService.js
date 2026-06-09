import { apiRequest } from "../config/api"

export const productService = {
  // Get all products
  async getAll() {
    return await apiRequest("/products")
  },

  // Get product by ID
  async getById(id) {
    return await apiRequest(`/products/${id}`)
  },

  // Get products by category
  async getByCategory(categoryId) {
    return await apiRequest(`/products?category=${categoryId}`)
  },

  // Search products
  async search(query) {
    return await apiRequest(`/products/search?q=${encodeURIComponent(query)}`)
  },

  // Create new product
  async create(productData) {
    return await apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  },

  // Update product
  async update(id, productData) {
    return await apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  },

  // Delete product
  async delete(id) {
    return await apiRequest(`/products/${id}`, {
      method: "DELETE",
    })
  },

  // Update stock
  async updateStock(id, quantity) {
    return await apiRequest(`/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock: quantity }),
    })
  },
}
