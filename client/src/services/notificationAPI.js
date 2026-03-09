import api from "./api";

export const notificationAPI = {
  // Get all notifications
  getAll: (params) => api.get("/notifications", { params }),

  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put("/notifications/read-all"),

  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),

  // Delete all read notifications
  deleteAllRead: () => api.delete("/notifications/read-all"),
};
