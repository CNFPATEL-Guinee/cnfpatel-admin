import axios from "axios";

// Adresse permanente du backend en production (Render).
const API_BASE_URL = "https://cnfpatel-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
