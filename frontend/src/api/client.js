import axios from "axios";

/** Cliente HTTP: baseURL via VITE_API_URL; JWT do login anexado automaticamente. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  /** Render free tier: cold start pode passar de 30s. */
  timeout: 120_000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@maricota:token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/** Token invalido/expirado ou segredo alterado: limpa sessao e volta ao login (evita erro em loop nas telas). */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = String(error.config?.url || "");

    if (status === 401 && !reqUrl.includes("/auth/login")) {
      localStorage.removeItem("@maricota:token");
      localStorage.removeItem("@maricota:user");
      const path = window.location.pathname || "";
      if (!path.endsWith("/login") && path !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
