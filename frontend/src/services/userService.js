import { apiRequest } from "../config/api";

export const userService = {
  async getAll(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const queryString = query.toString();

    return await apiRequest(queryString ? `/users?${queryString}` : "/users");
  },

  async getById(id) {
    return await apiRequest(`/users/${id}`);
  },

  async getByRole(role) {
    return await apiRequest(`/users?role=${role}`);
  },

  async create(userData) {
    return await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async update(id, userData) {
    return await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  async delete(id) {
    return await apiRequest(`/users/${id}`, {
      method: "DELETE",
    });
  },

  async toggleStatus(id) {
    return await apiRequest(`/users/${id}/status`, {
      method: "PATCH",
    });
  },
};