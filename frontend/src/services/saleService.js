import { apiRequest } from "../config/api";

export const saleService = {
  async getAll() {
    return await apiRequest("/sales");
  },

  async getById(id) {
    return await apiRequest(`/sales/${id}`);
  },

  async getByUser(userId) {
    return await apiRequest(`/sales?userId=${userId}`);
  },

  async getByDateRange(startDate, endDate) {
    return await apiRequest(`/sales?startDate=${startDate}&endDate=${endDate}`);
  },

  async create(saleData) {
    return await apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  },

  async updateStatus(id, status) {
    return await apiRequest(`/sales/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async updateOrderStatus(id, orderStatus) {
    return await apiRequest(`/sales/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ orderStatus }),
    });
  },

  async getStatistics() {
    return await apiRequest("/sales/statistics");
  },
};