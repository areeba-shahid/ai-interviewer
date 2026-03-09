import api from "./api";

export const interviewAPI = {
  // Create new interview
  create: (data) => api.post("/interviews", data),

  // Get all interviews for user
  getAll: (params) => api.get("/interviews", { params }),

  // Get single interview
  getOne: (id) => api.get(`/interviews/${id}`),

  // Update interview (save answers, etc.)

  update: (id, data) => api.put(`/interviews/${id}`, data), // ✅ Should be PUT

  // Delete interview
  delete: (id) => api.delete(`/interviews/${id}`),

  // Get interview statistics
  getStats: () => api.get("/interviews/stats"),

  // Submit interview for evaluation
  submit: (id) => api.post(`/interviews/${id}/submit`),

  // Get feedback for interview
  getFeedback: (id) => api.get(`/interviews/${id}/feedback`),
};
