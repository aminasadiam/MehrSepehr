import { Component } from "solid-js";

const AdminDashboard: Component = () => {
  return (
    <div class="p-6">
      <h1 class="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p class="text-sm text-slate-600">
        Use the left menu to manage users, products, categories, roles and
        permissions.
      </p>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/admin/users" class="rounded border p-4 hover:bg-slate-50">
          Users
        </a>
        <a href="/admin/products" class="rounded border p-4 hover:bg-slate-50">
          Products
        </a>
        <a href="/admin/orders" class="rounded border p-4 hover:bg-slate-50">
          Orders
        </a>
        <a
          href="/admin/categories"
          class="rounded border p-4 hover:bg-slate-50"
        >
          Categories
        </a>
        <a href="/admin/wallets" class="rounded border p-4 hover:bg-slate-50">
          Wallets
        </a>
        <a href="/admin/roles" class="rounded border p-4 hover:bg-slate-50">
          Roles
        </a>
        <a
          href="/admin/permissions"
          class="rounded border p-4 hover:bg-slate-50"
        >
          Permissions
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
