import { Show, createEffect, createSignal } from "solid-js";
import { usersApi } from "../utils/api";
import { useAuth } from "../store/auth";

const Profile = () => {
  const auth = useAuth();
  const [form, setForm] = createSignal({ username: "", email: "" });
  const [message, setMessage] = createSignal<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = createSignal(false);

  createEffect(() => {
    const current = auth.user();
    if (current) {
      setForm({
        username: current.username,
        email: current.email,
      });
    }
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const current = auth.user();
    if (!current) return;

    try {
      setIsSaving(true);
      setMessage(null);
      await usersApi.update(current.id, {
        username: form().username,
        email: form().email,
      });
      setMessage({ type: "success", text: "اطلاعات حساب کاربری ذخیره شد." });
      await auth.refreshProfile();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "ذخیره اطلاعات با خطا مواجه شد.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="section-kicker">اطلاعات حساب</p>
          <h1 class="text-3xl font-semibold text-slate-900">پروفایل کاربری</h1>
        </div>
        <button
          class="btn btn-soft"
          type="button"
          onClick={() => auth.logout()}
        >
          خروج از حساب
        </button>
      </div>

      <Show
        when={auth.user()}
        fallback={
          <div class="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            برای مشاهده پروفایل ابتدا وارد حساب شوید.
          </div>
        }
      >
        <form
          class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              class="block text-sm font-semibold text-slate-600"
              for="username"
            >
              نام کاربری
            </label>
            <input
              id="username"
              type="text"
              value={form().username}
              onInput={(event) =>
                setForm({ ...form(), username: event.currentTarget.value })
              }
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label
              class="block text-sm font-semibold text-slate-600"
              for="email"
            >
              ایمیل
            </label>
            <input
              id="email"
              type="email"
              value={form().email}
              onInput={(event) =>
                setForm({ ...form(), email: event.currentTarget.value })
              }
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <button
            class="btn btn-primary w-full"
            type="submit"
            disabled={isSaving()}
          >
            {isSaving() ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <Show when={message()}>
            {(state) => (
              <div
                class={`rounded-2xl px-4 py-3 text-sm ${
                  state().type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {state().text}
              </div>
            )}
          </Show>
        </form>
      </Show>
    </section>
  );
};

export default Profile;
