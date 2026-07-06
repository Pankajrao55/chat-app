import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setAuthUser(data.user);
    } catch (error) {
      setAuthUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    setAuthUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    setAuthUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ authUser, setAuthUser, checkingAuth, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
