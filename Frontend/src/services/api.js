import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5001";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});


// ==========================================
// REQUEST INTERCEPTOR
// Automatically attach JWT
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ==========================================
// RESPONSE INTERCEPTOR
// Handle invalid / expired JWT
// ==========================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const currentPath =
        window.location.pathname;

      // Login/register errors can also be 401.
      // Don't cause redirect loops on auth pages.
      if (
        currentPath !== "/login" &&
        currentPath !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;