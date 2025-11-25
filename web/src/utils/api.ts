const API_BASE_URL = "http://localhost:8080/api";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("token");

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.error || response.statusText || "Request failed",
          response.status
        );
      }

      return data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error?.message || "Network error", 0);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post("/auth/register", { username, email, password }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  getProfile: () => api.get("/auth/profile"),
};

// Products API
export const productsApi = {
  getAll: (categoryId?: number | string) => {
    const url = categoryId
      ? `/products?category_id=${categoryId}`
      : "/products";
    return api.get(url);
  },
  getById: (id: number | string) => api.get(`/products/${id}`),
  create: (product: any) => api.post("/products", product),
  update: (id: number | string, product: any) =>
    api.put(`/products/${id}`, product),
  delete: (id: number | string) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getById: (id: number | string) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
  create: (category: any) => api.post("/categories", category),
  update: (id: number | string, category: any) =>
    api.put(`/categories/${id}`, category),
  delete: (id: number | string) => api.delete(`/categories/${id}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id: number | string) => api.get(`/users/${id}`),
  update: (id: number | string, payload: any) =>
    api.put(`/users/${id}`, payload),
  delete: (id: number | string) => api.delete(`/users/${id}`),
  // admin role management
  addRole: (id: number | string, roleId: number) =>
    api.post(`/admin/users/${id}/roles`, { role_id: roleId }),
  removeRole: (id: number | string, roleId: number) =>
    api.delete(`/admin/users/${id}/roles/${roleId}`),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get("/orders"),
  getById: (id: number | string) => api.get(`/orders/${id}`),
  create: (order: any) => api.post("/orders", order),
  update: (id: number | string, order: any) => api.put(`/orders/${id}`, order),
  delete: (id: number | string) => api.delete(`/orders/${id}`),
  // admin endpoints
  adminGetAll: () => api.get("/admin/orders"),
  adminGetById: (id: number | string) => api.get(`/admin/orders/${id}`),
  adminUpdate: (id: number | string, order: any) =>
    api.put(`/admin/orders/${id}`, order),
  adminDelete: (id: number | string) => api.delete(`/admin/orders/${id}`),
};

// Wallet API
export const walletApi = {
  getMyWallet: () => api.get("/wallet"),
  addBalance: (amount: number) => api.post("/wallet/add", { amount }),
  getById: (id: number | string) => api.get(`/wallet/${id}`),
  // admin
  adminGetById: (id: number | string) => api.get(`/admin/wallet/${id}`),
  adminAddBalance: (id: number | string, amount: number) =>
    api.post(`/admin/wallet/${id}/add`, { amount }),
};

// Admin Roles & Permissions
export const adminApi = {
  // roles
  getRoles: () => api.get(`/admin/roles`),
  createRole: (payload: any) => api.post(`/admin/roles`, payload),
  getRole: (id: number | string) => api.get(`/admin/roles/${id}`),
  updateRole: (id: number | string, payload: any) =>
    api.put(`/admin/roles/${id}`, payload),
  deleteRole: (id: number | string) => api.delete(`/admin/roles/${id}`),
  addPermissionToRole: (id: number | string, permId: number) =>
    api.post(`/admin/roles/${id}/permissions`, { permission_id: permId }),
  removePermissionFromRole: (id: number | string, permId: number) =>
    api.delete(`/admin/roles/${id}/permissions/${permId}`),
  // permissions
  getPermissions: () => api.get(`/admin/permissions`),
  createPermission: (payload: any) => api.post(`/admin/permissions`, payload),
  getPermission: (id: number | string) => api.get(`/admin/permissions/${id}`),
  updatePermission: (id: number | string, payload: any) =>
    api.put(`/admin/permissions/${id}`, payload),
  deletePermission: (id: number | string) =>
    api.delete(`/admin/permissions/${id}`),
};
