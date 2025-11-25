import type { Component, ParentProps } from "solid-js";
import { useLocation } from "@solidjs/router";
import StoreLayout from "./components/StoreLayout";

const AUTH_ROUTES = ["/login", "/register"];

const App: Component = (props: ParentProps) => {
  const location = useLocation();
  const isAuthRoute = () =>
    AUTH_ROUTES.some((route) => location.pathname.startsWith(route));

  return isAuthRoute() ? (
    <>{props.children}</>
  ) : (
    <StoreLayout>{props.children}</StoreLayout>
  );
};

export default App;
