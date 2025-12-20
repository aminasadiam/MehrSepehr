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
      const res = await adminApi.getPermissions();
      setPerms((res.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری دسترسی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const createPerm = async () => {
    const name = newName().trim();
    if (!name) return alert("نام دسترسی را وارد کنید");
    try {
      await adminApi.createPermission({ name, description: newDesc().trim() });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await load();
      alert("دسترسی با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد دسترسی");
    }
  };

  const deletePerm = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این دسترسی را حذف کنید؟"))
      return;
    try {
      await adminApi.deletePermission(id);
      await load();
      alert("دسترسی حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف دسترسی");
    }
  };

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">
            مدیریت دسترسی‌ها
          </h2>
          <p class="text-slate-600">ایجاد و مدیریت دسترسی‌های سیستم</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>افزودن دسترسی</span>
        </button>
      </div>

      <Show
        when={!loading()}
        fallback={
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="text-4xl mb-4">⏳</div>
              <div class="text-slate-600">در حال بارگذاری...</div>
            </div>
          </div>
        }
      >
        <Show
          when={perms().length > 0}
          fallback={
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div class="text-6xl mb-4">🔑</div>
              <h3 class="text-xl font-semibold text-slate-800 mb-2">
                دسترسی‌ای یافت نشد
              </h3>
              <p class="text-slate-600 mb-4">هیچ دسترسی‌ای وجود ندارد</p>
              <button
                onClick={() => setShowCreate(true)}
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ایجاد اولین دسترسی
              </button>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={perms()}>
              {(p: any) => (
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-slate-900 mb-1">
                        {p.Name ?? p.name}
                      </h3>
                      {p.Description ?? p.description ? (
                        <p class="text-sm text-slate-600 line-clamp-2">
                          {p.Description ?? p.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => deletePerm(p.ID ?? p.id)}
                      class="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Create Modal */}
      <Show when={showCreate()}>
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            class="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div class="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h3 class="text-xl font-bold">ایجاد دسترسی جدید</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  نام دسترسی *
                </label>
                <input
                  type="text"
                  placeholder="مثال: manage_users"
                  value={newName()}
                  onInput={(e) => setNewName(e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  placeholder="توضیحات دسترسی..."
                  value={newDesc()}
                  onInput={(e) => setNewDesc(e.currentTarget.value)}
                  rows={3}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  onClick={createPerm}
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  ایجاد
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Permissions;
