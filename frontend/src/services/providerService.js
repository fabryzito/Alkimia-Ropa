import { apiRequest } from "../config/api"

export const providerService = {
  // Get all providers
  async getAll() {
    return await apiRequest("/providers")
  },

  // Get provider by ID
  async getById(id) {
    return await apiRequest(`/providers/${id}`)
  },

  // Create new provider
  async create(providerData) {
    return await apiRequest("/providers", {
      method: "POST",
      body: JSON.stringify(providerData),
    })
  },

  // Update provider
  async update(id, providerData) {
    return await apiRequest(`/providers/${id}`, {
      method: "PUT",
      body: JSON.stringify(providerData),
    })
  },

  // Delete provider
  async delete(id) {
    return await apiRequest(`/providers/${id}`, {
      method: "DELETE",
    })
  },
}
