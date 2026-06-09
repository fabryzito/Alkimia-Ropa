import { create } from "zustand"
import { apiRequest } from "../config/api"

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initializeAuth: async () => {
    try {
      set({ loading: true, error: null })

      // First check localStorage for cached user
      const cachedUser = localStorage.getItem("auth_user")
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser)
          set({ user: userData, loading: false })
          // Then verify with backend in background
          const response = await apiRequest("/auth/me")
          if (response.success) {
            const freshUserData = response.data
            const userObj = {
              id: freshUserData._id || freshUserData.id,
              _id: freshUserData._id,
              name: freshUserData.name,
              email: freshUserData.email,
              role: freshUserData.role,
              status: freshUserData.status,
              ...freshUserData,
            }
            set({ user: userObj })
            localStorage.setItem("auth_user", JSON.stringify(userObj))
          } else {
            // Token might be expired
            localStorage.removeItem("auth_user")
            set({ user: null })
          }
        } catch (e) {
          localStorage.removeItem("auth_user")
          set({ user: null, loading: false })
        }
      } else {
        // No cached user, try to get from backend
        const response = await apiRequest("/auth/me")
        if (response.success) {
          const userData = response.data
          const userObj = {
            id: userData._id || userData.id,
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            ...userData,
          }
          set({ user: userObj, loading: false })
          localStorage.setItem("auth_user", JSON.stringify(userObj))
        } else {
          set({ user: null, loading: false })
        }
      }
    } catch (error) {
      console.error("[v0] Auth initialization error:", error)
      set({ user: null, loading: false, error: error.message })
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      if (response.success) {
        const userData = response.data.user
        const userObj = {
          id: userData._id || userData.id,
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          ...userData,
        }
        set({ user: userObj, loading: false, error: null })
        localStorage.setItem("auth_user", JSON.stringify(userObj))
        return { success: true, user: userObj }
      }

      const message = response.message || response.error || "Credenciales inválidas"
      set({ loading: false, error: message })
      return { success: false, message }
    } catch (error) {
      const message = error.message || "Error al iniciar sesión"
      set({ loading: false, error: message })
      return { success: false, message }
    }
  },

  register: async (name, email, password, passwordConfirm) => {
    try {
      set({ loading: true, error: null })
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      })

      if (response.success) {
        const userData = response.data.user
        const userObj = {
          id: userData._id || userData.id,
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          ...userData,
        }
        set({ user: userObj, loading: false, error: null })
        localStorage.setItem("auth_user", JSON.stringify(userObj))
        return { success: true, user: userObj }
      }

      const message = response.message || response.error || "Error al registrarse"
      set({ loading: false, error: message })
      return { success: false, message }
    } catch (error) {
      const message = error.message || "Error al registrarse"
      set({ loading: false, error: message })
      return { success: false, message }
    }
  },

  logout: async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      set({ user: null, error: null, loading: false })
      localStorage.removeItem("auth_user")
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if user has specific role(s)
  hasRole: (requiredRoles) => {
    const store = get()
    if (!store.user) return false
    return Array.isArray(requiredRoles) ? requiredRoles.includes(store.user.role) : store.user.role === requiredRoles
  },
}))
