import { A } from "@solidjs/router";
import { For, Show, createMemo, createResource, createSignal } from "solid-js";
import { useAuth } from "../store/auth";
import { ApiError } from "../utils/api";
import { categoriesApi, productsApi, brandsApi } from "../utils/api";
import {
  Category,
  Product,
  normalizeCategory,
  normalizeProduct,
} from "../types/api";

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const skeletonCard = (
  <article class="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-pulse">
    <div class="h-64 bg-slate-200" />
    <div class="p-6 space-y-4">
      <div class="h-4 w-20 bg-slate-200 rounded-full" />
      <div class="h-6 w-3/4 bg-slate-200 rounded" />
      <div class="h-4 w-1/2 bg-slate-200 rounded" />
    </div>
  </article>
);

const Products = () => {
  const [categoryFilter, setCategoryFilter] = createSignal<string>("all");
  const [brandFilter, setBrandFilter] = createSignal<string>("all");
  const [searchTerm, setSearchTerm] = createSignal("");

  const [categories] = createResource<Category[]>(async () => {
    try {
      const response = await categoriesApi.getAll();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeCategory);
    } catch (err: any) {
      // If backend requires auth for this endpoint, treat as guest (no-op)
      if (err instanceof ApiError && err.status === 401) {
        return [] as Category[];
      }
      console.error("Failed to load categories:", err);
      return [] as Category[];
    }
  });

  const [brands] = createResource(async () => {
    try {
      const response = await brandsApi.getAll();
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  });

  const [products] = createResource<
    Product[],
    { category: string; brand: string; q: string }
  >(
    () => ({
      category: categoryFilter(),
      brand: brandFilter(),
      q: searchTerm().trim(),
    }),
    async (filters) => {
      try {
        const response = await productsApi.getAll({
          categoryId: filters.category === "all" ? undefined : filters.category,
          brandId: filters.brand === "all" ? undefined : filters.brand,
          q: filters.q || undefined,
        });
        const payload = Array.isArray(response.data) ? response.data : [];
        return payload
          .map(normalizeProduct)
          .filter((p) => p.isActive !== false);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          // guest users may not have access to admin-protected product list; show empty
          return [] as Product[];
        }
        console.error("Failed to load products:", err);
        return [] as Product[];
      }
    }
  );

  const filteredProducts = createMemo(() => products() ?? []);
  const auth = useAuth();

  return (
    <div class="min-h-screen" dir="rtl">
      {/* Hero Header */}
      <section class="relative overflow-hidden bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
              <i class="fa-solid fa-box text-lg"></i>
              <span class="text-white/90 text-sm font-medium">
                کاتالوگ محصولات
              </span>
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              تمام محصولات مهر سپهر
            </h1>
            <p class="text-lg sm:text-xl text-indigo-100 mb-8 max-w-xl leading-relaxed">
              موجودی فروشگاه به‌روزرسانی شده است. بر اساس دسته‌بندی یا نام کالا
              جستجو کنید و سفارش خود را آنلاین ثبت کنید.
            </p>
            <div class="flex flex-wrap gap-4">
              <A
                href="/orders"
                class="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              >
                پیگیری سفارش
                <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              </A>
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" class="w-full h-16 sm:h-24">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
      </section>

      {/* Filters Section */}
      <section class="bg-slate-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <label class="sm:col-span-2 flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 px-5 py-4 shadow-sm transition-all">
              <i class="fa-solid fa-magnifying-glass text-indigo-500"></i>
              <input
                type="search"
                placeholder="نام محصول، برند یا کد کالا..."
                class="w-full border-none bg-transparent text-sm focus:outline-none"
                value={searchTerm()}
                onInput={(event) => setSearchTerm(event.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSearchTerm(e.currentTarget.value);
                  }
                }}
              />
            </label>
            <select
              class="rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-5 py-4 text-sm shadow-sm transition-all cursor-pointer"
              value={categoryFilter()}
              onInput={(event) => setCategoryFilter(event.currentTarget.value)}
            >
              <option value="all">همه دسته‌ها</option>
              <Show when={categories()}>
                <For each={categories()}>
                  {(category) => (
                    <option value={category.id.toString()}>
                      {category.name}
                    </option>
                  )}
                </For>
              </Show>
            </select>
            <select
              class="rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-5 py-4 text-sm shadow-sm transition-all cursor-pointer"
              value={brandFilter()}
              onInput={(event) => setBrandFilter(event.currentTarget.value)}
            >
              <option value="all">همه برندها</option>
              <Show when={brands()}>
                <For each={brands()}>
                  {(brand: any) => (
                    <option value={brand.ID ?? brand.id}>
                      {brand.Name ?? brand.name}
                    </option>
                  )}
                </For>
              </Show>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <Show
          when={!products.loading}
          fallback={
            <div class="product-grid">
              {[
                skeletonCard,
                skeletonCard,
                skeletonCard,
                skeletonCard,
                skeletonCard,
                skeletonCard,
              ]}
            </div>
          }
        >
          <Show
            when={filteredProducts().length > 0}
            fallback={
              <div class="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                <div class="text-6xl mb-6">🔍</div>
                <p class="text-2xl font-bold text-slate-900 mb-3">
                  هیچ محصولی یافت نشد
                </p>
                <p class="text-slate-600 text-lg">
                  هیچ محصولی مطابق با فیلترهای انتخابی وجود ندارد.
                </p>
              </div>
            }
          >
            <div class="product-grid">
              <For each={filteredProducts()}>
                {(product) => {
                  const primaryImage =
                    product.images?.find((img) => img.isPrimary) ||
                    product.images?.[0];
                  const imageUrl = primaryImage?.url
                    ? primaryImage.url.startsWith("http")
                      ? primaryImage.url
                      : `http://localhost:8080${primaryImage.url}`
                    : undefined;

                  return (
                    <article class="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100">
                      <div class="relative overflow-hidden">
                        <Show
                          when={imageUrl}
                          fallback={
                            <div class="w-full h-64 bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <i class="fa-solid fa-image text-5xl text-slate-300"></i>
                            </div>
                          }
                        >
                          <div class="aspect-square overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={primaryImage?.alt || product.name}
                              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                            />
                          </div>
                        </Show>
                        <div class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {product.brand && (
                          <div class="absolute top-4 right-4">
                            <span class="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 shadow-lg">
                              {product.brand.name}
                            </span>
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span class="px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-xl">
                              ناموجود
                            </span>
                          </div>
                        )}
                        <div class="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span class="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-600">
                            <i class="fa-solid fa-eye ml-1"></i>
                            مشاهده
                          </span>
                        </div>
                      </div>

                      <div class="p-6 space-y-4">
                        <div class="flex items-center justify-between">
                          <span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                            {product.category?.name ?? "دسته‌بندی نشده"}
                          </span>
                          {product.sizes && product.sizes.length > 0 && (
                            <span class="text-xs text-slate-500 font-medium">
                              <i class="fa-solid fa-ruler-combined ml-1"></i>
                              {product.sizes.length} اندازه
                            </span>
                          )}
                        </div>

                        <h3 class="text-lg font-bold text-slate-900 line-clamp-2 min-h-14 group-hover:text-indigo-600 transition-colors">
                          <A href={`/products/${product.id}`}>{product.name}</A>
                        </h3>

                        <p class="text-sm text-slate-600 line-clamp-2 min-h-10">
                          {product.description ||
                            "جزئیات محصول به زودی تکمیل می‌شود."}
                        </p>

                        <Show
                          when={
                            product.modelNumber ||
                            product.power ||
                            product.capacity
                          }
                        >
                          <div class="flex flex-wrap gap-2">
                            <Show when={product.modelNumber}>
                              <span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                مدل: {product.modelNumber}
                              </span>
                            </Show>
                            <Show when={product.power}>
                              <span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                {product.power}
                              </span>
                            </Show>
                            <Show when={product.capacity}>
                              <span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                {product.capacity}
                              </span>
                            </Show>
                          </div>
                        </Show>

                        <Show
                          when={auth.isAuthenticated()}
                          fallback={
                            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span class="text-sm text-slate-600">
                                برای مشاهده قیمت و موجودی لطفاً وارد شوید
                              </span>
                              <A
                                href="/login"
                                class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                              >
                                ورود
                              </A>
                            </div>
                          }
                        >
                          {/* Authenticated view: show sku, stock and price/actions */}
                          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                            <span class="text-xs text-slate-500 font-mono">
                              کد: {product.sku}
                            </span>
                            <Show
                              when={product.stock > 0}
                              fallback={
                                <span class="text-red-500 font-bold text-sm">
                                  ناموجود
                                </span>
                              }
                            >
                              <span class="flex items-center gap-1 text-xs text-green-600 font-bold">
                                <i class="fa-solid fa-check-circle"></i>موجود:{" "}
                                {product.stock}
                              </span>
                            </Show>
                          </div>

                          <div class="flex gap-3 pt-2">
                            <A
                              href={`/products/${product.id}`}
                              class="flex-1 text-center px-4 py-2.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-xl font-bold text-sm transition-all duration-300"
                            >
                              جزئیات
                            </A>
                            <button
                              class="flex-1 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                              disabled={product.stock === 0}
                            >
                              {formatPrice(product.price)}
                            </button>
                          </div>
                        </Show>
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
