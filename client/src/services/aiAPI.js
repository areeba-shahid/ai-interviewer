import api from "./api";

export const aiAPI = {
  generateQuestions: (data) => api.post("/ai/generate-questions", data),
  evaluateAnswer: (data) => api.post("/ai/evaluate-answer", data),
  evaluateInterview: (id) => api.post(`/ai/evaluate-interview/${id}`),
  generateFollowUp: (data) => api.post("/ai/follow-up", data),
};
