import { apiRequest } from "../config/api"

export const saleService = {
  // Get all sales
  async getAll() {
    return await apiRequest("/sales")
  },

  // Get sale by ID
  async getById(id) {
    return await apiRequest(`/sales/${id}`)
  },

  // Get sales by user
  async getByUser(userId) {
    return await apiRequest(`/sales?userId=${userId}`)
  },

  // Get sales by date range
  async getByDateRange(startDate, endDate) {
    return await apiRequest(`/sales?startDate=${startDate}&endDate=${endDate}`)
  },

  async create(saleData) {
    const result = await apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    })
    return result
  },

  // Update sale status
  async updateStatus(id, status) {
    return await apiRequest(`/sales/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },

  async updateOrderStatus(id, orderStatus) {
    return await apiRequest(`/sales/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ orderStatus }),
    })
  },

  // Get sales statistics
  async getStatistics() {
    return await apiRequest("/sales/statistics")
  },
}
