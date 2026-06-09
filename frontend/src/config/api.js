// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL 

// Helper function to handle API requests with credentials (cookies)
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    ...options,
    credentials: "include", // Include cookies in requests
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    let data
    try {
      data = await response.json()
    } catch (e) {
      // If response is not JSON, create error object
      data = { success: false, error: response.statusText || "Error desconocido" }
    }

    if (!response.ok) {
      const error = new Error(data.error || data.message || "Error en la petición")
      error.response = data
      error.status = response.status
      throw error
    }

    return data
  } catch (error) {
    console.error("[v0] API Error:", error.message)
    return {
      success: false,
      error: error.response?.error || error.message || "Error en la conexión",
    }
  }
}

export { API_BASE_URL }
