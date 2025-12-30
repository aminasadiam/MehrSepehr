import { A, useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createResource, createSignal } from "solid-js";
import { useAuth } from "../store/auth";
import { productsApi, categoriesApi, brandsApi } from "../utils/api";
import {
  Product,
  normalizeProduct,
  Category,
  normalizeCategory,
  Brand,
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

const productImage = (product: Product, indexFallback: number) => {
  const primary =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const url = primary?.url;
  if (url) return url.startsWith("http") ? url : `http://localhost:8080${url}`;
  return fallbackImages[indexFallback % fallbackImages.length];
};

const categoryImage = (img?: string) => {
  if (!img) return "/assets/images/category-placeholder.jpg";
  return img.startsWith("http") ? img : `http://localhost:8080${img}`;
};

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} ریال`;

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

const getProductSpecs = (product: Product): string[] => {
  const specs: string[] = [];
  if (product.material) specs.push(`جنس: ${product.material}`);
  if (product.capacity) specs.push(`ظرفیت: ${product.capacity}`);
  if (product.power) specs.push(`توان: ${product.power}`);
  if (product.weight) specs.push(`وزن: ${product.weight}کیلوگرم`);
  if (product.warranty) specs.push(`گارانتی: ${product.warranty}`);
  return specs.slice(0, 2);
};

const Home = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [cartAdded, setCartAdded] = createSignal<number | null>(null);
  const [email, setEmail] = createSignal("");
  const [newsletterMessage, setNewsletterMessage] = createSignal("");

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
      const normalized = payload.map(normalizeCategory);

      const hasChildrenField = normalized.some(
        (n) => Array.isArray(n.children) && n.children.length > 0
      );
      if (hasChildrenField) return normalized;

      const map = new Map<number, any>();
      normalized.forEach((n) => map.set(n.id, { ...n, children: [] }));
      const roots: any[] = [];
      map.forEach((node) => {
        const pid = node.parentId ?? null;
        if (pid && map.has(pid)) {
          map.get(pid).children.push(node);
        } else {
          roots.push(node);
        }
      });
      return roots;
    } catch (error) {
      console.log("Categories require authentication");
      return [];
    }
  });

  const [brands] = createResource<Brand[]>(async () => {
    try {
      const response = await brandsApi.getAll();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload;
    } catch (error) {
      console.log("Error loading brands:", error);
      return [];
    }
  });

  const [products] = createResource<Product[]>(async () => {
    try {
      const response = await productsApi.getAll();
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeProduct);
    } catch (error) {
      console.log("Error loading products:", error);
      return [];
    }
  });

  const filteredCategories = createMemo(() => categories()?.slice(0, 6) || []);
  const featuredProducts = createMemo(() => products()?.slice(0, 8) || []);
  const visibleBrands = createMemo(() => brands()?.slice(0, 6) || []);

  const handleAddToCart = (product: Product, e: Event) => {
    e.preventDefault();
    if (product.stock === 0) return;

    const cart = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart") || "[]")
      : [];
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartAdded(product.id);
    setTimeout(() => setCartAdded(null), 1500);
  };

  return (
    <div class="min-h-screen bg-white" dir="rtl">
      {/* Hero Section */}
      <section class="relative h-[75vh] min-h-[500px] overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <img
          src="/assets/images/hero-kitchen.jpg"
          alt="لوازم آشپزخانه مهر سپهر"
          class="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        <div class="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <div class="mb-6 animate-bounce">
            <span class="text-6xl sm:text-7xl">🍳</span>
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight">
            فروشگاه آنلاین مهر سپهر
          </h1>
          <p class="text-base sm:text-lg lg:text-xl text-slate-200 mb-8 max-w-3xl leading-relaxed font-light">
            بهترین انتخاب برای لوازم آشپزخانه با کیفیت برتر، قیمت عادلانه، و
            خدمات ویژه
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <A
              href="/products"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 scale-100 hover:scale-105"
            >
              <i class="fa-solid fa-shopping-cart"></i>
              شروع خرید
            </A>
            <A
              href="/products"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border-2 border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              <i class="fa-solid fa-eye"></i>
              مشاهده محصولات
            </A>
          </div>

          {/* Stats Bar */}
          <div class="mt-12 flex gap-8 sm:gap-16 text-center">
            <div class="group">
              <div class="text-3xl font-bold text-blue-300">۱۰۰+</div>
              <div class="text-xs text-slate-300 mt-1">محصول متنوع</div>
            </div>
            <div class="group">
              <div class="text-3xl font-bold text-cyan-300">۲۴/۷</div>
              <div class="text-xs text-slate-300 mt-1">پشتیبانی آنلاین</div>
            </div>
            <div class="group">
              <div class="text-3xl font-bold text-purple-300">🚚</div>
              <div class="text-xs text-slate-300 mt-1">تحویل سریع</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section class="py-20 sm:py-28 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div class="absolute top-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -ml-48 -mt-48"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -mr-48 -mb-48"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div class="text-center mb-16">
            <div class="inline-block mb-4 animate-pulse">
              <span class="text-6xl sm:text-7xl">📂</span>
            </div>
            <h2 class="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">
              دسته‌بندی‌های محبوب
            </h2>
            <div class="flex items-center justify-center gap-3 mb-4">
              <div class="h-1.5 w-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              <p class="text-slate-600 text-lg font-medium">
                محصولات را براساس دسته‌بندی خود انتخاب کنید
              </p>
              <div class="h-1.5 w-16 bg-linear-to-r from-indigo-600 to-blue-600 rounded-full"></div>
            </div>
          </div>

          <Show
            when={!categories.loading}
            fallback={
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(skeletonCard)}
              </div>
            }
          >
            <Show
              when={filteredCategories().length > 0}
              fallback={
                <div class="text-center py-16">
                  <p class="text-slate-600 text-lg mb-4">
                    دسته‌بندی‌ها فعلاً موجود نیست
                  </p>
                  <A
                    href="/products"
                    class="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
                  >
                    <i class="fa-solid fa-arrow-left"></i>
                    رفتن به محصولات
                  </A>
                </div>
              }
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <For each={filteredCategories()}>
                  {(category, idx) => {
                    const colors = [
                      "from-blue-600 to-cyan-600",
                      "from-indigo-600 to-blue-600",
                      "from-purple-600 to-indigo-600",
                      "from-pink-600 to-purple-600",
                      "from-orange-600 to-pink-600",
                      "from-amber-600 to-orange-600",
                    ];
                    const iconBg = [
                      "bg-blue-100 text-blue-600",
                      "bg-indigo-100 text-indigo-600",
                      "bg-purple-100 text-purple-600",
                      "bg-pink-100 text-pink-600",
                      "bg-orange-100 text-orange-600",
                      "bg-amber-100 text-amber-600",
                    ];
                    const colorClass = colors[idx() % colors.length];
                    const bgClass = iconBg[idx() % iconBg.length];

                    return (
                      <A
                        href={`/products?category=${category.id}`}
                        class={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-72 bg-linear-to-br ${colorClass} transform hover:-translate-y-2`}
                      >
                        {/* Gradient Overlays */}
                        <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-all duration-300" />

                        {/* Icon Badge */}
                        <div class="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 group-hover:bg-white/30 transition-all">
                          <span class="text-lg">📦</span>
                          <span class="text-white text-sm font-bold">
                            {category.children?.length || 0}
                          </span>
                        </div>

                        {/* Content */}
                        <div class="absolute inset-0 flex flex-col items-end justify-end p-6 text-right">
                          <h3 class="text-3xl font-black text-white mb-3 group-hover:translate-y-1 transition-transform">
                            {category.name}
                          </h3>

                          <Show
                            when={
                              category.children && category.children.length > 0
                            }
                          >
                            <div class="flex items-center gap-2 text-slate-100 text-sm font-medium mb-4">
                              <i class="fa-solid fa-layer-group"></i>
                              <span>{category.children?.length} زیردسته</span>
                            </div>
                          </Show>

                          {/* Arrow Icon */}
                          <div class="flex items-center gap-2 text-white font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                            <span>مشاهده</span>
                            <i class="fa-solid fa-arrow-left text-lg group-hover:translate-x-1 transition-transform"></i>
                          </div>
                        </div>

                        {/* Hover Accent Line */}
                        <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30 group-hover:bg-white/60 transition-all duration-500"></div>
                      </A>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </section>

      {/* Featured Products Section */}
      <section class="py-20 sm:py-28 bg-linear-to-b from-white to-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <span class="text-6xl sm:text-7xl mb-4 inline-block">⭐</span>
            <h2 class="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">
              محصولات برتر و پرفروش
            </h2>
            <p class="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
              بهترین محصولات آشپزخانه را با بهترین قیمت‌ها دریافت کنید
            </p>
          </div>

          <Show
            when={!products.loading}
            fallback={
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8).fill(skeletonCard)}
              </div>
            }
          >
            <Show
              when={featuredProducts().length > 0}
              fallback={
                <div class="text-center py-16">
                  <i class="fa-solid fa-box text-6xl text-slate-300 mb-4 inline-block"></i>
                  <p class="text-slate-600 text-lg mb-6">
                    محصولی برای نمایش وجود ندارد
                  </p>
                  <A
                    href="/products"
                    class="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
                  >
                    <i class="fa-solid fa-arrow-left"></i>
                    مشاهده تمام محصولات
                  </A>
                </div>
              }
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <For each={featuredProducts()}>
                  {(product, index) => {
                    const imgSrc = productImage(product, index());
                    const specs = getProductSpecs(product);
                    const displayPrice = getProductPrice(
                      product,
                      userGroupIds()
                    );
                    const isAdded = createMemo(
                      () => cartAdded() === product.id
                    );

                    return (
                      <article class="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-slate-100 hover:border-blue-200 transform hover:-translate-y-2">
                        <A
                          href={`/products/${product.id}`}
                          class="shrink-0 relative"
                        >
                          <div class="relative h-56 overflow-hidden bg-slate-100">
                            <img
                              src={imgSrc}
                              alt={product.name}
                              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.stock === 0 && (
                              <div class="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                <span class="text-white font-black text-lg">
                                  ❌ تمام شد
                                </span>
                              </div>
                            )}
                            {product.stock > 0 && product.stock < 5 && (
                              <div class="absolute top-3 left-3 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                                ⏰ موجودی محدود
                              </div>
                            )}
                          </div>
                        </A>

                        {product.brand?.name && (
                          <div class="absolute top-3 right-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                            <i class="fa-solid fa-check-circle ml-1"></i>
                            {product.brand.name}
                          </div>
                        )}

                        <div class="p-4 grow flex flex-col">
                          <h3 class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
                            <A href={`/products/${product.id}`}>
                              {product.name}
                            </A>
                          </h3>

                          {product.description && (
                            <p class="text-xs text-slate-600 line-clamp-1 mb-3">
                              {product.description}
                            </p>
                          )}

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

                          <div class="flex items-center justify-between mb-4 pb-3 border-t border-slate-100">
                            <Show
                              when={auth.isAuthenticated() || displayPrice > 0}
                              fallback={
                                <span class="text-sm font-bold text-amber-600">
                                  برای مشاهده قیمت وارد شوید
                                </span>
                              }
                            >
                              <span class="text-lg font-black text-blue-600">
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

                          <button
                            class={`w-full px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                              isAdded()
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                : product.stock === 0
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:shadow-lg scale-100 hover:scale-105"
                            }`}
                            type="button"
                            disabled={product.stock === 0}
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <Show
                              when={isAdded()}
                              fallback={
                                <>
                                  <i class="fa-solid fa-cart-plus"></i>
                                  افزودن به سبد
                                </>
                              }
                            >
                              <i class="fa-solid fa-check"></i>
                              افزوده شد ✓
                            </Show>
                          </button>
                        </div>
                      </article>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>

          <div class="text-center mt-16">
            <A
              href="/products"
              class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 scale-100 hover:scale-105 text-lg"
            >
              <i class="fa-solid fa-arrow-right"></i>
              مشاهده تمام محصولات ({products()?.length || 0})
            </A>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section class="py-16 sm:py-24 bg-linear-to-r from-slate-900 to-slate-800 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center mb-12">
            <h2 class="text-3xl sm:text-4xl lg:text-4xl font-black text-white mb-3">
              برندهای معروف
            </h2>
            <p class="text-slate-300 text-lg">
              ما با بهترین برندهای جهان همکاری می‌کنیم
            </p>
          </div>

          <Show
            when={!brands.loading && visibleBrands().length > 0}
            fallback={
              <Show
                when={!brands.loading}
                fallback={
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(
                      <div class="h-32 bg-white/10 rounded-xl animate-pulse backdrop-blur-sm" />
                    )}
                  </div>
                }
              >
                <div class="text-center py-8">
                  <p class="text-slate-300 text-lg">
                    برندی برای نمایش وجود ندارد
                  </p>
                </div>
              </Show>
            }
          >
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <For each={visibleBrands()}>
                {(brand) => (
                  <div class="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 border border-white/20 hover:border-white/40 text-center">
                    {brand.logo && (
                      <img
                        src={
                          brand.logo.startsWith("http")
                            ? brand.logo
                            : `http://localhost:8080${brand.logo}`
                        }
                        alt={brand.name}
                        class="h-16 w-full object-contain mb-3 filter group-hover:brightness-110 transition-all"
                      />
                    )}
                    <h3 class="text-white font-bold text-sm line-clamp-1 group-hover:text-blue-300 transition-colors">
                      {brand.name}
                    </h3>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </section>

      {/* Features Section */}
      <section class="py-20 sm:py-28 bg-linear-to-b from-slate-50 to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">
              چرا ما را انتخاب کنید؟
            </h2>
            <p class="text-slate-600 text-lg max-w-2xl mx-auto">
              ما متعهد به ارائه بهترین تجربه خرید هستیم
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div class="group text-center p-8 rounded-2xl bg-linear-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 border border-blue-100 hover:border-blue-300 hover:shadow-lg">
              <div class="mb-6 flex justify-center">
                <div class="bg-linear-to-br from-blue-600 to-cyan-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <i class="fa-solid fa-truck text-2xl text-white"></i>
                </div>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">تحویل سریع</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                ارسال رایگان در سراسر کشور با بیمه محصول
              </p>
            </div>

            <div class="group text-center p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-100 hover:border-green-300 hover:shadow-lg">
              <div class="mb-6 flex justify-center">
                <div class="bg-linear-to-br from-green-600 to-emerald-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <i class="fa-solid fa-shield text-2xl text-white"></i>
                </div>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">محصولات اصل</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                تضمین ۱۰۰ درصد اصالت تمام محصولات
              </p>
            </div>

            <div class="group text-center p-8 rounded-2xl bg-linear-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:shadow-lg">
              <div class="mb-6 flex justify-center">
                <div class="bg-linear-to-br from-purple-600 to-pink-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <i class="fa-solid fa-headset text-2xl text-white"></i>
                </div>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">
                پشتیبانی ۲۴/۷
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                تیم پشتیبانی متخصص همیشه برای کمک شما
              </p>
            </div>

            <div class="group text-center p-8 rounded-2xl bg-linear-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 border border-orange-100 hover:border-orange-300 hover:shadow-lg">
              <div class="mb-6 flex justify-center">
                <div class="bg-linear-to-br from-orange-600 to-amber-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <i class="fa-solid fa-undo text-2xl text-white"></i>
                </div>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">بازگشت آسان</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                سیاست بازگشت تا ۱۴ روز بدون سؤال
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section class="py-16 sm:py-20 bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div class="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 class="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            درآمدی تخفیف‌های ویژه
          </h2>
          <p class="text-lg text-blue-100 mb-8 leading-relaxed">
            درآمد نامه‌ی ما را دریافت کنید و از آخرین تخفیف‌ها و محصولات جدید
            مطلع شوید
          </p>

          <form
            class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              // Handle newsletter signup
              setNewsletterMessage("تشکر! شما اکنون عضو ما هستید 🎉");
              setEmail("");
              setTimeout(() => setNewsletterMessage(""), 3000);
            }}
          >
            <input
              type="email"
              placeholder="آدرس ایمیل خود را وارد کنید..."
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
              class="grow px-6 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-sm"
            />
            <button
              type="submit"
              class="px-8 py-3 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 scale-100 hover:scale-105 whitespace-nowrap"
            >
              <i class="fa-solid fa-envelope ml-2"></i>
              اشتراک
            </button>
          </form>

          <Show when={newsletterMessage()}>
            <p class="text-white font-bold mt-4 animate-bounce">
              {newsletterMessage()}
            </p>
          </Show>
        </div>
      </section>

      {/* Final CTA Section */}
      <section class="py-16 sm:py-20 bg-linear-to-b from-white to-slate-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 class="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
            آماده خرید هستید؟
          </h2>
          <p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            هزاران محصول با کیفیت برتر، قیمت مناسب، و خدمات عالی منتظر شما هستند
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <A
              href="/products"
              class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 scale-100 hover:scale-105"
            >
              <i class="fa-solid fa-shopping-bag"></i>
              شروع خرید
            </A>
            <A
              href="/products"
              class="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-bold text-lg border-2 border-blue-600 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <i class="fa-solid fa-eye"></i>
              مشاهده کاتالوگ
            </A>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
