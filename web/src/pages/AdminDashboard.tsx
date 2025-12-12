import { Component, createSignal, onMount, For } from "solid-js";
import { A } from "@solidjs/router";
import { usersApi, productsApi, ordersApi, categoriesApi } from "../utils/api";

const AdminDashboard: Component = () => {
  const [stats, setStats] = createSignal({
    users: 0,
    products: 0,
    orders: 0,
    categories: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = createSignal(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [uRes, pRes, oRes, cRes] = await Promise.all([
        usersApi.getAll(),
        productsApi.getAll(),
        ordersApi.adminGetAll(),
        categoriesApi.getAll(),
      ]);

      const users = (uRes.data as any) || [];
      const products = (pRes.data as any) || [];
      const orders = (oRes.data as any) || [];
      const categories = (cRes.data as any) || [];

      const totalRevenue = orders.reduce(
        (sum: number, o: any) => sum + Number(o.Total ?? o.total ?? 0),
        0
      );
      const pendingOrders = orders.filter(
        (o: any) => (o.Status ?? o.status) === "pending"
      ).length;

      setStats({
        users: users.length,
        products: products.length,
        orders: orders.length,
        categories: categories.length,
        totalRevenue,
        pendingOrders,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  onMount(loadStats);

  const statCards = [
    {
      title: "کاربران",
      value: stats().users,
      icon: "👥",
      color: "from-indigo-500 to-indigo-600",
      href: "/admin/users",
    },
    {
      title: "محصولات",
      value: stats().products,
      icon: "📦",
      color: "from-amber-500 to-amber-600",
      href: "/admin/products",
    },
    {
      title: "سفارش‌ها",
      value: stats().orders,
      icon: "🛒",
      color: "from-green-500 to-green-600",
      href: "/admin/orders",
    },
    {
      title: "دسته‌بندی‌ها",
      value: stats().categories,
      icon: "📋",
      color: "from-rose-500 to-rose-600",
      href: "/admin/categories",
    },
    {
      title: "درآمد کل",
      value: `${stats().totalRevenue.toLocaleString()} تومان`,
      icon: "💰",
      color: "from-emerald-500 to-emerald-600",
      href: "/admin/orders",
    },
    {
      title: "سفارش‌های در انتظار",
      value: stats().pendingOrders,
      icon: "⏳",
      color: "from-yellow-500 to-yellow-600",
      href: "/admin/orders",
    },
  ];

  const quickLinks = [
    { href: "/admin/users", label: "کاربران", icon: "👥", desc: "مدیریت کاربران" },
    { href: "/admin/products", label: "محصولات", icon: "📦", desc: "فهرست و ویرایش" },
    { href: "/admin/brands", label: "برندها", icon: "🏷️", desc: "مدیریت برندها" },
    { href: "/admin/orders", label: "سفارش‌ها", icon: "🛒", desc: "پیگیری و وضعیت سفارش" },
    { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "📋", desc: "مدیریت دسته‌ها" },
    { href: "/admin/groups", label: "گروه‌ها", icon: "👤", desc: "مدیریت گروه‌ها و دسترسی محصول" },
    { href: "/admin/wallets", label: "کیف‌پول", icon: "💳", desc: "مدیریت تراکنش‌ها" },
    { href: "/admin/roles", label: "نقش‌ها", icon: "🛡️", desc: "مدیریت نقش‌ها" },
    { href: "/admin/permissions", label: "دسترسی‌ها", icon: "🔑", desc: "مدیریت دسترسی‌ها" },
  ];

  return (
    <div dir="rtl">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-900 mb-2">داشبورد مدیریت</h1>
        <p class="text-slate-600">خوش آمدید به پنل مدیریت مهر سپهر</p>
      </div>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <For each={statCards}>
          {(card) => (
            <A
              href={card.href}
              class={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1`}
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm opacity-90 mb-1">{card.title}</div>
                  <div class="text-3xl font-bold">{card.value}</div>
                </div>
                <div class="text-5xl opacity-80">{card.icon}</div>
              </div>
            </A>
          )}
        </For>
      </div>

      {/* Quick Links */}
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 mb-4">دسترسی سریع</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <For each={quickLinks}>
            {(link) => (
              <A
                href={link.href}
                class="group block rounded-lg border border-slate-200 p-6 bg-white shadow-sm hover:shadow-md transition-all hover:border-indigo-300"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition-colors">
                    {link.icon}
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-slate-900 mb-1">{link.label}</div>
                    <div class="text-xs text-slate-500">{link.desc}</div>
                  </div>
                </div>
              </A>
            )}
          </For>
        </div>
      </div>

      {/* Actions */}
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">عملیات سریع</h3>
        <div class="flex flex-wrap gap-3">
          <A
            href="/admin/products"
            class="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-slate-700"
          >
            ➕ افزودن محصول جدید
          </A>
          <A
            href="/admin/users"
            class="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-slate-700"
          >
            👤 ایجاد کاربر جدید
          </A>
          <A
            href="/admin/categories"
            class="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-slate-700"
          >
            📋 افزودن دسته‌بندی
          </A>
          <A
            href="/admin/orders"
            class="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-slate-700"
          >
            🛒 مشاهده سفارش‌ها
          </A>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
