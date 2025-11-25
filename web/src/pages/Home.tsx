import { For, Show, createMemo, createResource } from "solid-js";
import { productsApi } from "../utils/api";
import { Product, normalizeProduct } from "../types/api";

const heroCards = [
  {
    image:
      "/assets/images/Living_Room_3D_Render_with_Interior_Design_by_NONAGON_studio.png",
    kicker: "زیبایی پذیرایی",
    title: "لحظات گرم کنار خانواده",
    description: "کالکشن ظروف و دکوراسیون پذیرایی برای سلیقه‌های مدرن.",
  },
  {
    image: "/assets/images/DC4564-004-RT.jpg",
    kicker: "آشپزخانه رویایی",
    title: "کارایی و زیبایی کنار هم",
    description: "انتخاب هوشمند برای لوازم آشپزخانه با دوام بالا.",
  },
  {
    image:
      "/assets/images/FAW-StaubCastIron5-8e4d899b2c8445c9b5c58dc4551ffde2.jpeg",
    kicker: "هدیه دادن",
    title: "هدایای خاص و متفاوت",
    description: "ست‌های ویژه برای هدیه‌های به‌یادماندنی.",
  },
];

const promotions = [
  {
    id: "coffee",
    image:
      "/assets/images/bhg-product-mr-coffee-5-cup-mini-brew-switch-coffee-maker-14-rkilgore-1410-1-7365d15ab5594daeb983c081502ba0c4.jpeg",
    kicker: "نوشیدنی سازها",
    title: "همه مدل قهوه‌ساز و نوشیدنی ساز",
    description:
      "از دستگاه‌های رو‌میزی تا حرفه‌ای، مطابق نیاز کافی‌شاپ خانگی شما.",
    accent: "bg-green-200/70 border border-green-300",
  },
  {
    id: "home",
    image: "/assets/images/1547631410-1.png",
    kicker: "خانه رویایی",
    title: "همه جور لوازم خانه",
    description: "از نورپردازی تا دکوراتیو؛ هر آنچه فضای خانه را خاص می‌کند.",
    accent: "bg-blue-200/70 border border-blue-300",
  },
];

const fallbackImages = [
  "/assets/images/IMG_20250920_112531_285.jpg",
  "/assets/images/WhatsApp-Image-2025-09-20-at-11.03.30-2.jpeg",
  "/assets/images/photo_2024-12-27_23-20-44.jpg",
  "/assets/images/e1c1d291f800e7c8f67e8b070549681c322dbe89_1603174412.jpg",
  "/assets/images/dd7197c77621521206b911e2739c49df437c9830_1603176952.jpg",
  "/assets/images/4740b694c13f350604a0382c9c9ffd15bd2a98cb_1603179813.jpg",
];

const skeletonCard = (
  <article class="product-card animate-pulse" aria-hidden="true">
    <div class="h-[220px] w-full bg-slate-100" />
    <div class="product-card__body space-y-3">
      <div class="h-4 w-20 rounded-full bg-slate-100" />
      <div class="h-6 w-3/4 rounded-full bg-slate-100" />
      <div class="h-4 w-1/2 rounded-full bg-slate-100" />
      <div class="flex gap-3">
        <div class="h-8 flex-1 rounded-full bg-slate-100" />
        <div class="h-8 flex-1 rounded-full bg-slate-100" />
      </div>
    </div>
  </article>
);

const productImage = (index: number) =>
  fallbackImages[index % fallbackImages.length];
const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

const Home = () => {
  const [products] = createResource<Product[]>(async () => {
    const response = await productsApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeProduct);
  });

  const cookwareProducts = createMemo(() => (products() ?? []).slice(0, 3));
  const applianceProducts = createMemo(() => (products() ?? []).slice(3, 6));

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-16 lg:space-y-20">
      <section id="hero" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <For each={heroCards}>
          {(card, index) => (
            <article
              class={`hero-card ${
                index() === 2 ? "md:col-span-2 xl:col-span-1" : ""
              }`}
            >
              <img src={card.image} alt={card.title} />
              <div>
                <p class="hero-kicker">{card.kicker}</p>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
            </article>
          )}
        </For>
      </section>

      <section
        id="cook-cta"
        class="cta-card grid gap-8 lg:grid-cols-[1.5fr_1fr] items-center overflow-hidden"
      >
        <div>
          <p class="cta-kicker">مجموعه جدید</p>
          <h2>لحظات خوش آشپزی</h2>
          <p class="text-slate-600 mt-4">
            ابزارهای تازه برای طعم‌های بزرگ؛ مجموعه‌ای از تجهیزات مدرن که آشپزی
            روزانه را لذت‌بخش‌تر می‌کند.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="/products" class="btn btn-primary">
              مشاهده محصولات
            </a>
            <a href="/products" class="btn btn-ghost">
              برندهای محبوب
            </a>
          </div>
        </div>
        <div class="relative rounded-4xl overflow-hidden">
          <img
            src="/assets/images/vecteezy_healthy-vegetable-stew-cooked-on-stove-top-generated-by-ai_25184841.jpg"
            alt="خوراک سبزیجات تازه"
            class="h-full w-full object-cover"
          />
        </div>
      </section>

      <section id="cookware" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="section-kicker">جدیدهای پخت و پز</p>
            <h2>سرویس‌های محبوب مهر سپهر</h2>
          </div>
          <a
            href="/products"
            class="text-blue-600 font-semibold hover:underline"
          >
            مشاهده همه
          </a>
        </div>
        <div class="product-grid">
          <Show
            when={!products.loading}
            fallback={[skeletonCard, skeletonCard, skeletonCard]}
          >
            <For each={cookwareProducts()}>
              {(product, index) => (
                <article class="product-card">
                  <img
                    src={productImage(index())}
                    alt={product.name}
                    class="product-card__cover"
                    loading="lazy"
                  />
                  <div class="product-card__body">
                    <p class="badge">
                      {product.category?.name ?? "دسته‌بندی نشده"}
                    </p>
                    <h3>{product.name}</h3>
                    <p class="product-card__meta">
                      {product.description ||
                        "توضیحات محصول به زودی اضافه می‌شود."}
                    </p>
                    <div class="flex items-center justify-between text-sm text-slate-500">
                      <span>کد: {product.sku}</span>
                      <span>موجودی: {product.stock}</span>
                    </div>
                    <div class="product-card__actions">
                      <a href={`/products/${product.id}`} class="btn btn-soft">
                        جزئیات
                      </a>
                      <button class="btn btn-primary" type="button">
                        {formatPrice(product.price)}
                      </button>
                    </div>
                  </div>
                </article>
              )}
            </For>
          </Show>
        </div>
      </section>

      <section
        id="kitchen-cta"
        class="cta-card grid gap-8 lg:grid-cols-[1fr_1.5fr] items-center bg-amber-100/70 border-amber-200"
      >
        <div class="relative rounded-4xl overflow-hidden order-2 lg:order-1">
          <img
            src="/assets/images/photo_2024-08-28_16-45-18.jpg"
            alt="نمای داخلی فروشگاه لوازم آشپزخانه"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="order-1 lg:order-2">
          <p class="cta-kicker">همه جور لوازم آشپزخانه</p>
          <h2>کیفیت ممتاز با قیمت عادلانه</h2>
          <p class="text-slate-600 mt-4">
            از ابزار آماده‌سازی تا سرو، هر آنچه برای تکمیل آشپزخانه مدرن نیاز
            دارید را یک‌جا انتخاب کنید.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="/products" class="btn btn-primary">
              مشاهده محصولات
            </a>
            <button class="btn btn-ghost" type="button">
              دریافت کاتالوگ
            </button>
          </div>
        </div>
      </section>

      <section id="appliances" class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="section-kicker">جدیدهای یخچال و فریزر</p>
            <h2>انتخاب حرفه‌ای برای خانواده‌ها</h2>
          </div>
          <a
            href="/products"
            class="text-blue-600 font-semibold hover:underline"
          >
            مشاهده همه
          </a>
        </div>
        <div class="product-grid">
          <Show
            when={!products.loading}
            fallback={[skeletonCard, skeletonCard, skeletonCard]}
          >
            <For each={applianceProducts()}>
              {(product, index) => (
                <article class="product-card">
                  <img
                    src={productImage(index() + 3)}
                    alt={product.name}
                    class="product-card__cover"
                    loading="lazy"
                  />
                  <div class="product-card__body">
                    <p class="badge">
                      {product.category?.name ?? "لوازم خانگی"}
                    </p>
                    <h3>{product.name}</h3>
                    <p class="product-card__meta">
                      {product.description ||
                        "جزئیات محصول در دست به‌روزرسانی است."}
                    </p>
                    <div class="flex items-center justify-between text-sm text-slate-500">
                      <span>کد: {product.sku}</span>
                      <span>موجودی: {product.stock}</span>
                    </div>
                    <div class="product-card__actions">
                      <a href={`/products/${product.id}`} class="btn btn-soft">
                        جزئیات
                      </a>
                      <button class="btn btn-primary" type="button">
                        {formatPrice(product.price)}
                      </button>
                    </div>
                  </div>
                </article>
              )}
            </For>
          </Show>
        </div>
      </section>

      <section id="promotions" class="grid gap-6 lg:grid-cols-2">
        <For each={promotions}>
          {(promo) => (
            <article class={`promo-card ${promo.accent}`}>
              <div class="promo-card__media">
                <img src={promo.image} alt={promo.title} />
              </div>
              <div class="promo-card__body">
                <p class="promo-kicker">{promo.kicker}</p>
                <h3>{promo.title}</h3>
                <p>{promo.description}</p>
                <a href="/products" class="btn btn-outline mt-4">
                  خرید
                  <i class="fa-solid fa-cart-shopping text-sm"></i>
                </a>
              </div>
            </article>
          )}
        </For>
      </section>
    </div>
  );
};

export default Home;
