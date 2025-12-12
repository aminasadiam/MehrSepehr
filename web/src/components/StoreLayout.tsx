import { A, useNavigate } from "@solidjs/router";
import {
  Component,
  For,
  ParentProps,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { useAuth } from "../store/auth";

interface StoreLayoutProps extends ParentProps {
  showCategoryNav?: boolean;
}

const sidebarLinks = [
  { href: "/", label: "خانه", icon: "fa-solid fa-house" },
  {
    href: "#cookware",
    label: "سرویس پخت و پز",
    icon: "fa-solid fa-kitchen-set",
  },
  { href: "#kitchen-cta", label: "آشپزخانه", icon: "fa-solid fa-bowl-food" },
  {
    href: "#appliances",
    label: "یخچال و فریزر",
    icon: "fa-solid fa-snowflake",
  },
  { href: "#promotions", label: "پیشنهاد ویژه", icon: "fa-solid fa-star" },
  { href: "#contact", label: "تماس با ما", icon: "fa-solid fa-phone" },
];

const accountLinks = [
  { href: "/products", label: "فهرست محصولات", icon: "fa-solid fa-list" },
  { href: "/orders", label: "سفارش‌های من", icon: "fa-solid fa-receipt" },
  { href: "/wallet", label: "کیف پول", icon: "fa-solid fa-wallet" },
  { href: "/profile", label: "پروفایل", icon: "fa-solid fa-circle-user" },
];

const sidebarSocial = [
  {
    href: "https://instagram.com",
    icon: "fa-brands fa-instagram",
    label: "اینستاگرام",
  },
  { href: "https://wa.me", icon: "fa-brands fa-whatsapp", label: "واتساپ" },
  { href: "https://t.me", icon: "fa-brands fa-telegram", label: "تلگرام" },
];

const categoryLinks = [
  { href: "#cookware", label: "پخت و پز" },
  { href: "#kitchen-cta", label: "آشپزخانه" },
  { href: "#appliances", label: "یخچال و فریزر" },
  { href: "#promotions", label: "پیشنهاد ویژه" },
  { href: "#contact", label: "پشتیبانی" },
];

const footerLinks = {
  categories: [
    { label: "خانه", href: "#hero" },
    { label: "لوازم آشپزخانه", href: "#cookware" },
    { label: "لوازم خانگی برقی", href: "#appliances" },
  ],
  brands: [
    { label: "پاکشوما", href: "#brands" },
    { label: "سونی", href: "#brands" },
    { label: "سامسونگ", href: "#brands" },
    { label: "ال‌جی", href: "#brands" },
  ],
  services: [
    { label: "تماس با ما", href: "#contact" },
    { label: "پشتیبانی ۲۴/۷", href: "#contact" },
    { label: "پیشنهاد ویژه", href: "#promotions" },
    { label: "مجله آشپزی", href: "#cook-cta" },
  ],
};

const footerSocial = [
  {
    href: "https://instagram.com",
    src: "/assets/images/social-instagram.jpg",
    alt: "اینستاگرام مهر سپهر",
  },
  {
    href: "https://wa.me",
    src: "/assets/images/WhatsApp.svg.webp",
    alt: "واتساپ مهر سپهر",
  },
  {
    href: "https://t.me",
    src: "/assets/images/Telegram_logo.svg.webp",
    alt: "تلگرام مهر سپهر",
  },
];

const complianceBadges = [
  {
    href: "https://enamad.ir",
    src: "/assets/images/enemad.png",
    alt: "نماد اعتماد الکترونیک",
  },
  {
    href: "https://samandehi.ir",
    src: "/assets/images/samandehi.png",
    alt: "نشان ساماندهی",
  },
];

const StoreLayout: Component<StoreLayoutProps> = (props) => {
  const auth = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const [isDesktop, setIsDesktop] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const navigate = useNavigate();

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => {
    if (!isDesktop()) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  const isSidebarHidden = () => !isDesktop() && !isSidebarOpen();
  const headerUserName = () => auth.user()?.username || auth.user()?.email;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSearch = () => {
    const q = search().trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate(`/products`);
    }
  };

  onMount(() => {
    document.documentElement.lang = "fa";
    document.documentElement.dir = "rtl";

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    onCleanup(() => mediaQuery.removeEventListener("change", handleChange));
  });

  createEffect(() => {
    if (isDesktop()) {
      setIsSidebarOpen(false);
    }
    const shouldLock = !isDesktop() && isSidebarOpen();
    document.body.classList.toggle("sidebar-open", shouldLock);
  });

  onCleanup(() => {
    document.body.classList.remove("sidebar-open");
  });

  return (
    <div class="bg-slate-50 text-slate-900">
      <a class="skip-link" href="#mainContent">
        پرش به محتوای اصلی
      </a>
      <div class="site-shell lg:flex lg:min-h-screen">
        <aside
          class={`sidebar ${isSidebarOpen() ? "is-open" : ""}`}
          id="mainSidebar"
          aria-label="منوی کناری"
          aria-hidden={isSidebarHidden()}
        >
          <div class="sidebar-header">
            <button
              class="sidebar-close lg:hidden"
              type="button"
              aria-label="بستن منو"
              onClick={closeSidebar}
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
            <A class="sidebar-brand" href="/" aria-label="بازگشت به صفحه اصلی">
              <img src="/assets/images/logos.png" alt="لوگوی مهر سپهر" />
              <div>
                <p class="text-lg font-bold">Mehr Sepehr</p>
                <p class="text-sm text-slate-500">مهر سپهر آریا قشم</p>
              </div>
            </A>
          </div>
          <nav class="sidebar-nav" aria-label="دسترسی سریع">
            <For each={sidebarLinks}>
              {(item) => (
                <a href={item.href} class="sidebar-link" onClick={closeSidebar}>
                  <i class={item.icon}></i>
                  {item.label}
                </a>
              )}
            </For>
          </nav>

          <div class="sidebar-nav" aria-label="لینک‌های کاربری">
            <p class="text-xs uppercase tracking-widest text-slate-400 mb-2">
              ناحیه کاربری
            </p>
            <Show when={auth.isAdmin()}>
              <A href="/admin" class="sidebar-link" onClick={closeSidebar}>
                <i class="fa-solid fa-user-shield"></i>
                پنل مدیریت
              </A>
            </Show>
            <For each={accountLinks}>
              {(item) => (
                <A href={item.href} class="sidebar-link" onClick={closeSidebar}>
                  <i class={item.icon}></i>
                  {item.label}
                </A>
              )}
            </For>
          </div>

          <div class="sidebar-footer">
            <div>
              <p class="text-sm text-slate-500 mb-1">شماره تماس</p>
              <a
                class="text-base font-semibold text-slate-900"
                href="tel:02128423963"
              >
                021-28423963
              </a>
            </div>
            <div>
              <p class="text-sm text-slate-500 mb-1">ایمیل</p>
              <a
                class="text-base font-semibold text-slate-900 break-all"
                href="mailto:gablame.com@gmail.com"
              >
                gablame.com@gmail.com
              </a>
            </div>
            <div class="sidebar-social">
              <For each={sidebarSocial}>
                {(social) => (
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                  >
                    <i class={social.icon}></i>
                  </a>
                )}
              </For>
            </div>
          </div>
        </aside>

        <div
          class={`sidebar-overlay ${isSidebarOpen() ? "is-visible" : ""}`}
          onClick={closeSidebar}
          role="presentation"
        ></div>

        <main id="mainContent" class="content-area flex-1 min-h-screen">
          <header class="page-header sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
              <div class="flex flex-wrap items-center justify-between gap-4 py-6">
                <div class="flex items-center gap-3">
                  <button
                    class="lg:hidden text-2xl text-slate-600 hover:text-slate-900 transition"
                    type="button"
                    aria-controls="mainSidebar"
                    aria-expanded={!isDesktop() && isSidebarOpen()}
                    onClick={toggleSidebar}
                  >
                    <span class="sr-only">باز کردن منو</span>
                    <i class="fa-solid fa-bars"></i>
                  </button>
                  <A
                    href="/"
                    class="lg:hidden flex items-center gap-3"
                    aria-label="صفحه اصلی"
                  >
                    <img
                      class="w-12"
                      src="/assets/images/logos.png"
                      alt="لوگو مهر سپهر"
                    />
                    <span class="font-semibold text-base">مهر سپهر</span>
                  </A>
                </div>
                <label
                  class="relative flex-1 min-w-[220px] lg:max-w-md"
                  for="headerSearch"
                >
                  <input
                    id="headerSearch"
                    type="search"
                    value={search()}
                    onInput={(e) => setSearch(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="جستجو محصولات، برند یا دسته‌بندی"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pl-12 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    aria-label="جستجو"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    onClick={handleSearch}
                  >
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </button>
                </label>
                <div class="flex items-center gap-3">
                  <Show
                    when={auth.isAuthenticated()}
                    fallback={
                      <>
                        <A href="/login" class="btn btn-outline">
                          ورود
                          <i class="fa-solid fa-right-to-bracket text-sm"></i>
                        </A>
                      </>
                    }
                  >
                    <div class="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2">
                      <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {headerUserName()?.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p class="text-sm text-slate-500">خوش آمدید</p>
                        <p class="text-base font-semibold">
                          {headerUserName()}
                        </p>
                      </div>
                      <button
                        class="btn btn-soft whitespace-nowrap"
                        type="button"
                        onClick={auth.logout}
                      >
                        خروج
                      </button>
                    </div>
                  </Show>
                </div>
              </div>
              {/* <Show when={props.showCategoryNav !== false}>
                <nav class="category-nav" aria-label="دسته‌بندی اصلی">
                  <div class="category-track">
                    <For each={categoryLinks}>
                      {(category, index) => (
                        <a
                          href={category.href}
                          class={`category-link ${
                            index() === 0 ? "is-active" : ""
                          }`}
                        >
                          {category.label}
                        </a>
                      )}
                    </For>
                  </div>
                </nav>
              </Show> */}
            </div>
          </header>

          {props.children}

          <footer class="bg-white border-t border-slate-200" id="contact">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-10">
              <div class="flex flex-wrap items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                  <img class="w-16" src="/assets/images/logos.png" alt="لوگو" />
                  <div>
                    <p class="font-semibold text-lg">مهر سپهر</p>
                    <p class="text-sm text-slate-500">
                      از دهه ۱۳۴۰ کنار خانواده‌های ایرانی
                    </p>
                  </div>
                </div>
                <button
                  class="btn btn-primary"
                  type="button"
                  onClick={scrollToTop}
                  aria-label="رفتن به بالای صفحه"
                >
                  رفتن به بالای صفحه
                  <i class="fa-solid fa-arrow-up-from-bracket text-sm"></i>
                </button>
              </div>
              <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <section>
                  <h4 class="footer-heading">دسته‌بندی‌ها</h4>
                  <ul class="footer-list">
                    <For each={footerLinks.categories}>
                      {(link) => (
                        <li>
                          <a href={link.href}>{link.label}</a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
                <section>
                  <h4 class="footer-heading">برندها</h4>
                  <ul class="footer-list" id="brands">
                    <For each={footerLinks.brands}>
                      {(link) => (
                        <li>
                          <a href={link.href}>{link.label}</a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
                <section>
                  <h4 class="footer-heading">خدمات مشتریان</h4>
                  <ul class="footer-list">
                    <For each={footerLinks.services}>
                      {(link) => (
                        <li>
                          <a href={link.href}>{link.label}</a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
                <section class="space-y-3">
                  <h4 class="footer-heading">ارتباط با مهر سپهر</h4>
                  <p>تلفن: 021-28423963</p>
                  <p>ایمیل: gablame.com@gmail.com</p>
                  <div class="flex gap-3">
                    <For each={footerSocial}>
                      {(social) => (
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          class="footer-social"
                        >
                          <img src={social.src} alt={social.alt} />
                        </a>
                      )}
                    </For>
                  </div>
                </section>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <p class="text-sm text-slate-500 max-w-2xl">
                  از دهه ۱۳۴۰ خورشیدی با فعالیت حاج آقا محمود ستاری، این فعالیت
                  صنفی آغاز شد و امروز در قالب شرکت مهرسپهر آریاقشم با تمرکز بر
                  تجربه خرید امن و پاسخگو ادامه دارد.
                </p>
                <div class="flex items-center gap-3">
                  <For each={complianceBadges}>
                    {(badge) => (
                      <a
                        href={badge.href}
                        target="_blank"
                        rel="noreferrer"
                        class="compliance-badge"
                      >
                        <img src={badge.src} alt={badge.alt} />
                      </a>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default StoreLayout;
