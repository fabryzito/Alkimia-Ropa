import { create } from "zustand";
import { apiRequest } from "../config/api";

const buildUser = (userData) => ({
  id: userData._id || userData.id,
  _id: userData._id,
  name: userData.name,
  email: userData.email,
  role: userData.role,
  status: userData.status,
  ...userData,
});

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initializeAuth: async () => {
    try {
      set({ loading: true, error: null });

      const cachedUser = localStorage.getItem("auth_user");

      if (cachedUser) {
        try {
          const userObj = JSON.parse(cachedUser);
          set({ user: userObj, loading: false });

          const response = await apiRequest("/auth/me");

          if (response.success) {
            const freshUser = buildUser(response.data);
            set({ user: freshUser, loading: false });
            localStorage.setItem("auth_user", JSON.stringify(freshUser));
          }
        } catch (error) {
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_token");
          set({ user: null, loading: false });
        }

        return;
      }

      const response = await apiRequest("/auth/me");

      if (response.success) {
        const userObj = buildUser(response.data);
        set({ user: userObj, loading: false });
        localStorage.setItem("auth_user", JSON.stringify(userObj));
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error("[Auth initialization error]", error);
      set({ user: null, loading: false, error: error.message });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success) {
        const userObj = buildUser(response.data.user);

        if (response.token) {
          localStorage.setItem("auth_token", response.token);
        }

        localStorage.setItem("auth_user", JSON.stringify(userObj));
        set({ user: userObj, loading: false, error: null });

        return { success: true, user: userObj };
      }

      const message = response.message || response.error || "Credenciales inválidas";
      set({ loading: false, error: message });
      return { success: false, message };
    } catch (error) {
      const message = error.message || "Error al iniciar sesión";
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  register: async (name, email, password, passwordConfirm) => {
    try {
      set({ loading: true, error: null });

      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      });

      if (response.success) {
        const userObj = buildUser(response.data.user);

        if (response.token) {
          localStorage.setItem("auth_token", response.token);
        }

        localStorage.setItem("auth_user", JSON.stringify(userObj));
        set({ user: userObj, loading: false, error: null });

        return { success: true, user: userObj };
      }

      const message = response.message || response.error || "Error al registrarse";
      set({ loading: false, error: message });
      return { success: false, message };
    } catch (error) {
      const message = error.message || "Error al registrarse";
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("[Logout error]", error);
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      set({ user: null, error: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  hasRole: (requiredRoles) => {
    const store = get();

    if (!store.user) return false;

    return Array.isArray(requiredRoles)
      ? requiredRoles.includes(store.user.role)
      : store.user.role === requiredRoles;
  },
}));