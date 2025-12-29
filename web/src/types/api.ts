export interface Category {
  id: number;
  name: string;
  slug?: string;
  parentId?: number;
  children?: Category[];
  image?: string;
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
export interface ProductPrice {
  id: number;
  groupId?: number;
  price: number;
}
export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
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
  prices?: ProductPrice[];
  price: number; // dynamic/calculated price
}
export interface OrderDetail {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}
export interface Order {
  id: number;
  userId: number;
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
export interface Group {
  id: number;
  name: string;
  description?: string;
}
export interface Role {
  id: number;
  name: string;
  description?: string;
}
export interface Permission {
  id: number;
  name: string;
  description?: string;
}
const parseId = (value: any): number => Number(value ?? 0);
const parseNumber = (value: any, defaultValue: number = 0): number =>
  Number(value ?? defaultValue);
export const normalizeCategory = (raw: any): Category => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  slug: raw?.slug ?? raw?.Slug,
  parentId: raw?.parent_id ?? raw?.ParentID,
  children: Array.isArray(raw?.children ?? raw?.Children)
    ? (raw?.children ?? raw?.Children).map(normalizeCategory)
    : undefined,
  image: raw?.image,
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
  isPrimary: Boolean(raw?.is_primary ?? raw?.IsPrimary ?? false),
  order: parseNumber(raw?.order ?? raw?.Order, 0),
});
export const normalizeProductSize = (raw: any): ProductSize => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  stock: parseNumber(raw?.stock ?? raw?.Stock, 0),
  price:
    raw?.price ?? raw?.Price
      ? parseNumber(raw?.price ?? raw?.Price)
      : undefined,
});
export const normalizeProductColor = (raw: any): ProductColor => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  hexCode: raw?.hex_code ?? raw?.HexCode,
  stock: parseNumber(raw?.stock ?? raw?.Stock, 0),
});
export const normalizeProductPrice = (raw: any): ProductPrice => ({
  id: parseId(raw?.id ?? raw?.ID),
  groupId: raw?.group_id ?? raw?.GroupID,
  price: parseNumber(raw?.price ?? raw?.Price, 0),
});
export const normalizeProduct = (raw: any): Product => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description,
  sku: raw?.sku ?? raw?.SKU ?? "",
  stock: parseNumber(raw?.stock ?? raw?.Stock, 0),
  modelNumber: raw?.model_number ?? raw?.ModelNumber,
  warranty: raw?.warranty ?? raw?.Warranty,
  weight:
    raw?.weight ?? raw?.Weight
      ? parseNumber(raw?.weight ?? raw?.Weight)
      : undefined,
  dimensions: raw?.dimensions ?? raw?.Dimensions,
  power: raw?.power ?? raw?.Power,
  material: raw?.material ?? raw?.Material,
  capacity: raw?.capacity ?? raw?.Capacity,
  features: raw?.features ?? raw?.Features,
  isActive: Boolean(raw?.is_active ?? raw?.IsActive ?? true),
  categoryId: raw?.category_id ?? raw?.CategoryID,
  category:
    raw?.category ?? raw?.Category
      ? normalizeCategory(raw?.category ?? raw?.Category)
      : undefined,
  brandId: raw?.brand_id ?? raw?.BrandID,
  brand:
    raw?.brand ?? raw?.Brand
      ? normalizeBrand(raw?.brand ?? raw?.Brand)
      : undefined,
  images: Array.isArray(raw?.images ?? raw?.Images)
    ? (raw?.images ?? raw?.Images).map(normalizeProductImage)
    : undefined,
  sizes: Array.isArray(raw?.sizes ?? raw?.Sizes)
    ? (raw?.sizes ?? raw?.Sizes).map(normalizeProductSize)
    : undefined,
  colors: Array.isArray(raw?.colors ?? raw?.Colors)
    ? (raw?.colors ?? raw?.Colors).map(normalizeProductColor)
    : undefined,
  prices: Array.isArray(raw?.prices ?? raw?.Prices)
    ? (raw?.prices ?? raw?.Prices).map(normalizeProductPrice)
    : undefined,
  price: parseNumber(raw?.price ?? raw?.Price, 0),
});
export const normalizeOrderDetail = (raw: any): OrderDetail => ({
  id: parseId(raw?.id ?? raw?.ID),
  productId: parseId(raw?.product_id ?? raw?.ProductID),
  quantity: parseNumber(raw?.quantity ?? raw?.Quantity, 1),
  unitPrice: parseNumber(raw?.unit_price ?? raw?.UnitPrice, 0),
  subtotal: parseNumber(raw?.subtotal ?? raw?.Subtotal, 0),
  product:
    raw?.product ?? raw?.Product
      ? normalizeProduct(raw?.product ?? raw?.Product)
      : undefined,
});
export const normalizeOrder = (raw: any): Order => ({
  id: parseId(raw?.id ?? raw?.ID),
  userId: parseId(raw?.user_id ?? raw?.UserID),
  total: parseNumber(raw?.total ?? raw?.Total, 0),
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
  balance: parseNumber(raw?.balance ?? raw?.Balance, 0),
  currency: raw?.currency ?? raw?.Currency ?? "IRR",
  updatedAt: raw?.updated_at ?? raw?.UpdatedAt,
});
export const normalizeGroup = (raw: any): Group => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description,
});
export const normalizeRole = (raw: any): Role => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description,
});
export const normalizePermission = (raw: any): Permission => ({
  id: parseId(raw?.id ?? raw?.ID),
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description,
});
