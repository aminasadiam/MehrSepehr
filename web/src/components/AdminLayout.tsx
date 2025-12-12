import { Component, For } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import Logo from "../assets/logos.png";
import { useAuth } from "../store/auth";

const AdminLayout: Component = (props) => {
  const location = useLocation();
  const auth = useAuth();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { href: "/admin", label: "داشبورد", icon: "📊" },
    { href: "/admin/users", label: "کاربران", icon: "👥" },
    { href: "/admin/products", label: "محصولات", icon: "📦" },
    { href: "/admin/brands", label: "برندها", icon: "🏷️" },
    { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "📋" },
    { href: "/admin/orders", label: "سفارش‌ها", icon: "🛒" },
    { href: "/admin/groups", label: "گروه‌ها", icon: "👤" },
    { href: "/admin/wallets", label: "کیف‌پول", icon: "💳" },
    { href: "/admin/roles", label: "نقش‌ها", icon: "🛡️" },
    { href: "/admin/permissions", label: "دسترسی‌ها", icon: "🔑" },
  ];

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div class="max-w-[1400px] mx-auto py-6 px-4">
        <div class="flex items-start gap-6">
          <aside class="w-72 sticky top-6 h-[calc(100vh-48px)]">
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div class="flex items-center gap-3 mb-2">
                  <img src={Logo} alt="لوگو" class="w-12 h-12 rounded-lg bg-white/20 p-1" />
                  <div>
                    <div class="font-bold text-lg">پنل مدیریت</div>
                    <div class="text-xs text-indigo-100">مهر سپهر</div>
                  </div>
                </div>
                <div class="text-xs text-indigo-100 mt-2">
                  {auth.user()?.username || auth.user()?.Username || "مدیر"}
                </div>
              </div>

              <nav class="p-3 flex flex-col gap-1">
                <For each={navItems}>
                  {(item) => (
                    <A
                      href={item.href}
                      class={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                          : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                    >
                      <span class="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </A>
                  )}
                </For>
              </nav>

              <div class="p-3 border-t border-slate-200">
                <A
                  href="/"
                  class="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span>🏠</span>
                  <span>بازگشت به فروشگاه</span>
                </A>
              </div>
            </div>
          </aside>

          <main class="flex-1 min-w-0">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {props.children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
