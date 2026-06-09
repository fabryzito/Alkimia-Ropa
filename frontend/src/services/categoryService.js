import { apiRequest } from "../config/api"

export const categoryService = {
  // Get all categories
  async getAll() {
    return await apiRequest("/categories")
  },

  // Get category by ID
  async getById(id) {
    return await apiRequest(`/categories/${id}`)
  },

  // Create new category
  async create(categoryData) {
    return await apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    })
  },

  // Update category
  async update(id, categoryData) {
    return await apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    })
  },

  // Delete category
  async delete(id) {
    return await apiRequest(`/categories/${id}`, {
      method: "DELETE",
    })
  },
}
