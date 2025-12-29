import { Component, createSignal, onMount, For, Show } from "solid-js";
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

      const users = Array.isArray(uRes.data) ? uRes.data : [];
      const products = Array.isArray(pRes.data) ? pRes.data : [];
      const orders = Array.isArray(oRes.data) ? oRes.data : [];
      const categories = Array.isArray(cRes.data) ? cRes.data : [];

      const totalRevenue = orders.reduce(
        (sum: number, o: any) => sum + Number(o.total ?? 0),
        0
      );
      const pendingOrders = orders.filter(
        (o: any) => o.status === "pending"
      ).length;

      setStats({
        users: users.length,
        products: products.length,
        orders: orders.length,
        categories: categories.length,
        totalRevenue,
        pendingOrders,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  onMount(loadStats);

  const statsData = [
    { icon: "fa-users", label: "کاربران", value: () => stats().users },
    {
      icon: "fa-boxes-stacked",
      label: "محصولات",
      value: () => stats().products,
    },
    { icon: "fa-shopping-cart", label: "سفارشات", value: () => stats().orders },
    { icon: "fa-tags", label: "دسته‌بندی‌ها", value: () => stats().categories },
    {
      icon: "fa-dollar-sign",
      label: "درآمد کل",
      value: () =>
        Intl.NumberFormat("fa-IR").format(stats().totalRevenue) + " تومان",
    },
    {
      icon: "fa-clock",
      label: "سفارشات در انتظار",
      value: () => stats().pendingOrders,
    },
  ];

  return (
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">داشبورد مدیریت</h1>
        <button class="btn btn-outline" onClick={loadStats}>
          بروزرسانی <i class="fa-solid fa-rotate-left text-sm"></i>
        </button>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Show
          when={!loading()}
          fallback={
            <For each={Array(6)}>
              {() => <div class="stats-card animate-pulse"></div>}
            </For>
          }
        >
          <For each={statsData}>
            {(item) => (
              <div class="stats-card">
                <div class="stats-icon">
                  <i class={`fa-solid ${item.icon} text-2xl`}></i>
                </div>
                <div>
                  <p class="text-sm text-slate-500">{item.label}</p>
                  <h3 class="text-2xl font-bold text-slate-900">
                    {item.value()}
                  </h3>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>

      {/* Actions */}
      <div class="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
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
