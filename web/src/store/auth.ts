import { createSignal } from "solid-js";
import { ApiError, authApi } from "../utils/api";

export interface User {
  id: number;
  username: string;
  email: string;
}

export type Role = { id?: number; name: string };

const [user, setUser] = createSignal<User | null>(null);
const [roles, setRoles] = createSignal<Role[]>([]);
const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);
const [isProfileLoading, setIsProfileLoading] = createSignal<boolean>(false);

// Check if user is logged in on init
const token = localStorage.getItem("token");
if (token) {
  setIsAuthenticated(true);
  refreshProfile();
}

async function refreshProfile() {
  try {
    setIsProfileLoading(true);
    const res = await authApi.getProfile();
    if (res.data) {
      const data = res.data as any;
      setUser({
        id: data.id ?? data.ID,
        username: data.username ?? data.Username,
        email: data.email ?? data.Email,
      });
      // capture roles if present
      if (data.roles) {
        setRoles(
          (data.roles as any[]).map((r) => ({
            id: r.ID ?? r.id,
            name: r.name ?? r.Name,
          }))
        );
      } else {
        setRoles([]);
      }
      setIsAuthenticated(true);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      localStorage.removeItem("token");
    }
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
  } finally {
    setIsProfileLoading(false);
  }
}

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.data && (response.data as any).token) {
        const token = (response.data as any).token;
        localStorage.setItem("token", token);
        const u = (response.data as any).user;
        setUser(u);
        if (u && u.roles) {
          setRoles(
            (u.roles as any).map((r: any) => ({
              id: r.ID ?? r.id,
              name: r.name ?? r.Name,
            }))
          );
        } else {
          setRoles([]);
        }
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await authApi.register(username, email, password);
      if (response.data && (response.data as any).token) {
        const token = (response.data as any).token;
        localStorage.setItem("token", token);
        const u = (response.data as any).user;
        setUser(u);
        if (u && u.roles) {
          setRoles(
            (u.roles as any).map((r: any) => ({
              id: r.ID ?? r.id,
              name: r.name ?? r.Name,
            }))
          );
        } else {
          setRoles([]);
        }
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setRoles([]);
  };

  const isAdmin = () =>
    roles().some((r) => r.name === "admin" || r.name === "administrator");

  return {
    user,
    isAuthenticated,
    isProfileLoading,
    login,
    register,
    logout,
    refreshProfile,
    isAdmin,
  };
};
