const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const apiRequest = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const formattedEndpoint =
    API_BASE_URL.endsWith("/api") || cleanEndpoint.startsWith("/api")
      ? cleanEndpoint
      : `/api${cleanEndpoint}`;

  const url = `${API_BASE_URL}${formattedEndpoint}`;

  const token = localStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    credentials: "include",
    headers,
  };

  try {
    const response = await fetch(url, config);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {
        success: false,
        error: response.statusText || "Error al procesar JSON",
      };
    }

    if (!response.ok) {
      const error = new Error(data.error || data.message || "Error en la petición");
      error.response = data;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[API Error]", error.message);
    return {
      success: false,
      error: error.response?.error || error.message || "Error en la conexión",
    };
  }
};

export { API_BASE_URL };