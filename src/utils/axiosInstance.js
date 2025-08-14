import axios from "axios";
import { API_BASE_URL } from "./api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
