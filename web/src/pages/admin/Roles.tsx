import { Component, createSignal, onMount, For, Show } from "solid-js";
import { adminApi } from "../../utils/api";

const Roles: Component = () => {
  const [roles, setRoles] = createSignal<any[]>([]);
  const [perms, setPerms] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [newName, setNewName] = createSignal("");
  const [newDesc, setNewDesc] = createSignal("");

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
      ]);
      setRoles((rRes.data as any) || []);
      setPerms((pRes.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    const name = newName().trim();
    if (!name) return alert("نام نقش را وارد کنید");
    try {
      await adminApi.createRole({ name, description: newDesc().trim() });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await load();
      alert("نقش با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد نقش");
    }
  };

  const deleteRole = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این نقش را حذف کنید؟")) return;
    try {
      await adminApi.deleteRole(id);
      await load();
      alert("نقش حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف نقش");
    }
  };

  const addPerm = async (roleId: number, permId: number) => {
    try {
      await adminApi.addPermissionToRole(roleId, permId);
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در افزودن دسترسی به نقش");
    }
  };

  const removePerm = async (roleId: number, permId: number) => {
    if (!confirm("حذف دسترسی از نقش؟")) return;
    try {
      await adminApi.removePermissionFromRole(roleId, permId);
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در حذف دسترسی از نقش");
    }
  };

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت نقش‌ها</h2>
          <p class="text-slate-600">
            ایجاد و مدیریت نقش‌های کاربری و دسترسی‌ها
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>افزودن نقش</span>
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
        <div class="space-y-4">
          <For each={roles()}>
            {(r: any) => (
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-slate-900 mb-1">
                      {r.Name ?? r.name}
                    </h3>
                    {r.Description ?? r.description ? (
                      <p class="text-sm text-slate-600">
                        {r.Description ?? r.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => deleteRole(r.ID ?? r.id)}
                    class="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    حذف نقش
                  </button>
                </div>

                <div class="mb-4">
                  <div class="text-sm font-medium text-slate-700 mb-3">
                    دسترسی‌های این نقش:
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <Show
                      when={(r.Permissions || []).length > 0}
                      fallback={
                        <span class="text-sm text-slate-400">
                          هیچ دسترسی‌ای ندارد
                        </span>
                      }
                    >
                      <For each={r.Permissions || []}>
                        {(p: any) => (
                          <span class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                            {p.Name ?? p.name}
                            <button
                              onClick={() =>
                                removePerm(r.ID ?? r.id, p.ID ?? p.id)
                              }
                              class="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </span>
                        )}
                      </For>
                    </Show>
                  </div>
                </div>

                <div class="border-t border-slate-200 pt-4">
                  <div class="flex items-center gap-3">
                    <select
                      id={`add-perm-${r.ID ?? r.id}`}
                      class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">افزودن دسترسی...</option>
                      {perms()
                        .filter(
                          (p: any) =>
                            !(r.Permissions || []).some(
                              (rp: any) => (rp.ID ?? rp.id) === (p.ID ?? p.id)
                            )
                        )
                        .map((p: any) => (
                          <option value={p.ID ?? p.id}>
                            {p.Name ?? p.name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        const sel = document.getElementById(
                          `add-perm-${r.ID ?? r.id}`
                        ) as HTMLSelectElement | null;
                        if (!sel) return;
                        const val = sel.value;
                        if (!val) return alert("دسترسی را انتخاب کنید");
                        addPerm(r.ID ?? r.id, parseInt(val, 10));
                      }}
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      افزودن
                    </button>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
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
              <h3 class="text-xl font-bold">ایجاد نقش جدید</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  نام نقش *
                </label>
                <input
                  type="text"
                  placeholder="مثال: مدیر"
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
                  placeholder="توضیحات نقش..."
                  value={newDesc()}
                  onInput={(e) => setNewDesc(e.currentTarget.value)}
                  rows={3}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  onClick={createRole}
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

export default Roles;
