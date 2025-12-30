// api.ts کامل و اصلاح‌شده
const API_BASE_URL = "http://localhost:3000/api";
const BASE_URL = "http://localhost:3000";

// Utility function to build image URLs
export const getImageUrl = (path: string | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

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

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return `${this.baseURL}${endpoint}`;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    }
    const q = query.toString();
    return `${this.baseURL}${endpoint}${q ? `?${q}` : ""}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("token");
    const url = this.buildUrl(endpoint, params);

    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    const response = await fetch(url, { ...options, headers });

    let data: any = {};
    try {
      data = await response.json();
    } catch {}

    if (!response.ok) {
      const errorMsg =
        data.error || data.message || response.statusText || "Request failed";
      throw new ApiError(errorMsg, response.status);
    }

    return data as ApiResponse<T>;
  }

  get<T>(endpoint: string, params?: Record<string, any>) {
    return this.request<T>(endpoint, { method: "GET" }, params);
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  upload<T>(endpoint: string, form: FormData) {
    return this.post<T>(endpoint, form);
  }
}

const api = new ApiClient(API_BASE_URL);

export const authApi = {
  register: (payload: any) => api.post("/auth/register", payload),
  login: (payload: any) => api.post("/auth/login", payload),
  getProfile: () => api.get("/auth/profile"),
};

export const categoriesApi = {
  getAll: () => api.get("/admin/categories"),
  create: (payload: any) => api.post("/admin/categories", payload),
  update: (id: number | string, payload: any) =>
    api.put(`/admin/categories/${id}`, payload),
  delete: (id: number | string) => api.delete(`/admin/categories/${id}`),
};

export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id: number | string) => api.get(`/users/${id}`),
  create: (payload: any) => api.post("/users", payload),
  update: (id: number | string, payload: any) =>
    api.put(`/users/${id}`, payload),
  delete: (id: number | string) => api.delete(`/users/${id}`),
  addRole: (id: number | string, roleId: number) =>
    api.post(`/users/${id}/roles`, { role_id: roleId }),
  removeRole: (id: number | string, roleId: number) =>
    api.delete(`/users/${id}/roles/${roleId}`),
  uploadAvatar: (id: number | string, form: FormData) =>
    api.upload(`/users/${id}/avatar`, form),
};

export const productsApi = {
  getAll: (params?: any) => api.get("/products", params),
  getById: (id: number | string) => api.get(`/products/${id}`),
  create: (payload: any) => api.post("/products", payload),
  update: (id: number | string, payload: any) =>
    api.put(`/products/${id}`, payload),
  delete: (id: number | string) => api.delete(`/products/${id}`),
  uploadImage: (id: number | string, form: FormData) =>
    api.upload(`/products/${id}/images`, form),
  setGroupPrice: (productId: number | string, groupId: number, price: number) =>
    api.post(`/products/${productId}/prices`, { group_id: groupId, price }),
  removeGroupPrice: (productId: number | string, groupId: number) =>
    api.delete(`/products/${productId}/prices/${groupId}`),
};

export const ordersApi = {
  getAll: () => api.get("/orders"),
  adminGetAll: () => api.get("/admin/orders"),
  getById: (id: number | string) => api.get(`/orders/${id}`),
  create: (payload: any) => api.post("/orders", payload),
  updateStatus: (id: number | string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  remove: (id: number | string) => api.delete(`/admin/orders/${id}`),
};

export const walletApi = {
  getMyWallet: () => api.get("/wallet"),
  addBalance: (amount: number) => api.post("/wallet/add", { amount }),
  adminGetById: (userId: number | string) => api.get(`/admin/wallet/${userId}`),
  adminAddBalance: (userId: number | string, amount: number) =>
    api.post(`/admin/wallet/${userId}/add`, { amount }),
};

export const rolesApi = {
  getAll: () => api.get("/admin/roles"),
  create: (payload: any) => api.post("/admin/roles", payload),
  delete: (id: number | string) => api.delete(`/admin/roles/${id}`),
  addPermissionToRole: (roleId: number, permId: number) =>
    api.post(`/admin/roles/${roleId}/permissions`, { permission_id: permId }),
  removePermissionFromRole: (roleId: number, permId: number) =>
    api.delete(`/admin/roles/${roleId}/permissions/${permId}`),
};

export const permissionsApi = {
  getAll: () => api.get("/admin/permissions"),
  create: (payload: any) => api.post("/admin/permissions", payload),
  delete: (id: number | string) => api.delete(`/admin/permissions/${id}`),
};

export const groupsApi = {
  getAll: () => api.get("/admin/groups"),
  create: (payload: any) => api.post("/admin/groups", payload),
  delete: (id: number | string) => api.delete(`/admin/groups/${id}`),
  addProductToGroup: (id: number | string, productId: number) =>
    api.post(`/admin/groups/${id}/products`, { product_id: productId }),
  removeProductFromGroup: (id: number | string, productId: number) =>
    api.delete(`/admin/groups/${id}/products/${productId}`),
  addUser: (id: number | string, userId: number) =>
    api.post(`/admin/groups/${id}/users`, { user_id: userId }),
  removeUser: (id: number | string, userId: number) =>
    api.delete(`/admin/groups/${id}/users/${userId}`),
};

export const brandsApi = {
  getAll: () => api.get("/brands"),
  create: (payload: any) => api.post("/brands", payload),
  getById: (id: number | string) => api.get(`/brands/${id}`),
  update: (id: number | string, payload: any) =>
    api.put(`/brands/${id}`, payload),
  delete: (id: number | string) => api.delete(`/brands/${id}`),
};

export const adminApi = {
  users: usersApi,
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  wallet: walletApi,
  roles: rolesApi,
  permissions: permissionsApi,
  groups: groupsApi,
  brands: brandsApi,
};
