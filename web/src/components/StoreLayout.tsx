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
  { href: "/products", label: "فهرست محصولات", icon: "fa-solid fa-box" },
  { href: "/products", label: "پخت و پز", icon: "fa-solid fa-kitchen-set" },
  { href: "/products", label: "آشپزخانه", icon: "fa-solid fa-bowl-food" },
  { href: "/products", label: "یخچال و فریزر", icon: "fa-solid fa-snowflake" },
  { href: "/orders", label: "سفارش‌های من", icon: "fa-solid fa-receipt" },
];

const accountLinks = [
  { href: "/wallet", label: "کیف پول", icon: "fa-solid fa-wallet" },
  { href: "/profile", label: "پروفایل", icon: "fa-solid fa-circle-user" },
];

const sidebarSocial = [
  {
    href: "https://instagram.com",
    icon: "fa-brands fa-instagram",
    label: "اینستاگرام",
    gradient: "hover:from-pink-500 hover:to-rose-500",
  },
  {
    href: "https://wa.me",
    icon: "fa-brands fa-whatsapp",
    label: "واتساپ",
    gradient: "hover:from-green-500 hover:to-emerald-500",
  },
  {
    href: "https://t.me",
    icon: "fa-brands fa-telegram",
    label: "تلگرام",
    gradient: "hover:from-blue-500 hover:to-cyan-500",
  },
];

const footerLinks = {
  categories: [
    { label: "خانه", href: "/" },
    { label: "لوازم آشپزخانه", href: "/products" },
    { label: "لوازم خانگی برقی", href: "/products" },
    { label: "دسته‌بندی‌ها", href: "/products" },
  ],
  services: [
    { label: "تماس با ما", href: "#contact" },
    { label: "پشتیبانی ۲۴/۷", href: "#contact" },
    { label: "درباره ما", href: "#contact" },
    { label: "سوالات متداول", href: "#contact" },
  ],
  account: [
    { label: "حساب کاربری", href: "/profile" },
    { label: "سفارش‌های من", href: "/orders" },
    { label: "کیف پول", href: "/wallet" },
    { label: "ورود / ثبت نام", href: "/login" },
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
  const [isScrolled, setIsScrolled] = createSignal(false);
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
      navigate(`/products?q=${encodeURIComponent(q)}`);
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
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
    <div class="bg-slate-50 text-slate-900 min-h-screen">
      <a class="skip-link" href="#mainContent">
        پرش به محتوای اصلی
      </a>
      <div class="site-shell lg:flex lg:min-h-screen">
        {/* Sidebar */}
        <aside
          class={`sidebar bg-white border-l border-slate-200 ${
            isSidebarOpen() ? "is-open" : ""
          }`}
          id="mainSidebar"
          aria-label="منوی کناری"
          aria-hidden={isSidebarHidden()}
        >
          <div class="sidebar-header">
            <button
              class="sidebar-close lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
              type="button"
              aria-label="بستن منو"
              onClick={closeSidebar}
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
            <A
              class="sidebar-brand group"
              href="/"
              aria-label="بازگشت به صفحه اصلی"
            >
              <div class="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                <img
                  class="w-12 h-12 object-contain"
                  src="/assets/images/logos.png"
                  alt="لوگوی مهر سپهر"
                />
              </div>
              <div>
                <p class="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  مهر سپهر
                </p>
                <p class="text-xs text-slate-500 font-medium">
                  Mehr Sepehr Aria Qeshm
                </p>
              </div>
            </A>
          </div>

          <nav class="sidebar-nav" aria-label="دسترسی سریع">
            <For each={sidebarLinks}>
              {(item) => (
                <A
                  href={item.href}
                  class="sidebar-link group"
                  onClick={closeSidebar}
                >
                  <div class="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-linear-to-br group-hover:from-indigo-500 group-hover:to-purple-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <i
                      class={`${item.icon} text-slate-600 group-hover:text-white transition-colors`}
                    ></i>
                  </div>
                  <span class="font-semibold group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </span>
                </A>
              )}
            </For>
          </nav>

          <Show when={auth.isAuthenticated()}>
            <div class="sidebar-nav" aria-label="لینک‌های کاربری">
              <p class="text-xs uppercase tracking-widest text-slate-400 mb-4 px-3 font-bold">
                حساب کاربری
              </p>
              <Show when={auth.isAdmin()}>
                <A
                  href="/admin"
                  class="sidebar-link group bg-linear-to-l from-indigo-50 via-purple-50 to-pink-50 border-r-4 border-indigo-500 shadow-sm"
                  onClick={closeSidebar}
                >
                  <div class="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <i class="fa-solid fa-user-shield text-white"></i>
                  </div>
                  <span class="font-bold text-indigo-900">پنل مدیریت</span>
                </A>
              </Show>
              <For each={accountLinks}>
                {(item) => (
                  <A
                    href={item.href}
                    class="sidebar-link group"
                    onClick={closeSidebar}
                  >
                    <div class="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-linear-to-br group-hover:from-indigo-500 group-hover:to-purple-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <i
                        class={`${item.icon} text-slate-600 group-hover:text-white transition-colors`}
                      ></i>
                    </div>
                    <span class="font-semibold group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </span>
                  </A>
                )}
              </For>
            </div>
          </Show>

          <div class="sidebar-footer">
            <div class="space-y-3">
              <div class="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-indigo-100 shadow-sm">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <i class="fa-solid fa-phone text-white text-sm"></i>
                  </div>
                  <p class="text-xs text-slate-600 font-bold">تماس با ما</p>
                </div>
                <a
                  class="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                  href="tel:02128423963"
                >
                  021-28423963
                </a>
              </div>
              <div class="bg-linear-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-5 border-2 border-purple-100 shadow-sm">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <i class="fa-solid fa-envelope text-white text-sm"></i>
                  </div>
                  <p class="text-xs text-slate-600 font-bold">ایمیل</p>
                </div>
                <a
                  class="text-sm font-bold text-slate-900 hover:text-purple-600 transition-colors break-all"
                  href="mailto:gablame.com@gmail.com"
                >
                  gablame.com@gmail.com
                </a>
              </div>
            </div>
            <div class="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
              <For each={sidebarSocial}>
                {(social) => (
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    class={`w-14 h-14 rounded-2xl bg-slate-100 bg-linear-to-br ${social.gradient} flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl text-slate-600 hover:text-white`}
                  >
                    <i class={`${social.icon} text-xl`}></i>
                  </a>
                )}
              </For>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        <div
          class={`sidebar-overlay ${isSidebarOpen() ? "is-visible" : ""}`}
          onClick={closeSidebar}
          role="presentation"
        ></div>

        {/* Main Content */}
        <main id="mainContent" class="content-area flex-1 min-h-screen">
          {/* Header */}
          <header
            class={`page-header sticky top-0 z-50 transition-all duration-300 ${
              isScrolled()
                ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-slate-200"
                : "bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200"
            }`}
          >
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
              <div class="flex flex-wrap items-center justify-between gap-4 py-5">
                {/* Mobile Menu & Logo */}
                <div class="flex items-center gap-3">
                  <button
                    class="lg:hidden w-12 h-12 rounded-2xl bg-slate-100 hover:bg-linear-to-br hover:from-indigo-500 hover:to-purple-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl"
                    type="button"
                    aria-controls="mainSidebar"
                    aria-expanded={!isDesktop() && isSidebarOpen()}
                    onClick={toggleSidebar}
                  >
                    <span class="sr-only">باز کردن منو</span>
                    <i class="fa-solid fa-bars text-lg"></i>
                  </button>
                  <A
                    href="/"
                    class="lg:hidden flex items-center gap-3 group"
                    aria-label="صفحه اصلی"
                  >
                    <div class="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <img
                        class="w-12 h-12 object-contain"
                        src="/assets/images/logos.png"
                        alt="لوگو مهر سپهر"
                      />
                    </div>
                    <span class="font-extrabold text-xl text-slate-900">
                      مهر سپهر
                    </span>
                  </A>
                </div>

                {/* Search Bar */}
                <label
                  class="relative flex-1 min-w-[220px] lg:max-w-2xl"
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
                    placeholder="جستجو محصولات، برند یا دسته‌بندی..."
                    class="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 focus:bg-white focus:border-indigo-500 py-3.5 pl-14 pr-5 text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm hover:shadow-md"
                  />
                  <button
                    type="button"
                    aria-label="جستجو"
                    class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    onClick={handleSearch}
                  >
                    <i class="fa-solid fa-magnifying-glass text-lg"></i>
                  </button>
                </label>

                {/* User Section */}
                <div class="flex items-center gap-3">
                  <Show
                    when={auth.isAuthenticated()}
                    fallback={
                      <A
                        href="/login"
                        class="btn btn-primary whitespace-nowrap px-6 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        ورود
                        <i class="fa-solid fa-right-to-bracket text-sm"></i>
                      </A>
                    }
                  >
                    <div class="flex items-center gap-3 bg-linear-to-l from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl px-5 py-3 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div class="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 via-purple-600 to-pink-600 text-white flex items-center justify-center font-extrabold text-xl shadow-lg">
                        {headerUserName()?.slice(0, 1).toUpperCase()}
                      </div>
                      <div class="hidden sm:block">
                        <p class="text-xs text-slate-500 font-bold">
                          خوش آمدید
                        </p>
                        <p class="text-sm font-extrabold text-slate-900 truncate max-w-[140px]">
                          {headerUserName()}
                        </p>
                      </div>
                      <button
                        class="btn btn-soft whitespace-nowrap text-sm px-4 py-2 hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-300"
                        type="button"
                        onClick={auth.logout}
                      >
                        خروج
                        <i class="fa-solid fa-right-from-bracket text-xs"></i>
                      </button>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          {props.children}

          {/* Footer */}
          <footer
            class="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden"
            id="contact"
          >
            <div class="absolute inset-0 bg-black/10"></div>
            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 space-y-12">
              {/* Top Section */}
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-700">
                <div class="flex items-center gap-5">
                  <div class="w-24 h-24 rounded-3xl bg-linear-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                    <img
                      class="w-20 h-20 object-contain"
                      src="/assets/images/logos.png"
                      alt="لوگو مهر سپهر"
                    />
                  </div>
                  <div>
                    <p class="font-extrabold text-2xl text-white mb-2">
                      مهر سپهر
                    </p>
                    <p class="text-sm text-slate-300 font-medium">
                      از دهه ۱۳۴۰ کنار خانواده‌های ایرانی
                    </p>
                  </div>
                </div>
                <button
                  class="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  type="button"
                  onClick={scrollToTop}
                  aria-label="رفتن به بالای صفحه"
                >
                  رفتن به بالا
                  <i class="fa-solid fa-arrow-up group-hover:-translate-y-1 transition-transform"></i>
                </button>
              </div>

              {/* Links Grid */}
              <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <section>
                  <h4 class="footer-heading text-white text-lg font-extrabold mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-list text-indigo-400"></i>
                    دسته‌بندی‌ها
                  </h4>
                  <ul class="footer-list space-y-3">
                    <For each={footerLinks.categories}>
                      {(link) => (
                        <li>
                          <a
                            href={link.href}
                            class="text-slate-300 hover:text-white hover:translate-x-[-6px] transition-all duration-300 inline-flex items-center gap-2 font-medium"
                          >
                            <i class="fa-solid fa-chevron-left text-xs opacity-0 group-hover:opacity-100"></i>
                            {link.label}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>

                <section>
                  <h4 class="footer-heading text-white text-lg font-extrabold mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-headset text-purple-400"></i>
                    خدمات مشتریان
                  </h4>
                  <ul class="footer-list space-y-3">
                    <For each={footerLinks.services}>
                      {(link) => (
                        <li>
                          <a
                            href={link.href}
                            class="text-slate-300 hover:text-white hover:translate-x-[-6px] transition-all duration-300 inline-flex items-center gap-2 font-medium"
                          >
                            <i class="fa-solid fa-chevron-left text-xs opacity-0 group-hover:opacity-100"></i>
                            {link.label}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>

                <section>
                  <h4 class="footer-heading text-white text-lg font-extrabold mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-user text-pink-400"></i>
                    حساب کاربری
                  </h4>
                  <ul class="footer-list space-y-3">
                    <For each={footerLinks.account}>
                      {(link) => (
                        <li>
                          <a
                            href={link.href}
                            class="text-slate-300 hover:text-white hover:translate-x-[-6px] transition-all duration-300 inline-flex items-center gap-2 font-medium"
                          >
                            <i class="fa-solid fa-chevron-left text-xs opacity-0 group-hover:opacity-100"></i>
                            {link.label}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>

                <section class="space-y-6">
                  <h4 class="footer-heading text-white text-lg font-extrabold mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-phone text-green-400"></i>
                    ارتباط با ما
                  </h4>
                  <div class="space-y-4">
                    <div class="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div class="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-phone text-white"></i>
                      </div>
                      <a
                        href="tel:02128423963"
                        class="text-white hover:text-indigo-300 transition-colors font-bold"
                      >
                        021-28423963
                      </a>
                    </div>
                    <div class="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div class="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-envelope text-white"></i>
                      </div>
                      <a
                        href="mailto:gablame.com@gmail.com"
                        class="text-white hover:text-purple-300 transition-colors break-all text-sm font-bold"
                      >
                        gablame.com@gmail.com
                      </a>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 pt-2">
                    <For each={footerSocial}>
                      {(social) => (
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          class="w-14 h-14 rounded-2xl bg-white/10 hover:bg-linear-to-br hover:from-indigo-500 hover:to-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/20"
                        >
                          <img
                            src={social.src}
                            alt={social.alt}
                            class="w-10 h-10 object-contain"
                          />
                        </a>
                      )}
                    </For>
                  </div>
                </section>
              </div>

              {/* Bottom Section */}
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-slate-700">
                <p class="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  از دهه ۱۳۴۰ خورشیدی با فعالیت حاج آقا محمود ستاری، این فعالیت
                  صنفی آغاز شد و امروز در قالب شرکت مهرسپهر آریاقشم با تمرکز بر
                  تجربه خرید امن و پاسخگو ادامه دارد.
                </p>
                <div class="flex items-center gap-4">
                  <For each={complianceBadges}>
                    {(badge) => (
                      <a
                        href={badge.href}
                        target="_blank"
                        rel="noreferrer"
                        class="compliance-badge hover:scale-110 transition-transform duration-300"
                      >
                        <img
                          src={badge.src}
                          alt={badge.alt}
                          class="rounded-2xl shadow-xl"
                        />
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
