export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  categoryId?: number;
  category?: Category;
}

export interface OrderDetail {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  address?: string;
  paymentMethod?: string;
  createdAt?: string;
  details?: OrderDetail[];
}

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
  updatedAt?: string;
}

const parseId = (value: any): number =>
  typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number(value ?? 0);

export const normalizeCategory = (raw: any): Category => ({
  id: parseId(raw?.id ?? raw?.ID ?? raw?.category_id ?? raw?.CategoryID),
  name: raw?.name ?? raw?.Name ?? "",
  slug: raw?.slug ?? raw?.Slug,
});

export const normalizeProduct = (raw: any): Product => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description ?? "",
  sku: raw?.sku ?? raw?.SKU ?? "",
  price: Number(raw?.price ?? raw?.Price ?? 0),
  stock: Number(raw?.stock ?? raw?.Stock ?? 0),
  categoryId: raw?.category_id ?? raw?.CategoryID,
  category: raw?.category || raw?.Category ? normalizeCategory(raw?.category || raw?.Category) : undefined,
});

export const normalizeOrderDetail = (raw: any): OrderDetail => ({
  id: parseId(raw?.id ?? raw?.ID),
  productId: raw?.product_id ?? raw?.ProductID,
  quantity: Number(raw?.quantity ?? raw?.Quantity ?? 0),
  price: Number(raw?.price ?? raw?.Price ?? 0),
  product: raw?.product || raw?.Product ? normalizeProduct(raw?.product || raw?.Product) : undefined,
});

export const normalizeOrder = (raw: any): Order => ({
  id: parseId(raw?.id ?? raw?.ID),
  total: Number(raw?.total ?? raw?.Total ?? 0),
  status: raw?.status ?? raw?.Status ?? "pending",
  address: raw?.address ?? raw?.Address,
  paymentMethod: raw?.payment_method ?? raw?.PaymentMethod,
  createdAt: raw?.created_at ?? raw?.CreatedAt,
  details: Array.isArray(raw?.details ?? raw?.Details)
    ? (raw?.details ?? raw?.Details).map(normalizeOrderDetail)
    : undefined,
});

export const normalizeWallet = (raw: any): Wallet => ({
  id: parseId(raw?.id ?? raw?.ID),
  balance: Number(raw?.balance ?? raw?.Balance ?? 0),
  currency: raw?.currency ?? raw?.Currency ?? "IRR",
  updatedAt: raw?.updated_at ?? raw?.UpdatedAt,
});

