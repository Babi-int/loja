import axios from "axios";

/** Cliente HTTP: baseURL via VITE_API_URL; JWT do login anexado automaticamente. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@maricota:token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
