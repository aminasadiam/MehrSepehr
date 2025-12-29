import { Component, createSignal, onMount, For, Show } from "solid-js";
import { adminApi } from "../../utils/api";

const Permissions: Component = () => {
  const [perms, setPerms] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [newName, setNewName] = createSignal("");
  const [newDesc, setNewDesc] = createSignal("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.permissions.getAll();
      // Normalize response: backend may return { items: [...] } or an array directly
      const data = (res && (res.data as any)) || [];
      const items = Array.isArray(data)
        ? data
        : data.items || data.items?.data || [];
      setPerms(items || []);
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "خطا در بارگذاری دسترسی‌ها";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const createPerm = async () => {
    const name = newName().trim();
    if (!name) return alert("نام دسترسی را وارد کنید");
    try {
      await adminApi.permissions.create({
        name,
        description: newDesc().trim(),
      });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await load();
      alert("دسترسی با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message || err?.message || "خطا در ایجاد دسترسی";
      alert(msg);
    }
  };

  const deletePerm = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این دسترسی را حذف کنید؟"))
      return;
    try {
      await adminApi.permissions.delete(id);
      await load();
      alert("دسترسی حذف شد");
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message || err?.message || "خطا در حذف دسترسی";
      alert(msg);
    }
  };

  onMount(load);

  return (
    <div
      dir="rtl"
      class="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50"
    >
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-cyan-600 via-cyan-700 to-cyan-800 text-white p-8 rounded-2xl border-b-4 border-cyan-900 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold flex items-center gap-3">
                <span class="text-3xl">🔐</span>
                مدیریت دسترسی‌ها
              </h1>
              <p class="text-cyan-100 mt-2">ایجاد و مدیریت دسترسی‌های سیستم</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              class="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-2"
            >
              <span>➕</span>
              <span>افزودن دسترسی</span>
            </button>
          </div>
        </div>

        <Show
          when={!loading()}
          fallback={
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="text-5xl mb-4 animate-spin">⏳</div>
                <div class="text-lg text-slate-600">
                  در حال بارگذاری دسترسی‌ها...
                </div>
              </div>
            </div>
          }
        >
          <Show
            when={perms().length > 0}
            fallback={
              <div class="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-12 text-center">
                <div class="text-6xl mb-4">🔑</div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">
                  دسترسی‌ای یافت نشد
                </h3>
                <p class="text-slate-600 mb-6">
                  هنوز هیچ دسترسی‌ای ایجاد نشده است
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  class="px-6 py-3 bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                >
                  ایجاد اولین دسترسی
                </button>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <For each={perms()}>
                {(p: any) => (
                  <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-lg transition-all p-6 group">
                    <div class="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-2xl">🔐</span>
                          <h3 class="text-lg font-bold text-slate-900">
                            {p.Name ?? p.name}
                          </h3>
                        </div>
                        {p.Description ?? p.description ? (
                          <p class="text-sm text-slate-600 line-clamp-2">
                            {p.Description ?? p.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      onClick={() => deletePerm(p.ID ?? p.id)}
                      class="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all text-sm font-bold flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <span>🗑️</span>
                      <span>حذف دسترسی</span>
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>

      {/* Create Modal */}
      <Show when={showCreate()}>
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div class="bg-linear-to-r from-cyan-600 via-cyan-700 to-cyan-800 text-white p-6 rounded-t-2xl border-b-4 border-cyan-900">
              <h3 class="text-2xl font-bold flex items-center gap-2">
                <span>➕</span>
                <span>ایجاد دسترسی جدید</span>
              </h3>
              <p class="text-cyan-100 text-sm mt-1">فرم ایجاد دسترسی جدید</p>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📝</span>
                  نام دسترسی *
                </label>
                <input
                  type="text"
                  placeholder="مثال: manage_users"
                  value={newName()}
                  onInput={(e) => setNewName(e.currentTarget.value)}
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                />
              </div>
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📋</span>
                  توضیحات
                </label>
                <textarea
                  placeholder="توضیحات دسترسی..."
                  value={newDesc()}
                  onInput={(e) => setNewDesc(e.currentTarget.value)}
                  rows={3}
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all resize-none"
                />
              </div>
            </div>
            <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-cyan-600 p-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={createPerm}
                class="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
              >
                <span>✅</span>
                <span>ایجاد</span>
              </button>
              <button
                onClick={() => setShowCreate(false)}
                class="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-bold flex items-center justify-center gap-2"
              >
                <span>❌</span>
                <span>انصراف</span>
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Permissions;
