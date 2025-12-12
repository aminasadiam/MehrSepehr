import { A } from "@solidjs/router";
import { For, Show, createMemo, createResource, createSignal } from "solid-js";
import { categoriesApi, productsApi, brandsApi } from "../utils/api";
import {
  Category,
  Product,
  normalizeCategory,
  normalizeProduct,
} from "../types/api";

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const Products = () => {
  const [categoryFilter, setCategoryFilter] = createSignal<string>("all");
  const [brandFilter, setBrandFilter] = createSignal<string>("all");
  const [searchTerm, setSearchTerm] = createSignal("");

  const [categories] = createResource<Category[]>(async () => {
    const response = await categoriesApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeCategory);
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
      const response = await productsApi.getAll({
        categoryId: filters.category === "all" ? undefined : filters.category,
        brandId: filters.brand === "all" ? undefined : filters.brand,
        q: filters.q || undefined,
      });
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeProduct).filter((p) => p.isActive !== false);
    }
  );

  const filteredProducts = createMemo(() => products() ?? []);

  return (
    <section
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10"
      dir="rtl"
    >
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p class="section-kicker">کاتالوگ آنلاین</p>
          <h1 class="text-3xl font-semibold text-slate-900">
            تمام محصولات مهر سپهر
          </h1>
          <p class="mt-2 text-slate-500">
            موجودی فروشگاه به‌روزرسانی شده است. بر اساس دسته‌بندی یا نام کالا
            جستجو کنید و سفارش خود را آنلاین ثبت کنید.
          </p>
        </div>
        <A href="/orders" class="btn btn-primary whitespace-nowrap">
          پیگیری سفارش
          <i class="fa-solid fa-arrow-left-long text-sm"></i>
        </A>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <label class="col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input
            type="search"
            placeholder="نام محصول، برند یا کد کالا"
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
          class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          value={categoryFilter()}
          onInput={(event) => setCategoryFilter(event.currentTarget.value)}
        >
          <option value="all">همه دسته‌ها</option>
          <Show when={categories()}>
            <For each={categories()}>
              {(category) => (
                <option value={category.id.toString()}>{category.name}</option>
              )}
            </For>
          </Show>
        </select>
        <select
          class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
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

      <Show
        when={!products.loading}
        fallback={
          <div class="text-center text-slate-500 py-12">
            <div class="text-4xl mb-4">⏳</div>
            <div>در حال بارگذاری لیست محصولات...</div>
          </div>
        }
      >
        <Show
          when={filteredProducts().length > 0}
          fallback={
            <div class="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
              <div class="text-5xl mb-4">🔍</div>
              <p class="text-lg font-semibold mb-2">هیچ محصولی یافت نشد</p>
              <p>هیچ محصولی مطابق با فیلترهای انتخابی وجود ندارد.</p>
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
                  : null;

                return (
                  <article class="product-card group hover:shadow-lg transition-all duration-300">
                    {/* Product Image */}
                    <div class="product-card__media relative overflow-hidden rounded-t-2xl">
                      <Show
                        when={imageUrl}
                        fallback={
                          <div class="w-full h-52 bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <i class="fa-solid fa-image text-4xl text-slate-300"></i>
                          </div>
                        }
                      >
                        <img
                          src={imageUrl!}
                          alt={primaryImage?.alt || product.name}
                          class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Show>
                      {product.brand && (
                        <div class="absolute top-3 right-3">
                          <span class="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-semibold text-slate-700 shadow-sm">
                            {product.brand.name}
                          </span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span class="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">
                            ناموجود
                          </span>
                        </div>
                      )}
                    </div>

                    <div class="product-card__body space-y-2.5 p-4">
                      <div class="flex items-start justify-between gap-2 text-xs">
                        <p class="badge text-[11px]">
                          {product.category?.name ?? "دسته‌بندی نشده"}
                        </p>
                        {product.sizes && product.sizes.length > 0 && (
                          <span class="text-[11px] text-slate-500">
                            {product.sizes.length} اندازه
                          </span>
                        )}
                      </div>

                      <h3 class="text-base font-semibold text-slate-900 line-clamp-2">
                        {product.name}
                      </h3>

                      <p class="product-card__meta text-xs text-slate-600 line-clamp-2">
                        {product.description ||
                          "جزئیات محصول به زودی تکمیل می‌شود."}
                      </p>

                      {/* Product Features */}
                      <Show
                        when={
                          product.modelNumber ||
                          product.power ||
                          product.capacity
                        }
                      >
                        <div class="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                          <Show when={product.modelNumber}>
                            <span class="px-2 py-1 bg-slate-100 rounded">
                              مدل: {product.modelNumber}
                            </span>
                          </Show>
                          <Show when={product.power}>
                            <span class="px-2 py-1 bg-slate-100 rounded">
                              {product.power}
                            </span>
                          </Show>
                          <Show when={product.capacity}>
                            <span class="px-2 py-1 bg-slate-100 rounded">
                              {product.capacity}
                            </span>
                          </Show>
                        </div>
                      </Show>

                      <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span class="font-mono text-[11px]">
                          کد: {product.sku}
                        </span>
                        <Show
                          when={product.stock > 0}
                          fallback={<span class="text-red-500">ناموجود</span>}
                        >
                          <span>موجودی: {product.stock}</span>
                        </Show>
                      </div>

                      <div class="product-card__actions pt-2">
                        <div class="flex items-center justify-between gap-2.5">
                          <A
                            href={`/products/${product.id}`}
                            class="btn btn-soft flex-1 text-center text-sm py-2"
                          >
                            مشاهده جزئیات
                          </A>
                          <button
                            class="btn btn-primary whitespace-nowrap text-sm py-2"
                            type="button"
                            disabled={product.stock === 0}
                          >
                            {formatPrice(product.price)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }}
            </For>
          </div>
        </Show>
      </Show>
    </section>
  );
};

export default Products;
