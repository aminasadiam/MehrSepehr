import { A, useNavigate, useParams } from "@solidjs/router";
import {
  For,
  Show,
  createResource,
  createSignal,
  createEffect,
} from "solid-js";
import { productsApi } from "../utils/api";
import { Product, normalizeProduct } from "../types/api";

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const ProductDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = createSignal(0);
  const [selectedSize, setSelectedSize] = createSignal<number | null>(null);
  const [selectedColor, setSelectedColor] = createSignal<number | null>(null);
  const [quantity, setQuantity] = createSignal(1);

  const [product] = createResource<Product | null>(async () => {
    if (!params.id) return null;
    const response = await productsApi.getById(params.id);
    return response.data ? normalizeProduct(response.data) : null;
  });

  // Reset gallery state when product changes
  createEffect(() => {
    const _ = product();
    setSelectedImageIndex(0);
  });

  const [related] = createResource(async () => {
    const current = product();
    if (!current?.categoryId) return [];
    const response = await productsApi.getAll({
      categoryId: current.categoryId,
    });
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload
      .map(normalizeProduct)
      .filter((item) => item.id !== current.id && item.isActive !== false)
      .slice(0, 4);
  });

  const currentProduct = () => product();
  const images = () => currentProduct()?.images || [];
  const sizes = () => currentProduct()?.sizes || [];
  const colors = () => currentProduct()?.colors || [];

  const selectedSizeData = () => {
    const sizeId = selectedSize();
    return sizeId !== null ? sizes().find((s) => s.id === sizeId) : null;
  };

  const selectedColorData = () => {
    const colorId = selectedColor();
    return colorId !== null ? colors().find((c) => c.id === colorId) : null;
  };

  const displayPrice = () => {
    const size = selectedSizeData();
    if (size?.price) return size.price;
    return currentProduct()?.price || 0;
  };

  const displayStock = () => {
    const size = selectedSizeData();
    const color = selectedColorData();
    if (size) return size.stock;
    if (color) return color.stock;
    return currentProduct()?.stock || 0;
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`;
  };

  const addToCart = () => {
    // TODO: Implement cart functionality
    alert("افزودن به سبد خرید - در حال توسعه");
  };

  return (
    <div class="min-h-screen" dir="rtl">
      {/* Back Button */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <button
          type="button"
          class="group inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 rounded-2xl font-semibold text-slate-700 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all duration-300"
          onClick={() => navigate(-1)}
          aria-label="بازگشت"
        >
          <i class="fa-solid fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
          بازگشت
        </button>
      </div>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10 md:space-y-12">
        <Show
          when={product()}
          fallback={
            <div class="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              {product.loading ? (
                <div>
                  <div class="text-6xl mb-6 animate-pulse">⏳</div>
                  <div class="text-xl font-semibold text-slate-700">
                    در حال بارگذاری اطلاعات محصول...
                  </div>
                </div>
              ) : (
                <div>
                  <div class="text-6xl mb-6">❌</div>
                  <div class="text-xl font-semibold text-slate-700 mb-2">
                    محصول مورد نظر یافت نشد.
                  </div>
                  <A
                    href="/products"
                    class="inline-block mt-4 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    بازگشت به لیست محصولات
                  </A>
                </div>
              )}
            </div>
          }
        >
          {(item) => {
            const productImages = images();
            const safeIndex = () => {
              if (productImages.length === 0) return 0;
              const idx = selectedImageIndex();
              return Math.min(Math.max(0, idx), productImages.length - 1);
            };
            const mainImage = () =>
              productImages[safeIndex()] || productImages[0];
            const mainImageUrl = () => {
              const img = mainImage();
              return img ? getImageUrl(img.url) : null;
            };

            return (
              <div class="space-y-10">
                {/* Main Product Section */}
                <div class="grid gap-6 md:gap-8 lg:grid-cols-[1.15fr_1fr] items-start">
                  {/* Image Gallery */}
                  <div class="space-y-4">
                    {/* Main Image */}
                    <div class="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-2xl overflow-hidden relative group">
                      <div class="absolute inset-0 bg-linear-to-br from-indigo-50/40 via-white to-purple-50/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Show
                        when={mainImageUrl()}
                        fallback={
                          <div class="w-full aspect-square bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-2xl">
                            <i class="fa-solid fa-image text-6xl text-slate-300"></i>
                          </div>
                        }
                      >
                        <div class="relative">
                          <img
                            src={mainImageUrl()!}
                            alt={mainImage()?.alt || item().name}
                            class="w-full aspect-square object-cover rounded-2xl ring-1 ring-slate-200 shadow-lg transition-opacity duration-300"
                          />
                        </div>
                      </Show>
                    </div>

                    {/* Thumbnail Gallery */}
                    <Show when={productImages.length > 1}>
                      <div class="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <For each={productImages}>
                          {(img, index) => {
                            const imgUrl = getImageUrl(img.url);
                            const isActive = () =>
                              selectedImageIndex() === index();
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedImageIndex(index())}
                                class={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden transition-all duration-300 shadow-sm ${
                                  isActive()
                                    ? "border-indigo-500 ring-4 ring-indigo-200 scale-110 shadow-lg"
                                    : "border-slate-200 hover:border-indigo-300 hover:scale-105 hover:shadow-md"
                                }`}
                                aria-label={`نمایش تصویر ${index() + 1}`}
                              >
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={img.alt || `تصویر ${index() + 1}`}
                                    class="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div class="w-full h-full bg-slate-100"></div>
                                )}
                              </button>
                            );
                          }}
                        </For>
                      </div>
                    </Show>
                  </div>

                  {/* Product Info */}
                  <div class="space-y-6">
                    {/* Header */}
                    <div class="space-y-3">
                      <div class="flex items-center gap-3 flex-wrap">
                        <Show when={item().category}>
                          <span class="badge">{item().category?.name}</span>
                        </Show>
                        <Show when={item().brand}>
                          <span class="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold">
                            {item().brand?.name}
                          </span>
                        </Show>
                      </div>
                      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                        {item().name}
                      </h1>
                      <Show when={item().modelNumber}>
                        <p class="text-sm text-slate-500">
                          شماره مدل:{" "}
                          <span class="font-semibold">
                            {item().modelNumber}
                          </span>
                        </p>
                      </Show>
                      <div class="flex flex-wrap gap-2 text-sm text-slate-600">
                        <span class="px-3 py-1 rounded-full bg-slate-100">
                          کد کالا: {item().sku}
                        </span>
                        <Show when={item().brand}>
                          <span class="px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                            برند: {item().brand?.name}
                          </span>
                        </Show>
                        <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          موجودی: {displayStock()}
                        </span>
                      </div>
                      <Show
                        when={
                          item().power || item().capacity || item().warranty
                        }
                      >
                        <div class="flex flex-wrap gap-2 text-xs text-slate-600">
                          <Show when={item().power}>
                            <span class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                              قدرت: {item().power}
                            </span>
                          </Show>
                          <Show when={item().capacity}>
                            <span class="px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                              ظرفیت: {item().capacity}
                            </span>
                          </Show>
                          <Show when={item().warranty}>
                            <span class="px-3 py-1 rounded-full bg-green-50 text-green-700">
                              گارانتی: {item().warranty}
                            </span>
                          </Show>
                        </div>
                      </Show>
                    </div>

                    {/* Description */}
                    <Show when={item().description}>
                      <div class="prose prose-sm max-w-none">
                        <p class="text-slate-600 leading-relaxed">
                          {item().description}
                        </p>
                      </div>
                    </Show>

                    {/* Price & Stock */}
                    <div class="rounded-3xl border-2 border-indigo-200 bg-linear-to-br from-indigo-50/50 to-purple-50/50 shadow-xl p-6 backdrop-blur-sm">
                      <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-4">
                        <div>
                          <p class="text-sm text-slate-600 mb-1">قیمت</p>
                          <p class="text-3xl sm:text-4xl font-bold text-slate-900">
                            {formatPrice(displayPrice())}
                          </p>
                        </div>
                        <Show when={displayStock() > 0}>
                          <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            موجود
                          </span>
                        </Show>
                      </div>
                      <p class="text-sm text-slate-600 mb-6 flex items-center gap-2">
                        <i class="fa-solid fa-cube text-slate-400"></i>
                        موجودی:{" "}
                        <span class="font-semibold">{displayStock()}</span> عدد
                      </p>

                      {/* Size Selection */}
                      <Show when={sizes().length > 0}>
                        <div class="mb-4">
                          <label class="block text-sm font-semibold text-slate-700 mb-2">
                            انتخاب اندازه
                          </label>
                          <div class="flex flex-wrap gap-2">
                            <For each={sizes()}>
                              {(size) => (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSize(size.id);
                                    setSelectedColor(null);
                                  }}
                                  disabled={size.stock === 0}
                                  class={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                                    selectedSize() === size.id
                                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                                      : size.stock === 0
                                      ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                                      : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                                  }`}
                                >
                                  <div class="flex flex-col items-start text-right">
                                    <span>{size.name}</span>
                                    {size.price &&
                                      size.price !== item().price && (
                                        <span class="text-xs text-slate-500 mt-1">
                                          {formatPrice(size.price)}
                                        </span>
                                      )}
                                    <span class="text-[11px] text-slate-400 mt-1">
                                      موجودی: {size.stock}
                                    </span>
                                  </div>
                                </button>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>

                      {/* Color Selection */}
                      <Show when={colors().length > 0}>
                        <div class="mb-4">
                          <label class="block text-sm font-semibold text-slate-700 mb-2">
                            انتخاب رنگ
                          </label>
                          <div class="flex flex-wrap gap-2">
                            <For each={colors()}>
                              {(color) => (
                                <button
                                  onClick={() => {
                                    setSelectedColor(color.id);
                                    setSelectedSize(null);
                                  }}
                                  disabled={color.stock === 0}
                                  class={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                                    selectedColor() === color.id
                                      ? "border-indigo-500 bg-indigo-50 font-semibold shadow-sm"
                                      : color.stock === 0
                                      ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                                      : "border-slate-300 bg-white hover:border-indigo-300"
                                  }`}
                                >
                                  {color.hexCode && (
                                    <div
                                      class="w-6 h-6 rounded-full border border-slate-300 shadow-sm"
                                      style={{
                                        "background-color": color.hexCode,
                                      }}
                                    />
                                  )}
                                  <div class="flex flex-col items-start text-right">
                                    <span>{color.name}</span>
                                    <span class="text-[11px] text-slate-400 mt-1">
                                      موجودی: {color.stock}
                                    </span>
                                  </div>
                                </button>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>

                      {/* Quantity */}
                      <div class="mb-6">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                          تعداد
                        </label>
                        <div class="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setQuantity(Math.max(1, quantity() - 1))
                            }
                            class="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center"
                            disabled={quantity() <= 1}
                          >
                            <i class="fa-solid fa-minus text-sm"></i>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={displayStock()}
                            value={quantity()}
                            onInput={(e) => {
                              const val = Math.max(
                                1,
                                Math.min(
                                  displayStock(),
                                  Number(e.currentTarget.value) || 1
                                )
                              );
                              setQuantity(val);
                            }}
                            class="w-20 text-center border border-slate-300 rounded-lg py-2 font-semibold"
                          />
                          <button
                            onClick={() =>
                              setQuantity(
                                Math.min(displayStock(), quantity() + 1)
                              )
                            }
                            class="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center"
                            disabled={quantity() >= displayStock()}
                          >
                            <i class="fa-solid fa-plus text-sm"></i>
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div class="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={addToCart}
                          disabled={displayStock() === 0}
                          class="flex-1 px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                          type="button"
                        >
                          <i class="fa-solid fa-cart-shopping"></i>
                          افزودن به سبد خرید
                        </button>
                        <button
                          class="px-6 py-4 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all duration-300 sm:w-auto w-full flex items-center justify-center gap-3"
                          type="button"
                        >
                          <i class="fa-solid fa-file-invoice"></i>
                          پیش‌فاکتور
                        </button>
                      </div>
                    </div>

                    {/* Product Specifications */}
                    <Show
                      when={
                        item().weight ||
                        item().dimensions ||
                        item().power ||
                        item().material ||
                        item().capacity ||
                        item().warranty
                      }
                    >
                      <div class="rounded-3xl border-2 border-slate-200 bg-white shadow-xl p-6">
                        <div class="flex items-center gap-3 mb-6">
                          <div class="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <i class="fa-solid fa-list-check text-white"></i>
                          </div>
                          <h3 class="text-xl font-extrabold text-slate-900">
                            مشخصات فنی
                          </h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Show when={item().weight}>
                            <div>
                              <p class="text-sm text-slate-500">وزن</p>
                              <p class="font-semibold text-slate-900">
                                {item().weight} کیلوگرم
                              </p>
                            </div>
                          </Show>
                          <Show when={item().dimensions}>
                            <div>
                              <p class="text-sm text-slate-500">ابعاد</p>
                              <p class="font-semibold text-slate-900">
                                {item().dimensions}
                              </p>
                            </div>
                          </Show>
                          <Show when={item().power}>
                            <div>
                              <p class="text-sm text-slate-500">قدرت</p>
                              <p class="font-semibold text-slate-900">
                                {item().power}
                              </p>
                            </div>
                          </Show>
                          <Show when={item().material}>
                            <div>
                              <p class="text-sm text-slate-500">جنس</p>
                              <p class="font-semibold text-slate-900">
                                {item().material}
                              </p>
                            </div>
                          </Show>
                          <Show when={item().capacity}>
                            <div>
                              <p class="text-sm text-slate-500">ظرفیت</p>
                              <p class="font-semibold text-slate-900">
                                {item().capacity}
                              </p>
                            </div>
                          </Show>
                          <Show when={item().warranty}>
                            <div>
                              <p class="text-sm text-slate-500">گارانتی</p>
                              <p class="font-semibold text-slate-900">
                                {item().warranty}
                              </p>
                            </div>
                          </Show>
                        </div>
                        <Show when={item().features}>
                          <div class="mt-4 pt-4 border-t border-slate-200">
                            <p class="text-sm text-slate-500 mb-2">ویژگی‌ها</p>
                            <p class="text-slate-700">{item().features}</p>
                          </div>
                        </Show>
                      </div>
                    </Show>

                    {/* Additional Info */}
                    <div class="grid gap-4 sm:grid-cols-2">
                      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div>
                          <p class="text-sm text-slate-500 mb-1">نوع پرداخت</p>
                          <p class="font-semibold text-slate-900">
                            نقدی / کارت‌به‌کارت
                          </p>
                          <p class="text-xs text-slate-500">
                            امکان تسویه امن و سریع
                          </p>
                        </div>
                      </div>
                      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <i class="fa-solid fa-truck-fast"></i>
                        </div>
                        <div>
                          <p class="text-sm text-slate-500 mb-1">ارسال</p>
                          <p class="font-semibold text-slate-900">
                            ارسال درون‌شهری و برون‌شهری
                          </p>
                          <p class="text-xs text-slate-500">
                            بسته‌بندی مطمئن و رهگیری سفارش
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Products */}
                <Show when={related() && related()!.length > 0}>
                  <div class="space-y-6 pt-10 border-t border-slate-200">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div class="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-3">
                          پیشنهاد مشابه
                        </div>
                        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
                          محصولات مرتبط
                        </h2>
                      </div>
                      <A
                        href="/products"
                        class="group inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-indigo-600 font-bold border-2 border-indigo-200 hover:border-indigo-400"
                      >
                        مشاهده همه
                        <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                      </A>
                    </div>
                    <div class="product-grid">
                      <For each={related()}>
                        {(item) => {
                          const primaryImage =
                            item.images?.find((img) => img.isPrimary) ||
                            item.images?.[0];
                          const imageUrl = primaryImage?.url
                            ? getImageUrl(primaryImage.url)
                            : null;

                          return (
                            <article class="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100">
                              <div class="relative overflow-hidden">
                                <div class="aspect-square overflow-hidden">
                                  <Show
                                    when={imageUrl}
                                    fallback={
                                      <div class="w-full h-64 bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                        <i class="fa-solid fa-image text-4xl text-slate-300"></i>
                                      </div>
                                    }
                                  >
                                    <img
                                      src={imageUrl!}
                                      alt={primaryImage?.alt || item.name}
                                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      loading="lazy"
                                    />
                                  </Show>
                                  {item.brand && (
                                    <div class="absolute top-3 right-3">
                                      <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                                        {item.brand.name}
                                      </span>
                                    </div>
                                  )}
                                  <div class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                              </div>
                              <div class="p-6 space-y-4">
                                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold inline-block">
                                  {item.category?.name ?? "دسته‌بندی نشده"}
                                </span>
                                <h3 class="text-lg font-bold text-slate-900 line-clamp-2 min-h-14 group-hover:text-indigo-600 transition-colors">
                                  <A href={`/products/${item.id}`}>
                                    {item.name}
                                  </A>
                                </h3>
                                <p class="text-sm text-slate-600 line-clamp-2 min-h-10">
                                  {item.description ||
                                    "جزئیات محصول به زودی تکمیل می‌شود."}
                                </p>
                                <div class="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                                  <span class="font-mono">کد: {item.sku}</span>
                                  <span class="font-bold text-indigo-600">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                                <A
                                  href={`/products/${item.id}`}
                                  class="block w-full text-center px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  مشاهده جزئیات
                                </A>
                              </div>
                            </article>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </Show>
      </section>
    </div>
  );
};

export default ProductDetail;
