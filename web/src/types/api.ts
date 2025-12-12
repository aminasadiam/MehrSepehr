export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSize {
  id: number;
  name: string;
  stock: number;
  price?: number;
}

export interface ProductColor {
  id: number;
  name: string;
  hexCode?: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  modelNumber?: string;
  warranty?: string;
  weight?: number;
  dimensions?: string;
  power?: string;
  material?: string;
  capacity?: string;
  features?: string;
  isActive: boolean;
  categoryId?: number;
  category?: Category;
  brandId?: number;
  brand?: Brand;
  images?: ProductImage[];
  sizes?: ProductSize[];
  colors?: ProductColor[];
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

export const normalizeBrand = (raw: any): Brand => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description,
  logo: raw?.logo ?? raw?.Logo,
});

export const normalizeProductImage = (raw: any): ProductImage => ({
  id: parseId(raw?.id ?? raw?.ID),
  url: raw?.url ?? raw?.URL ?? "",
  alt: raw?.alt ?? raw?.Alt,
  isPrimary: raw?.is_primary ?? raw?.IsPrimary ?? false,
  order: Number(raw?.order ?? raw?.Order ?? 0),
});

export const normalizeProductSize = (raw: any): ProductSize => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  stock: Number(raw?.stock ?? raw?.Stock ?? 0),
  price: raw?.price ?? raw?.Price ? Number(raw?.price ?? raw?.Price) : undefined,
});

export const normalizeProductColor = (raw: any): ProductColor => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  hexCode: raw?.hex_code ?? raw?.HexCode,
  stock: Number(raw?.stock ?? raw?.Stock ?? 0),
});

export const normalizeProduct = (raw: any): Product => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description ?? "",
  sku: raw?.sku ?? raw?.SKU ?? "",
  price: Number(raw?.price ?? raw?.Price ?? 0),
  stock: Number(raw?.stock ?? raw?.Stock ?? 0),
  modelNumber: raw?.model_number ?? raw?.ModelNumber,
  warranty: raw?.warranty ?? raw?.Warranty,
  weight: raw?.weight ?? raw?.Weight ? Number(raw?.weight ?? raw?.Weight) : undefined,
  dimensions: raw?.dimensions ?? raw?.Dimensions,
  power: raw?.power ?? raw?.Power,
  material: raw?.material ?? raw?.Material,
  capacity: raw?.capacity ?? raw?.Capacity,
  features: raw?.features ?? raw?.Features,
  isActive: raw?.is_active ?? raw?.IsActive ?? true,
  categoryId: raw?.category_id ?? raw?.CategoryID,
  category: raw?.category || raw?.Category ? normalizeCategory(raw?.category || raw?.Category) : undefined,
  brandId: raw?.brand_id ?? raw?.BrandID,
  brand: raw?.brand || raw?.Brand ? normalizeBrand(raw?.brand || raw?.Brand) : undefined,
  images: Array.isArray(raw?.images ?? raw?.Images) 
    ? (raw?.images ?? raw?.Images).map(normalizeProductImage).sort((a, b) => {
        // Sort by isPrimary first, then by order
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.order - b.order;
      })
    : undefined,
  sizes: Array.isArray(raw?.sizes ?? raw?.Sizes) 
    ? (raw?.sizes ?? raw?.Sizes).map(normalizeProductSize)
    : undefined,
  colors: Array.isArray(raw?.colors ?? raw?.Colors) 
    ? (raw?.colors ?? raw?.Colors).map(normalizeProductColor)
    : undefined,
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

