import { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data?.user ?? null);
    } catch {
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data?.access_token;
    if (token) localStorage.setItem("access_token", token);
    setUser(res.data?.user ?? null);
    return res.data;
  };

  const register = async ({ name, email, password, role }) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isSeller: user?.role === "seller",
      login,
      register,
      logout,
      reload: loadMe,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
