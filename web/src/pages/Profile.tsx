import { Show, createEffect, createSignal, createMemo } from "solid-js";
import { usersApi } from "../utils/api";
import { useAuth } from "../store/auth";

const Profile = () => {
  const auth = useAuth();
  const [form, setForm] = createSignal({
    username: "",
    email: "",
    phone: "",
    avatar: "",
    password: "",
  });
  const [isSaving, setIsSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [preview, setPreview] = createSignal<string | null>(null);
  const [message, setMessage] = createSignal<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValid = createMemo(() => {
    const f = form();
    if (!f.username || f.username.trim().length < 3) return false;
    if (!emailRegex.test(f.email)) return false;
    if (f.phone && !/^\d{10,11}$/.test(f.phone)) return false;
    return true;
  });

  createEffect(() => {
    const current = auth.user();
    if (current) {
      setForm({
        username: current.username,
        email: current.email,
        phone: current.phone ?? "",
        avatar: current.avatar ?? "",
        password: "",
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

    const formData = new FormData();
    formData.append("avatar", file);
    try {
      setUploading(true);
      await usersApi.uploadAvatar(current.id, formData);
      await auth.refreshProfile();
      setMessage({ type: "success", text: "آواتار بروزرسانی شد." });
    } catch (err) {
      setMessage({ type: "error", text: "خطا در آپلود آواتار." });
      setPreview(current.avatar ?? null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    const current = auth.user();
    if (!current) return;
    setPreview(current.avatar ?? null);
    setForm({ ...form(), avatar: "" });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setMessage(null);
    if (!isValid()) {
      setMessage({ type: "error", text: "لطفا فیلدها را صحیح پر کنید." });
      return;
    }
    setIsSaving(true);
    const current = auth.user();
    if (!current) return;

    try {
      await usersApi.update(current.id, form());
      await auth.refreshProfile();
      setForm({ ...form(), password: "" });
      setMessage({ type: "success", text: "پروفایل بروزرسانی شد." });
    } catch (err) {
      setMessage({ type: "error", text: "خطا در بروزرسانی." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div>
        <p class="section-kicker">اطلاعات شخصی</p>
        <h1 class="text-3xl font-semibold text-slate-900">پروفایل من</h1>
      </div>

      <Show when={auth.user()} fallback={<p>در حال بارگیری...</p>}>
        <form class="space-y-6" onSubmit={handleSubmit}>
          <div class="grid sm:grid-cols-2 gap-6">
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
                onInput={(e) =>
                  setForm({ ...form(), username: e.currentTarget.value })
                }
                class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <Show
                when={
                  form().username.trim().length > 0 &&
                  form().username.trim().length < 3
                }
              >
                <p class="text-xs text-red-600 mt-2">
                  نام کاربری باید حداقل ۳ کاراکتر باشد.
                </p>
              </Show>
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
                onInput={(e) =>
                  setForm({ ...form(), email: e.currentTarget.value })
                }
                class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <Show when={form().email && !emailRegex.test(form().email)}>
                <p class="text-xs text-red-600 mt-2">فرمت ایمیل معتبر نیست.</p>
              </Show>
            </div>
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
              type="tel"
              value={form().phone}
              onInput={(e) =>
                setForm({ ...form(), phone: e.currentTarget.value })
              }
              class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="09123456789"
            />
          </div>

          {/* Avatar */}
          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-2">
              تصویر پروفایل
            </label>
            <div class="flex items-center gap-4">
              <Show
                when={preview()}
                fallback={<div class="h-24 w-24 rounded-full bg-slate-200" />}
              >
                <img
                  src={preview()!}
                  alt="آواتار"
                  class="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
                />
              </Show>
              <label class="cursor-pointer bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl font-medium transition-all">
                انتخاب تصویر
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              <button
                type="button"
                class="text-sm text-red-600 hover:underline"
                onClick={handleRemoveAvatar}
              >
                حذف تصویر
              </button>
              <Show when={uploading()}>
                <i class="fa-solid fa-spinner fa-spin text-indigo-600"></i>
              </Show>
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
            class={`btn btn-primary w-full ${
              !isValid() ? "opacity-60 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isSaving() || !isValid()}
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
