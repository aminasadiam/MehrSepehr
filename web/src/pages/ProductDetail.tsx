import { A, useNavigate, useParams } from "@solidjs/router";
import { For, Show, createResource } from "solid-js";
import { productsApi } from "../utils/api";
import { Product, normalizeProduct } from "../types/api";

const fallbackImages = [
  "/assets/images/IMG_20250920_112531_285.jpg",
  "/assets/images/WhatsApp-Image-2025-09-20-at-11.03.30-2.jpeg",
  "/assets/images/photo_2024-12-27_23-20-44.jpg",
  "/assets/images/e1c1d291f800e7c8f67e8b070549681c322dbe89_1603174412.jpg",
];

const getImage = (id?: number) =>
  fallbackImages[(id ?? 0) % fallbackImages.length];
const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const ProductDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [product] = createResource<Product | null>(async () => {
    if (!params.id) return null;
    const response = await productsApi.getById(params.id);
    return response.data ? normalizeProduct(response.data) : null;
  });

  const [related] = createResource(async () => {
    const current = product();
    if (!current?.categoryId) return [];
    const response = await productsApi.getAll(current.categoryId);
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload
      .map(normalizeProduct)
      .filter((item) => item.id !== current.id)
      .slice(0, 3);
  });

  return (
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10">
      <button
        type="button"
        class="btn btn-soft"
        onClick={() => navigate(-1)}
        aria-label="بازگشت"
      >
        بازگشت
        <i class="fa-solid fa-arrow-right text-sm"></i>
      </button>

      <Show
        when={product()}
        fallback={
          <div class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            {product.loading
              ? "در حال بارگذاری اطلاعات محصول..."
              : "محصول مورد نظر یافت نشد."}
          </div>
        }
      >
        {(item) => (
          <div class="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <img
                src={getImage(item().id)}
                alt={item().name}
                class="w-full rounded-2xl object-cover"
              />
              <p class="mt-4 text-sm text-slate-500">
                کد محصول: <span class="font-semibold">{item().sku}</span>
              </p>
            </div>
            <div class="space-y-6">
              <div class="space-y-2">
                <p class="badge">{item().category?.name ?? "دسته‌بندی نشده"}</p>
                <h1 class="text-3xl font-semibold text-slate-900">
                  {item().name}
                </h1>
                <p class="text-slate-600 leading-8">
                  {item().description ||
                    "برای این محصول هنوز توضیحاتی ثبت نشده است."}
                </p>
              </div>
              <div class="rounded-3xl border border-slate-100 bg-slate-50/70 p-6">
                <p class="text-sm text-slate-500">قیمت مصرف‌کننده</p>
                <p class="text-3xl font-bold text-slate-900">
                  {formatPrice(item().price)}
                </p>
                <p class="mt-2 text-sm text-slate-500">
                  موجودی فعلی: {item().stock} عدد
                </p>
                <div class="mt-6 flex flex-wrap gap-3">
                  <button class="btn btn-primary" type="button">
                    افزودن به سبد خرید
                  </button>
                  <button class="btn btn-outline" type="button">
                    دریافت پیش‌فاکتور
                  </button>
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-slate-100 p-4">
                  <p class="text-sm text-slate-500">نوع پرداخت</p>
                  <p class="font-semibold text-slate-900">
                    نقدی / کارت‌به‌کارت
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-100 p-4">
                  <p class="text-sm text-slate-500">ارسال</p>
                  <p class="font-semibold text-slate-900">
                    ارسال درون‌شهری و برون‌شهری
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>

      <Show when={related()?.length}>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="section-kicker">پیشنهاد مشابه</p>
              <h2 class="text-2xl font-semibold text-slate-900">
                محصولات مرتبط
              </h2>
            </div>
            <A href="/products" class="text-blue-600 font-semibold">
              مشاهده همه
            </A>
          </div>
          <div class="product-grid">
            <For each={related()}>
              {(item) => (
                <article class="product-card">
                  <div class="product-card__body space-y-3">
                    <p class="badge">
                      {item.category?.name ?? "دسته‌بندی نشده"}
                    </p>
                    <h3>{item.name}</h3>
                    <p class="product-card__meta">
                      {item.description || "به زودی اطلاعات تکمیل می‌شود."}
                    </p>
                    <div class="flex items-center justify-between text-sm text-slate-500">
                      <span>کد: {item.sku}</span>
                      <span>قیمت: {formatPrice(item.price)}</span>
                    </div>
                    <div class="product-card__actions">
                      <A href={`/products/${item.id}`} class="btn btn-primary">
                        مشاهده جزئیات
                      </A>
                    </div>
                  </div>
                </article>
              )}
            </For>
          </div>
        </div>
      </Show>
    </section>
  );
};

export default ProductDetail;
