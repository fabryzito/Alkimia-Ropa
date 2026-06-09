import { apiRequest } from "../config/api"

export const userService = {
  // Get all users
  async getAll() {
    return await apiRequest("/users")
  },

  // Get user by ID
  async getById(id) {
    return await apiRequest(`/users/${id}`)
  },

  // Get users by role
  async getByRole(role) {
    return await apiRequest(`/users?role=${role}`)
  },

  // Create new user
  async create(userData) {
    return await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  // Update user
  async update(id, userData) {
    return await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  // Delete user
  async delete(id) {
    return await apiRequest(`/users/${id}`, {
      method: "DELETE",
    })
  },

  // Toggle user status
  async toggleStatus(id) {
    return await apiRequest(`/users/${id}/status`, {
      method: "PATCH",
    })
  },
}
