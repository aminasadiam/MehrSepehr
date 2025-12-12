import { Show, createEffect, createSignal } from "solid-js";
import { usersApi } from "../utils/api";
import { useAuth } from "../store/auth";

const Profile = () => {
  const auth = useAuth();
  const [form, setForm] = createSignal({ username: "", email: "" });
  const [isSavingPassword, setIsSavingPassword] = createSignal(false);
  const [message, setMessage] = createSignal<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [preview, setPreview] = createSignal<string | null>(null);

  createEffect(() => {
    const current = auth.user();
    if (current) {
      setForm({
        username: current.username,
        email: current.email,
        phone: current.phone ?? "",
        avatar: current.avatar ?? "",
      });
      setPreview(current.avatar ?? null);
    }
  });

  const handleAvatarChange = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const current = auth.user();
    if (!current) return;

    // show local preview
    setPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append("avatar", file);
    try {
      setUploading(true);
      await usersApi.uploadAvatar(current.id, form);
      await auth.refreshProfile();
      setMessage({ type: "success", text: "تصویر پروفایل بارگذاری شد." });
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err?.message || "بارگذاری با خطا مواجه شد.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const current = auth.user();
    if (!current) return;

    try {
      setIsSaving(true);
      setMessage(null);
      const payload: any = {
        username: form().username,
        email: form().email,
      };
      if (form().phone !== undefined) payload.phone = form().phone;
      if (form().avatar !== undefined) payload.avatar = form().avatar;
      if ((form() as any).password) payload.password = (form() as any).password;

      await usersApi.update(current.id, payload);
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

          <div>
            <label
              class="block text-sm font-semibold text-slate-600"
              for="phone"
            >
              شماره تلفن
            </label>
            <input
              id="phone"
              type="text"
              value={form().phone}
              onInput={(event) =>
                setForm({ ...form(), phone: event.currentTarget.value })
              }
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              class="block text-sm font-semibold text-slate-600"
              for="avatar"
            >
              تصویر پروفایل
            </label>
            <div class="flex items-center gap-3">
              <div class="w-20 h-20 rounded-full overflow-hidden bg-slate-100">
                <Show when={preview()}>
                  <img
                    src={preview()!}
                    alt="avatar"
                    class="w-full h-full object-cover"
                  />
                </Show>
              </div>
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <div class="text-xs text-slate-500 mt-1">
                  {uploading()
                    ? "در حال آپلود..."
                    : "آپلود یک تصویر برای پروفایل"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-semibold text-slate-600"
              for="password"
            >
              رمز جدید (خالی بگذارید اگر نمی‌خواهید تغییر دهید)
            </label>
            <input
              id="password"
              type="password"
              onInput={(event) =>
                setForm({ ...form(), password: event.currentTarget.value })
              }
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
