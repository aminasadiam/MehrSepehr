import { A } from "@solidjs/router";
import { For, Show, createMemo, createResource, createSignal } from "solid-js";
import { categoriesApi, productsApi } from "../utils/api";
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
  const [searchTerm, setSearchTerm] = createSignal("");

  const [categories] = createResource<Category[]>(async () => {
    const response = await categoriesApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeCategory);
  });

  const [products] = createResource<Product[], string>(
    categoryFilter,
    async (categoryId) => {
      const response = await productsApi.getAll(
        categoryId === "all" ? undefined : categoryId
      );
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeProduct);
    }
  );

  const filteredProducts = createMemo(() => {
    const list = products() ?? [];
    const query = searchTerm().trim().toLowerCase();
    if (!query) {
      return list;
    }
    return list.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  });

  return (
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10">
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

      <div class="grid gap-4 md:grid-cols-3">
        <label class="col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input
            type="search"
            placeholder="نام محصول، برند یا کد کالا"
            class="w-full border-none bg-transparent text-sm focus:outline-none"
            value={searchTerm()}
            onInput={(event) => setSearchTerm(event.currentTarget.value)}
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
      </div>

      <Show
        when={!products.loading}
        fallback={
          <div class="text-center text-slate-500">
            در حال بارگذاری لیست محصولات...
          </div>
        }
      >
        <Show
          when={filteredProducts().length > 0}
          fallback={
            <div class="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
              هیچ محصولی مطابق با جستجو پیدا نشد.
            </div>
          }
        >
          <div class="product-grid">
            <For each={filteredProducts()}>
              {(product) => (
                <article class="product-card">
                  <div class="product-card__body space-y-3">
                    <p class="badge">
                      {product.category?.name ?? "دسته‌بندی نشده"}
                    </p>
                    <h3>{product.name}</h3>
                    <p class="product-card__meta">
                      {product.description ||
                        "جزئیات محصول به زودی تکمیل می‌شود."}
                    </p>
                    <div class="flex items-center justify-between text-sm text-slate-500">
                      <span>کد: {product.sku}</span>
                      <span>انبار: {product.stock}</span>
                    </div>
                    <div class="product-card__actions">
                      <A href={`/products/${product.id}`} class="btn btn-soft">
                        مشاهده
                      </A>
                      <button class="btn btn-primary" type="button">
                        {formatPrice(product.price)}
                      </button>
                    </div>
                  </div>
                </article>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </section>
  );
};

export default Products;
