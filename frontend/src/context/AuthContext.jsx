import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

/** Estado de sessão: token + user no localStorage; rotas privadas leem isAuthenticated. */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("@maricota:user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("@maricota:token", data.token);
    localStorage.setItem("@maricota:user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("@maricota:token");
    localStorage.removeItem("@maricota:user");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      login,
      logout,
      user
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
