import { apiRequest } from "../config/api"

export const clientService = {
  // Get all clients
  async getAll() {
    return await apiRequest("/clients")
  },

  // Get client by ID
  async getById(id) {
    return await apiRequest(`/clients/${id}`)
  },

  // Search clients
  async search(query) {
    return await apiRequest(`/clients/search?q=${encodeURIComponent(query)}`)
  },

  // Create new client
  async create(clientData) {
    return await apiRequest("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    })
  },

  // Update client
  async update(id, clientData) {
    return await apiRequest(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    })
  },

  // Delete client
  async delete(id) {
    return await apiRequest(`/clients/${id}`, {
      method: "DELETE",
    })
  },
}
