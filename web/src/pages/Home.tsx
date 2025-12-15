import { A } from "@solidjs/router";
import { For, Show, createMemo, createResource } from "solid-js";
import { productsApi, categoriesApi } from "../utils/api";
import {
  Product,
  normalizeProduct,
  Category,
  normalizeCategory,
} from "../types/api";

const fallbackImages = [
  "/assets/images/IMG_20250920_112531_285.jpg",
  "/assets/images/WhatsApp-Image-2025-09-20-at-11.03.30-2.jpeg",
  "/assets/images/photo_2024-12-27_23-20-44.jpg",
  "/assets/images/e1c1d291f800e7c8f67e8b070549681c322dbe89_1603174412.jpg",
  "/assets/images/dd7197c77621521206b911e2739c49df437c9830_1603176952.jpg",
  "/assets/images/4740b694c13f350604a0382c9c9ffd15bd2a98cb_1603179813.jpg",
];

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

const productImage = (product: Product, indexFallback: number) => {
  const primary =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const url = primary?.url;
  if (url)
    return url.startsWith("http") ? url : `http://localhost:8080${url}`;
  return fallbackImages[indexFallback % fallbackImages.length];
};

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const Home = () => {
  const [products] = createResource<Product[]>(async () => {
    const response = await productsApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeProduct).filter((p) => p.isActive !== false);
  });

  const [categories] = createResource<Category[]>(async () => {
    const response = await categoriesApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeCategory);
  });

  const newestProducts = createMemo(() => (products() ?? []).slice(0, 6));

  return (
    <div class="min-h-screen" dir="rtl">
      {/* Hero Section - Modern Gradient */}
      <section class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28 md:py-36">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
              <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span class="text-white/90 text-sm font-medium">
                خوش آمدید به فروشگاه مهر سپهر
              </span>
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              <span class="block">لوازم آشپزخانه</span>
              <span class="block bg-linear-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                با کیفیت برتر
              </span>
            </h1>
            <p class="text-lg sm:text-xl text-indigo-100 mb-10 max-w-xl leading-relaxed">
              بهترین انتخاب برای آشپزخانه شما - از ظروف پخت و پز تا لوازم برقی
              خانگی با کیفیت ممتاز
            </p>
            <div class="flex flex-wrap gap-4">
              <A
                href="/products"
                class="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span class="absolute inset-0 bg-linear-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span class="relative z-10">مشاهده محصولات</span>
                <i class="fa-solid fa-arrow-left relative z-10 group-hover:translate-x-[-4px] transition-transform"></i>
              </A>
              <A
                href="/products"
                class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              >
                دسته‌بندی‌ها
                <i class="fa-solid fa-list"></i>
              </A>
            </div>
          </div>
        </div>
        {/* Wave Decoration */}
        <div class="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" class="w-full h-16 sm:h-24">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <Show when={categories() && categories()!.length > 0}>
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
          <div class="text-center mb-12">
            <div class="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-4">
              دسته‌بندی محصولات
            </div>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              دسته‌بندی‌های محبوب
            </h2>
            <p class="text-slate-600 text-lg max-w-2xl mx-auto">
              محصولات متنوع با کیفیت برتر در هر دسته‌بندی
            </p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            <For each={categories()}>
              {(category) => (
                <A
                  href={`/products?category_id=${category.id}`}
                  class="group relative bg-white rounded-3xl p-6 sm:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-transparent hover:border-indigo-300 overflow-hidden"
                >
                  <div class="absolute inset-0 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div class="relative z-10">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <i class="fa-solid fa-utensils text-2xl sm:text-3xl text-white"></i>
                    </div>
                    <h3 class="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </A>
              )}
            </For>
          </div>
        </section>
      </Show>

      {/* Newest Products */}
      <section class="bg-slate-50 py-16 sm:py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <div class="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-4">
                جدیدترین‌ها
              </div>
              <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
                محصولات جدید
              </h2>
              <p class="text-slate-600 text-lg">
                آخرین محصولات اضافه شده به فروشگاه
              </p>
            </div>
            <A
              href="/products"
              class="group inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-indigo-600 font-bold"
            >
              مشاهده همه
              <i class="fa-solid fa-arrow-left group-hover:translate-x-[-4px] transition-transform"></i>
            </A>
          </div>
          <div class="product-grid">
            <Show
              when={!products.loading}
              fallback={[skeletonCard, skeletonCard, skeletonCard]}
            >
              <Show
                when={newestProducts().length > 0}
                fallback={
                  <div class="col-span-full rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div class="text-6xl mb-4">📦</div>
                    <p class="text-slate-600 text-lg">هیچ محصولی در حال حاضر موجود نیست.</p>
                  </div>
                }
              >
                <For each={newestProducts()}>
                  {(product, index) => {
                    const primaryImage =
                      product.images?.find((i) => i.isPrimary) ||
                      product.images?.[0];
                    const imageUrl = primaryImage?.url
                      ? primaryImage.url.startsWith("http")
                        ? primaryImage.url
                        : `http://localhost:8080${primaryImage.url}`
                      : productImage(product, index());

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

                          <h3 class="text-lg font-bold text-slate-900 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-600 transition-colors">
                            <A href={`/products/${product.id}`}>
                              {product.name}
                            </A>
                          </h3>

                          <p class="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
                            {product.description ||
                              "جزئیات محصول به زودی تکمیل می‌شود."}
                          </p>

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
                                <i class="fa-solid fa-check-circle"></i>
                                موجود: {product.stock}
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
                        </div>
                      </article>
                    );
                  }}
                </For>
              </Show>
            </Show>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="relative overflow-hidden bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 sm:py-28">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
            آماده خرید هستید؟
          </h2>
          <p class="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            به فروشگاه ما مراجعه کنید و از بین هزاران محصول با کیفیت انتخاب
            کنید
          </p>
          <A
            href="/products"
            class="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
          >
            مشاهده همه محصولات
            <i class="fa-solid fa-arrow-left group-hover:translate-x-[-4px] transition-transform"></i>
          </A>
        </div>
      </section>
    </div>
  );
};

export default Home;
