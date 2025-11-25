/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import "solid-devtools";

import App from "./App";
import { Route, Router } from "@solidjs/router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import Users from "./pages/admin/Users";
import Roles from "./pages/admin/Roles";
import Permissions from "./pages/admin/Permissions";
import AdminProducts from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import Wallets from "./pages/admin/Wallets";
import type { Component as SolidComponent } from "solid-js";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

const withProtection = (Component: SolidComponent) => () =>
  (
    <ProtectedRoute>
      <Component />
    </ProtectedRoute>
  );

const NotFound = () => (
  <div class="flex min-h-[360px] items-center justify-center text-slate-500">
    صفحه مورد نظر یافت نشد.
  </div>
);

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/orders" component={withProtection(Orders)} />
      <Route path="/wallet" component={withProtection(Wallet)} />
      <Route path="/profile" component={withProtection(Profile)} />
      <Route
        path="/admin"
        component={() => (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/users"
        component={() => (
          <AdminRoute>
            <Users />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/roles"
        component={() => (
          <AdminRoute>
            <Roles />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/permissions"
        component={() => (
          <AdminRoute>
            <Permissions />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/products"
        component={() => (
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/categories"
        component={() => (
          <AdminRoute>
            <Categories />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/orders"
        component={() => (
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/wallets"
        component={() => (
          <AdminRoute>
            <Wallets />
          </AdminRoute>
        )}
      />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="*" component={NotFound} />
    </Router>
  ),
  root!
);
