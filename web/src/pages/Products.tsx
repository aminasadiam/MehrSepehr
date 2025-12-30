import { A, useSearchParams } from "@solidjs/router";
import {
  For,
  Show,
  createMemo,
  createResource,
  createSignal,
  createEffect,
} from "solid-js";
import { useAuth } from "../store/auth";
import { ApiError, getImageUrl } from "../utils/api";
import { categoriesApi, productsApi, brandsApi } from "../utils/api";
import {
  Category,
  normalizeCategory,
  normalizeProduct,
  Brand,
  Product,
} from "../types/api";

const fallbackImages = [
  "/assets/images/IMG_20250920_112531_285.jpg",
  "/assets/images/WhatsApp-Image-2025-09-20-at-11.03.30-2.jpeg",
  "/assets/images/photo_2024-12-27_23-20-44.jpg",
  "/assets/images/e1c1d291f800e7c8f67e8b070549681c322dbe89_1603174412.jpg",
  "/assets/images/dd7197c77621521206b911e2739c49df437c9830_1603176952.jpg",
  "/assets/images/4740b694c13f350604a0382c9c9ffd15bd2a98cb_1603179813.jpg",
];

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const productImage = (product: Product, indexFallback: number) => {
  const primary =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const url = primary?.url;
  if (url) return getImageUrl(url);
  return fallbackImages[indexFallback % fallbackImages.length];
};

const getProductSpecs = (product: Product): string[] => {
  const specs: string[] = [];
  if (product.material) specs.push(`جنس: ${product.material}`);
  if (product.capacity) specs.push(`ظرفیت: ${product.capacity}`);
  if (product.power) specs.push(`توان: ${product.power}`);
  if (product.warranty) specs.push(`گارانتی: ${product.warranty}`);
  return specs.slice(0, 2);
};

const getProductPrice = (
  product: Product,
  userGroupIds: number[] = []
): number => {
  if (!product.prices || product.prices.length === 0) {
    return product.price;
  }

  // Try to find price for user's group
  if (userGroupIds.length > 0) {
    for (const groupId of userGroupIds) {
      const groupPrice = product.prices.find((p) => p.groupId === groupId);
      if (groupPrice) return groupPrice.price;
    }
  }

  // Fall back to default price (groupId is null)
  const defaultPrice = product.prices.find((p) => !p.groupId);
  if (defaultPrice) return defaultPrice.price;

  return product.price;
};

const skeletonCard = (
  <article class="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-pulse">
    <div class="h-56 bg-gray-200" />
    <div class="p-5 space-y-3">
      <div class="h-3 w-20 bg-gray-200 rounded-full" />
      <div class="h-5 w-3/4 bg-gray-200 rounded" />
      <div class="h-3 w-1/2 bg-gray-200 rounded" />
      <div class="h-10 w-full bg-gray-200 rounded" />
    </div>
  </article>
);

const Products = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = createSignal<string>("all");
  const [brandFilter, setBrandFilter] = createSignal<string>("all");
  const [searchTerm, setSearchTerm] = createSignal(searchParams.search || "");

  // Update searchTerm and categoryId when URL params change
  createEffect(() => {
    if (searchParams.search) {
      const search = Array.isArray(searchParams.search)
        ? searchParams.search[0]
        : searchParams.search;
      setSearchTerm(search);
    }
    if (searchParams.categoryId) {
      const categoryId = Array.isArray(searchParams.categoryId)
        ? searchParams.categoryId[0]
        : searchParams.categoryId;
      setCategoryFilter(categoryId);
    }
  });

  const userGroupIds = createMemo(() =>
    auth
      .groups()
      .map((g) => g.id ?? 0)
      .filter((id) => id > 0)
  );

  const [categories] = createResource<Category[]>(async () => {
    try {
      const response = await categoriesApi.getAll();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeCategory);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        return [] as Category[];
      }
      console.error("Failed to load categories:", err);
      return [] as Category[];
    }
  });

  const [brands] = createResource<Brand[]>(async () => {
    const response = await brandsApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload;
  });

  const [products, { refetch }] = createResource<Product[]>(async () => {
    const params: any = {};

    // Add category filter if selected
    if (categoryFilter() !== "all") {
      const catId = Number(categoryFilter());
      if (!isNaN(catId)) params.categoryId = catId;
    }

    // Add brand filter if selected
    if (brandFilter() !== "all") {
      const brandId = Number(brandFilter());
      if (!isNaN(brandId)) params.brandId = brandId;
    }

    // Add search term if provided
    const search = searchTerm();
    const trimmedSearch = (Array.isArray(search) ? search[0] : search).trim();
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }

    const response = await productsApi.getAll(params);
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeProduct);
  });

  // Auto-refetch when filters or search change
  createEffect(() => {
    categoryFilter();
    brandFilter();
    searchTerm();
    refetch();
  });

  return (
    <div class="min-h-screen bg-slate-50 py-12">
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="section-kicker">فروشگاه</p>
            <h1 class="text-3xl font-bold text-slate-900">محصولات</h1>
          </div>
          <div class="flex gap-3 grow max-w-md">
            <input
              type="search"
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.currentTarget.value)}
              placeholder="جستجو نام یا SKU محصول..."
              class="grow rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <Show when={searchTerm()}>
              <button
                onClick={() => setSearchTerm("")}
                class="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-all"
                title="پاک کن"
              >
                ✕
              </button>
            </Show>
          </div>
        </div>

        {/* Filters */}
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="text-sm font-bold text-slate-600 flex items-center gap-2">
              <i class="fa-solid fa-filter"></i>
              فیلترها:
            </div>

            {/* Category Filter */}
            <div class="flex-1 min-w-[200px]">
              <label class="text-xs font-bold text-slate-600 block mb-2">
                دسته‌بندی
              </label>
              <select
                value={categoryFilter()}
                onChange={(e) => setCategoryFilter(e.currentTarget.value)}
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="all">📁 همه دسته‌ها</option>
                <For each={categories()}>
                  {(cat) => <option value={cat.id}>📂 {cat.name}</option>}
                </For>
              </select>
            </div>

            {/* Brand Filter */}
            <div class="flex-1 min-w-[200px]">
              <label class="text-xs font-bold text-slate-600 block mb-2">
                برند
              </label>
              <select
                value={brandFilter()}
                onChange={(e) => setBrandFilter(e.currentTarget.value)}
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="all">🏷️ همه برندها</option>
                <For each={brands()}>
                  {(brand) => <option value={brand.id}>🏢 {brand.name}</option>}
                </For>
              </select>
            </div>

            {/* Reset Filters Button */}
            <Show when={categoryFilter() !== "all" || brandFilter() !== "all"}>
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setBrandFilter("all");
                }}
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-2"
                title="بازنشانی فیلترها"
              >
                <i class="fa-solid fa-redo"></i>
                بازنشانی
              </button>
            </Show>
          </div>
        </div>

        <Show
          when={!products.loading}
          fallback={
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array(8).fill(skeletonCard)}
            </div>
          }
        >
          <Show
            when={products()!.length > 0}
            fallback={
              <p class="text-center text-slate-600">هیچ محصولی یافت نشد</p>
            }
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <For each={products()}>
                {(product, index) => {
                  const imgSrc = productImage(product, index());
                  const specs = getProductSpecs(product);
                  const displayPrice = getProductPrice(product, userGroupIds());

                  return (
                    <article class="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <A href={`/products/${product.id}`} class="shrink-0">
                        <div class="relative h-56 overflow-hidden bg-slate-100">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.stock === 0 && (
                            <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span class="text-white font-bold">تمام شد</span>
                            </div>
                          )}
                        </div>
                      </A>

                      {product.brand?.name && (
                        <div class="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                          {product.brand.name}
                        </div>
                      )}

                      <div class="p-4 grow flex flex-col">
                        <h3 class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          <A href={`/products/${product.id}`}>{product.name}</A>
                        </h3>

                        {specs.length > 0 && (
                          <div class="text-xs text-slate-600 space-y-1 mb-3 grow">
                            <For each={specs}>
                              {(spec) => (
                                <p class="flex items-center gap-2">
                                  <i class="fa-solid fa-check text-green-600 text-xs"></i>
                                  {spec}
                                </p>
                              )}
                            </For>
                          </div>
                        )}

                        <div class="flex items-center justify-between mb-3 pt-3 border-t border-slate-100">
                          <Show
                            when={auth.isAuthenticated() || displayPrice > 0}
                            fallback={
                              <span class="text-sm font-bold text-amber-600">
                                برای مشاهده قیمت وارد شوید
                              </span>
                            }
                          >
                            <span class="text-base font-bold text-blue-600">
                              {formatPrice(displayPrice)}
                            </span>
                          </Show>
                          <Show when={product.stock > 0}>
                            <span class="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                              <i class="fa-solid fa-check-circle"></i>
                              موجود
                            </span>
                          </Show>
                        </div>

                        <A
                          href={`/products/${product.id}`}
                          class={`w-full px-3 py-2 rounded-lg font-bold text-sm shadow-md transition-all duration-300 text-center ${
                            product.stock === 0
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                          }`}
                        >
                          مشاهده جزئیات
                        </A>
                      </div>
                    </article>
                  );
                }}
              </For>
            </div>
          </Show>
        </Show>
      </section>
    </div>
  );
};

export default Products;
