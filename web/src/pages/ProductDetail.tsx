import { A, useNavigate, useParams } from "@solidjs/router";
import {
  For,
  Show,
  createResource,
  createSignal,
  createEffect,
  createMemo,
} from "solid-js";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { productsApi, getImageUrl } from "../utils/api";
import { Product, normalizeProduct, ProductImage } from "../types/api";

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const imageUrl = (img: ProductImage | undefined) => {
  if (!img?.url) return "/placeholder.jpg";
  return getImageUrl(img.url);
};

const getProductPrice = (
  product: Product | null,
  userGroupIds: number[] = []
): number => {
  if (!product?.prices || product.prices.length === 0) {
    return product?.price ?? 0;
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

  return product?.price ?? 0;
};

const ProductDetail = () => {
  const auth = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = createSignal(0);
  const [selectedSize, setSelectedSize] = createSignal<number | null>(null);
  const [selectedColor, setSelectedColor] = createSignal<number | null>(null);
  const [quantity, setQuantity] = createSignal(1);

  const userGroupIds = createMemo(() =>
    auth
      .groups()
      .map((g) => g.id ?? 0)
      .filter((id) => id > 0)
  );

  const [product] = createResource<Product | null>(async () => {
    if (!params.id) return null;
    const response = await productsApi.getById(params.id);
    return response.data ? normalizeProduct(response.data) : null;
  });

  createEffect(() => {
    const _ = product();
    setSelectedImageIndex(0);
  });

  const [related] = createResource<Product[]>(async () => {
    const current = product();
    if (!current?.categoryId) return [];
    const response = await productsApi.getAll({
      categoryId: current.categoryId,
    });
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload
      .map(normalizeProduct)
      .filter((item) => item.id !== current?.id && item.isActive !== false)
      .slice(0, 4);
  });

  const images = () => product()?.images || [];
  const sizes = () => product()?.sizes || [];
  const colors = () => product()?.colors || [];

  const currentSize = () => {
    const sizeId = selectedSize();
    return sizeId !== null ? sizes().find((s) => s.id === sizeId) : null;
  };

  const currentColor = () => {
    const colorId = selectedColor();
    return colorId !== null ? colors().find((c) => c.id === colorId) : null;
  };

  const currentStock = () => {
    const size = currentSize();
    const color = currentColor();
    if (size) return size.stock;
    if (color) return color.stock;
    return product()?.stock ?? 0;
  };

  const currentPrice = () => {
    const size = currentSize();
    if (size?.price) return size.price;
    return getProductPrice(product() ?? null, userGroupIds());
  };

  const handleAddToOrder = () => {
    const prod = product();
    if (!prod) return;
    const payload = {
      productId: prod.id,
      product: prod,
      quantity: quantity(),
      sizeId: selectedSize(),
      colorId: selectedColor(),
      unitPrice: currentPrice(),
    };
    try {
      useCart().addItem(payload);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
    navigate("/orders");
  };

  return (
    <div
      dir="rtl"
      class="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8"
    >
      {/* Loading State */}
      <Show when={!product()} fallback={null}>
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4 animate-spin">⏳</div>
            <p class="text-xl text-slate-600">در حال بارگیری محصول...</p>
          </div>
        </div>
      </Show>

      <Show when={product()} fallback={null}>
        {(prod) => (
          <>
            {/* Breadcrumb */}
            <div class="max-w-7xl mx-auto px-4 mb-8">
              <nav class="text-sm text-slate-500 flex items-center gap-2">
                <A href="/" class="hover:text-indigo-600 transition">
                  🏠 خانه
                </A>
                <span>/</span>
                <A href="/products" class="hover:text-indigo-600 transition">
                  🛍️ محصولات
                </A>
                <span>/</span>
                <span class="text-slate-700 font-semibold">{prod().name}</span>
              </nav>
            </div>

            <section class="max-w-7xl mx-auto px-4">
              <div class="grid lg:grid-cols-2 gap-12">
                {/* Images Section */}
                <div class="space-y-6">
                  <div class="sticky top-8 space-y-6">
                    <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                      <img
                        src={imageUrl(images()[selectedImageIndex()])}
                        alt={prod().name}
                        class="w-full h-[500px] object-cover"
                      />
                      {/* Badge */}
                      <div class="absolute top-4 right-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                        محصول ویژه
                      </div>
                    </div>
                    <div class="grid grid-cols-5 gap-3">
                      <For each={images()}>
                        {(img, idx) => (
                          <button
                            class={`rounded-xl overflow-hidden border-3 transition-all hover:scale-110 ${
                              idx() === selectedImageIndex()
                                ? "border-indigo-600 shadow-lg scale-110"
                                : "border-slate-200 hover:border-indigo-300"
                            }`}
                            onClick={() => setSelectedImageIndex(idx())}
                          >
                            <img
                              src={imageUrl(img)}
                              alt=""
                              class="w-full h-24 object-cover"
                            />
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div class="space-y-6">
                  {/* Title & Price */}
                  <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200 hover:shadow-lg transition-all">
                    <h1 class="text-4xl font-bold text-slate-900 mb-3">
                      {prod().name}
                    </h1>
                    <div class="flex items-baseline gap-3">
                      <Show
                        when={auth.isAuthenticated() || currentPrice() > 0}
                        fallback={
                          <p class="text-sm font-bold text-amber-600">
                            برای مشاهده قیمت وارد شوید
                          </p>
                        }
                      >
                        <p class="text-4xl font-bold text-indigo-600">
                          {formatPrice(currentPrice())}
                        </p>
                      </Show>
                      <Show when={currentStock() > 0}>
                        <span class="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          ✓ موجود
                        </span>
                      </Show>
                      <Show when={currentStock() === 0}>
                        <span class="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                          ✕ ناموجود
                        </span>
                      </Show>
                    </div>
                  </div>

                  {/* Description */}
                  <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200">
                    <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      توضیحات
                    </h3>
                    <div class="text-slate-600 leading-relaxed text-justify prose prose-sm max-w-none [&>*]:my-2 [&>h1]:text-2xl [&>h2]:text-xl [&>h3]:text-lg [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>p]:text-slate-700 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>li]:my-1 [&>blockquote]:border-r-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:pr-4 [&>blockquote]:bg-slate-50 [&>blockquote]:py-2 [&>blockquote]:my-3 [&>a]:text-indigo-600 [&>a]:hover:underline [&>code]:bg-slate-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>pre]:bg-slate-900 [&>pre]:text-white [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>img]:rounded-lg [&>img]:my-4 [&>img]:max-w-full [&>img]:h-auto">
                      {prod().description ? (
                        <div innerHTML={prod().description} />
                      ) : (
                        <p>توضیحات محصول به زودی تکمیل می‌شود.</p>
                      )}
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200">
                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span>📋</span>
                      مشخصات فنی
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                      <Show when={prod().brand?.name}>
                        <div class="bg-linear-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                          <p class="text-xs font-bold text-blue-600 uppercase mb-1">
                            برند
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().brand?.name}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().category?.name}>
                        <div class="bg-linear-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg border border-indigo-200">
                          <p class="text-xs font-bold text-indigo-600 uppercase mb-1">
                            دسته‌بندی
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().category?.name}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().modelNumber}>
                        <div class="bg-linear-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                          <p class="text-xs font-bold text-purple-600 uppercase mb-1">
                            مدل
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().modelNumber}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().sku}>
                        <div class="bg-linear-to-br from-pink-50 to-pink-100 p-3 rounded-lg border border-pink-200">
                          <p class="text-xs font-bold text-pink-600 uppercase mb-1">
                            کد محصول
                          </p>
                          <p class="text-sm font-mono font-semibold text-slate-900">
                            {prod().sku}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().warranty}>
                        <div class="bg-linear-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                          <p class="text-xs font-bold text-green-600 uppercase mb-1">
                            گارانتی
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().warranty}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().weight}>
                        <div class="bg-linear-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                          <p class="text-xs font-bold text-orange-600 uppercase mb-1">
                            وزن
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().weight} کیلوگرم
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().dimensions}>
                        <div class="bg-linear-to-br from-cyan-50 to-cyan-100 p-3 rounded-lg border border-cyan-200">
                          <p class="text-xs font-bold text-cyan-600 uppercase mb-1">
                            ابعاد
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().dimensions}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().capacity}>
                        <div class="bg-linear-to-br from-teal-50 to-teal-100 p-3 rounded-lg border border-teal-200">
                          <p class="text-xs font-bold text-teal-600 uppercase mb-1">
                            ظرفیت
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().capacity}
                          </p>
                        </div>
                      </Show>
                      <Show when={prod().material}>
                        <div class="bg-linear-to-br from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                          <p class="text-xs font-bold text-amber-600 uppercase mb-1">
                            جنس
                          </p>
                          <p class="text-sm font-semibold text-slate-900">
                            {prod().material}
                          </p>
                        </div>
                      </Show>
                    </div>
                  </div>

                  {/* Sizes Selection */}
                  <Show when={sizes().length > 0}>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200">
                      <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span>📏</span>
                        انتخاب سایز
                      </h3>
                      <div class="flex flex-wrap gap-3">
                        <For each={sizes()}>
                          {(size) => (
                            <button
                              class={`px-4 py-3 rounded-xl border-2 font-bold transition-all hover:scale-105 ${
                                selectedSize() === size.id
                                  ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md"
                                  : "border-slate-200 text-slate-600 hover:border-indigo-300"
                              }`}
                              onClick={() => setSelectedSize(size.id)}
                            >
                              <span>{size.name}</span>
                              <span class="text-xs opacity-70 block mt-1">
                                ({size.stock} موجود)
                              </span>
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Colors Selection */}
                  <Show when={colors().length > 0}>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200">
                      <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span>🎨</span>
                        انتخاب رنگ
                      </h3>
                      <div class="flex flex-wrap gap-3">
                        <For each={colors()}>
                          {(color) => (
                            <button
                              class={`px-4 py-3 rounded-xl border-2 font-bold transition-all hover:scale-105 ${
                                selectedColor() === color.id
                                  ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md"
                                  : "border-slate-200 text-slate-600 hover:border-indigo-300"
                              }`}
                              onClick={() => setSelectedColor(color.id)}
                            >
                              <span>{color.name}</span>
                              <span class="text-xs opacity-70 block mt-1">
                                ({color.stock} موجود)
                              </span>
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  {/* Quantity & Order Button */}
                  <div class="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-200 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <span>📦</span>
                          تعداد
                        </label>
                        <div class="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                          <button
                            class="px-4 py-3 hover:bg-slate-100 transition font-bold text-lg"
                            onClick={() =>
                              setQuantity(Math.max(1, quantity() - 1))
                            }
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={quantity()}
                            class="flex-1 text-center border-x-2 border-slate-200 py-3 font-bold text-lg focus:outline-none"
                            min="1"
                            max={currentStock()}
                            onInput={(e) =>
                              setQuantity(Number(e.currentTarget.value))
                            }
                          />
                          <button
                            class="px-4 py-3 hover:bg-slate-100 transition font-bold text-lg"
                            onClick={() =>
                              setQuantity(
                                Math.min(currentStock(), quantity() + 1)
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label class="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <span>📊</span>
                          موجودی
                        </label>
                        <div class="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl py-3 text-center">
                          <p class="text-2xl font-bold text-blue-900">
                            {currentStock()}
                          </p>
                          <p class="text-xs text-blue-600 font-semibold">
                            عدد موجود
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      class="w-full py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      disabled={
                        currentStock() === 0 ||
                        quantity() > currentStock() ||
                        !auth.isAuthenticated()
                      }
                      onClick={handleAddToOrder}
                    >
                      <span>🛒</span>
                      <Show
                        when={auth.isAuthenticated()}
                        fallback="برای خرید وارد شوید"
                      >
                        افزودن به سفارش (
                        {formatPrice(currentPrice() * quantity())})
                      </Show>
                    </button>
                  </div>
                </div>
              </div>

              <Show when={related()!.length > 0}>
                <div class="pt-16 mt-16 border-t-2 border-slate-200">
                  <div class="flex items-center gap-3 mb-8">
                    <h2 class="text-3xl font-bold text-slate-900">
                      🔗 محصولات مرتبط
                    </h2>
                    <div class="flex-1 h-1 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <For each={related()}>
                      {(item) => {
                        const imgSrc = imageUrl(item.images?.[0]);
                        return (
                          <article class="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden border-2 border-slate-200 hover:border-indigo-300 group">
                            <A
                              href={`/products/${item.id}`}
                              class="block overflow-hidden rounded-t-lg"
                            >
                              <img
                                src={imgSrc}
                                alt={item.name}
                                class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </A>
                            <div class="p-4 space-y-3">
                              <p class="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                                {item.category?.name ?? "دسته‌بندی نشده"}
                              </p>
                              <h3 class="text-base font-bold text-slate-900 line-clamp-2">
                                <A
                                  href={`/products/${item.id}`}
                                  class="hover:text-indigo-600 transition"
                                >
                                  {item.name}
                                </A>
                              </h3>
                              <p class="text-sm text-slate-600 line-clamp-2 h-10">
                                {item.description ||
                                  "جزئیات محصول به زودی تکمیل می‌شود."}
                              </p>
                              <div class="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span class="text-xs font-mono text-slate-500">
                                  کد: {item.sku}
                                </span>
                                <span class="font-bold text-indigo-600 text-sm">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                              <A
                                href={`/products/${item.id}`}
                                class="block mt-3 text-center py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
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
            </section>
          </>
        )}
      </Show>
    </div>
  );
};

export default ProductDetail;
