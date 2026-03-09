import axios from "axios";
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// In client/src/services/api.js, add:

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request:");
    } else {
      console.log("❌ No user found for request:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ API call successful");
    return response.data;
  },
  (error) => {
    console.error("❌ Response error:", error.config?.url, error.message);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);

      if (error.response.status === 401) {
        console.error("Unauthorized - token might be invalid");
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// In client/src/services/api.js, add:

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  getPhoto: () => api.get("/users/photo"), // 👈 New method
  updateProfile: (data) => api.put("/users/profile", data),
  getStats: () => api.get("/users/stats"),
  deleteAccount: () => api.delete("/users/account"),
};
// Interview API
export const interviewAPI = {
  create: (data) => api.post("/interviews", data),
  getAll: (params) => api.get("/interviews", { params }),
  getOne: (id) => api.get(`/interviews/${id}`),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
