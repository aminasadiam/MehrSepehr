import { useNavigate } from "@solidjs/router";
import { ParentComponent, Show, createEffect } from "solid-js";
import { useAuth } from "../store/auth";
import AdminLayout from "./AdminLayout";

const AdminRoute: ParentComponent<{}> = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();

  createEffect(() => {
    if (!auth.isProfileLoading() && !auth.isAuthenticated()) {
      navigate("/login", { replace: true });
    } else if (
      !auth.isProfileLoading() &&
      auth.isAuthenticated() &&
      !auth.isAdmin()
    ) {
      navigate("/", { replace: true });
    }
  });

  return (
    <Show
      when={auth.isAuthenticated() && auth.isAdmin()}
      fallback={
        <div class="flex min-h-[420px] items-center justify-center">
          <div class="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
            <p class="text-sm text-slate-500">در حال بررسی دسترسی...</p>
          </div>
        </div>
      }
    >
      <AdminLayout>{props.children}</AdminLayout>
    </Show>
  );
};

export default AdminRoute;
