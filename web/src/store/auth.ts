// auth.ts اصلاح‌شده
import { createSignal } from "solid-js";
import { ApiError, authApi } from "../utils/api";

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export type Role = { id?: number; name: string };
export type Group = { id?: number; name: string };

const [user, setUser] = createSignal<User | null>(null);
const [roles, setRoles] = createSignal<Role[]>([]);
const [groups, setGroups] = createSignal<Group[]>([]);
const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);
const [isProfileLoading, setIsProfileLoading] = createSignal<boolean>(false);

async function refreshProfile() {
  setIsProfileLoading(true);
  try {
    const res = await authApi.getProfile();
    if (res.success && res.data) {
      const data = res.data as any;
      setUser({
        id: data.id ?? data.ID,
        username: data.username ?? data.Username,
        email: data.email ?? data.Email,
        phone: data.phone ?? data.Phone,
        avatar: data.avatar ?? data.Avatar,
      });
      if (data.roles || data.Roles) {
        const rawRoles = data.roles ?? data.Roles;
        setRoles(
          rawRoles.map((r: any) => ({
            id: r.id ?? r.ID,
            name: r.name ?? r.Name,
          }))
        );
      } else {
        setRoles([]);
      }
      if (data.groups || data.Groups) {
        const rawGroups = data.groups ?? data.Groups;
        setGroups(
          rawGroups.map((g: any) => ({
            id: g.id ?? g.ID,
            name: g.name ?? g.Name,
          }))
        );
      } else {
        setGroups([]);
      }
      setIsAuthenticated(true);
    } else {
      logout();
    }
  } catch (error) {
    logout();
  } finally {
    setIsProfileLoading(false);
  }
}

// Check token on load
const token = localStorage.getItem("token");
if (token) {
  setIsAuthenticated(true);
  refreshProfile();
}

const login = async (email: string, password: string) => {
  try {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const data = res.data as any;
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      await refreshProfile();
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  } catch (error: any) {
    return { success: false, error: error.message || "Login failed" };
  }
};

const register = async (username: string, email: string, password: string) => {
  try {
    const res = await authApi.register({ username, email, password });
    if (res.success) {
      return await login(email, password);
    }
    return { success: false, error: res.error || "Registration failed" };
  } catch (error: any) {
    return { success: false, error: error.message || "Registration failed" };
  }
};

const logout = () => {
  localStorage.removeItem("token");
  setUser(null);
  setRoles([]);
  setGroups([]);
  setIsAuthenticated(false);
};

const isAdmin = () =>
  roles().some(
    (r) =>
      r.name.toLowerCase() === "admin" ||
      r.name.toLowerCase() === "administrator"
  );

export const useAuth = () => ({
  user,
  roles,
  groups,
  isAuthenticated,
  isProfileLoading,
  login,
  register,
  logout,
  refreshProfile,
  isAdmin,
});
