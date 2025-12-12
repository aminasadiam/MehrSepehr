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
    <section
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-12"
      dir="rtl"
    >
      <button
        type="button"
        class="btn btn-soft mb-4"
        onClick={() => navigate(-1)}
        aria-label="بازگشت"
      >
        <i class="fa-solid fa-arrow-right text-sm"></i>
        بازگشت
      </button>

      <Show
        when={product()}
        fallback={
          <div class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            {product.loading ? (
              <div>
                <div class="text-4xl mb-4">⏳</div>
                <div>در حال بارگذاری اطلاعات محصول...</div>
              </div>
            ) : (
              <div>
                <div class="text-5xl mb-4">❌</div>
                <div>محصول مورد نظر یافت نشد.</div>
              </div>
            )}
          </div>
        }
      >
        {(item) => {
          const productImages = images();
          const safeIndex =
            productImages.length === 0
              ? 0
              : Math.min(
                  selectedImageIndex(),
                  Math.max(productImages.length - 1, 0)
                );
          const mainImage = productImages[safeIndex] || productImages[0];
          const mainImageUrl = mainImage ? getImageUrl(mainImage.url) : null;

          return (
            <div class="space-y-10">
              {/* Main Product Section */}
              <div class="grid gap-8 lg:grid-cols-[1.15fr_1fr] items-start">
                {/* Image Gallery */}
                <div class="space-y-4">
                  {/* Main Image */}
                  <div class="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-xl overflow-hidden relative">
                    <div class="absolute inset-0 bg-linear-to-br from-indigo-50/60 via-white to-purple-50/50 pointer-events-none" />
                    <Show
                      when={mainImageUrl}
                      fallback={
                        <div class="w-full aspect-square bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-2xl">
                          <i class="fa-solid fa-image text-6xl text-slate-300"></i>
                        </div>
                      }
                    >
                      <div class="relative">
                        <img
                          src={mainImageUrl!}
                          alt={mainImage?.alt || item().name}
                          class="w-full aspect-square object-cover rounded-2xl ring-1 ring-slate-200 shadow-lg"
                        />
                      </div>
                    </Show>
                  </div>

                  {/* Thumbnail Gallery */}
                  <Show when={productImages.length > 1}>
                    <div class="flex gap-3 overflow-x-auto pb-2">
                      <For each={productImages}>
                        {(img, index) => {
                          const imgUrl = getImageUrl(img.url);
                          return (
                            <button
                              onClick={() => setSelectedImageIndex(index())}
                              class={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                                selectedImageIndex() === index()
                                  ? "border-indigo-500 ring-2 ring-indigo-200"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
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
                    <h1 class="text-3xl lg:text-4xl font-bold text-slate-900">
                      {item().name}
                    </h1>
                    <Show when={item().modelNumber}>
                      <p class="text-sm text-slate-500">
                        شماره مدل:{" "}
                        <span class="font-semibold">{item().modelNumber}</span>
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
                      when={item().power || item().capacity || item().warranty}
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
                  <div class="rounded-3xl border border-indigo-100 bg-white/90 backdrop-blur shadow-xl p-6">
                    <div class="flex items-baseline justify-between mb-4">
                      <div>
                        <p class="text-sm text-slate-600 mb-1">قیمت</p>
                        <p class="text-4xl font-bold text-slate-900">
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
                                onClick={() => {
                                  setSelectedSize(size.id);
                                  setSelectedColor(null);
                                }}
                                disabled={size.stock === 0}
                                class={`px-4 py-2 rounded-lg border-2 transition-all ${
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
                    <div class="flex flex-wrap gap-3">
                      <button
                        onClick={addToCart}
                        disabled={displayStock() === 0}
                        class="btn btn-primary flex-1 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        <i class="fa-solid fa-cart-shopping"></i>
                        افزودن به سبد خرید
                      </button>
                      <button class="btn btn-outline" type="button">
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
                    <div class="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm">
                      <h3 class="text-lg font-semibold text-slate-900 mb-4">
                        مشخصات فنی
                      </h3>
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
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="section-kicker">پیشنهاد مشابه</p>
                      <h2 class="text-2xl font-semibold text-slate-900">
                        محصولات مرتبط
                      </h2>
                    </div>
                    <A
                      href="/products"
                      class="text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                      مشاهده همه
                      <i class="fa-solid fa-arrow-left text-sm mr-1"></i>
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
                          <article class="product-card group hover:shadow-xl transition-all duration-300">
                            <div class="product-card__media relative overflow-hidden rounded-t-2xl">
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
                                  class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
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
                            </div>
                            <div class="product-card__body space-y-3 p-5">
                              <p class="badge text-xs">
                                {item.category?.name ?? "دسته‌بندی نشده"}
                              </p>
                              <h3 class="text-lg font-semibold text-slate-900 line-clamp-2">
                                {item.name}
                              </h3>
                              <p class="product-card__meta text-sm text-slate-600 line-clamp-2">
                                {item.description ||
                                  "جزئیات محصول به زودی تکمیل می‌شود."}
                              </p>
                              <div class="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                                <span class="font-mono">کد: {item.sku}</span>
                                <span>{formatPrice(item.price)}</span>
                              </div>
                              <div class="product-card__actions pt-2">
                                <A
                                  href={`/products/${item.id}`}
                                  class="btn btn-primary w-full text-center"
                                >
                                  مشاهده جزئیات
                                </A>
                              </div>
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
  );
};

export default ProductDetail;
