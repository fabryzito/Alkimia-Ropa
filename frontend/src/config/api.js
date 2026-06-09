// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Helper function to handle API requests with credentials (cookies)
 * Automatically adds /api prefix if missing
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Aseguramos que el endpoint siempre tenga el prefijo /api
  const formattedEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;

  const config = {
    ...options,
    credentials: "include", // Incluye cookies en la petición
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { success: false, error: response.statusText || "Error al procesar JSON" };
    }

    if (!response.ok) {
      const error = new Error(data.error || data.message || "Error en la petición");
      error.response = data;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[v0] API Error:", error.message);
    return {
      success: false,
      error: error.response?.error || error.message || "Error en la conexión",
    };
  }
};

export { API_BASE_URL };