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
        adminApi.roles.getAll(),
        adminApi.permissions.getAll(),
      ]);
      // Normalize responses: backend may return array or { items: [...] }
      const rData = (rRes && (rRes.data as any)) || [];
      const pData = (pRes && (pRes.data as any)) || [];
      const rItems = Array.isArray(rData)
        ? rData
        : rData.items || rData.items?.data || [];
      const pItems = Array.isArray(pData)
        ? pData
        : pData.items || pData.items?.data || [];
      // Ensure consistent field names for the UI (Permissions, ID, Name)
      const normalizedRoles = (rItems || []).map((r: any) => ({
        ...r,
        Permissions: r.Permissions || r.permissions || [],
        ID: r.ID || r.id,
        Name: r.Name || r.name,
        Description: r.Description || r.description,
      }));

      const normalizedPerms = (pItems || []).map((p: any) => ({
        ...p,
        ID: p.ID || p.id,
        Name: p.Name || p.name,
        Description: p.Description || p.description,
      }));

      setRoles(normalizedRoles);
      setPerms(normalizedPerms);
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "خطا در بارگذاری داده‌ها";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    const name = newName().trim();
    if (!name) return alert("نام نقش را وارد کنید");
    try {
      await adminApi.roles.create({ name, description: newDesc().trim() });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await load();
      alert("نقش با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message || err?.message || "خطا در ایجاد نقش";
      alert(msg);
    }
  };

  const deleteRole = async (id: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این نقش را حذف کنید؟")) return;
    try {
      await adminApi.roles.delete(id);
      await load();
      alert("نقش حذف شد");
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message || err?.message || "خطا در حذف نقش";
      alert(msg);
    }
  };

  const addPerm = async (roleId: number, permId: number) => {
    try {
      await adminApi.roles.addPermissionToRole(roleId, permId);
      await load();
      alert("دسترسی به نقش افزوده شد");
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "خطا در افزودن دسترسی به نقش";
      alert(msg);
    }
  };

  const removePerm = async (roleId: number, permId: number) => {
    if (!confirm("حذف دسترسی از نقش؟")) return;
    try {
      await adminApi.roles.removePermissionFromRole(roleId, permId);
      await load();
      alert("دسترسی از نقش حذف شد");
    } catch (e) {
      console.error(e);
      const err = e as any;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "خطا در حذف دسترسی از نقش";
      alert(msg);
    }
  };

  onMount(load);

  return (
    <div
      dir="rtl"
      class="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-indigo-50"
    >
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-purple-600 via-purple-700 to-purple-800 text-white p-8 rounded-2xl border-b-4 border-purple-900 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold flex items-center gap-3">
                <span class="text-3xl">🎭</span>
                مدیریت نقش‌ها
              </h1>
              <p class="text-purple-100 mt-2">
                ایجاد و مدیریت نقش‌های کاربری و دسترسی‌های سیستم
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              class="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-2"
            >
              <span>➕</span>
              <span>افزودن نقش</span>
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
                  در حال بارگذاری نقش‌ها...
                </div>
              </div>
            </div>
          }
        >
          <Show
            when={roles().length > 0}
            fallback={
              <div class="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-12 text-center">
                <div class="text-6xl mb-4">🎭</div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">
                  هیچ نقشی یافت نشد
                </h3>
                <p class="text-slate-600 mb-6">اولین نقش خود را ایجاد کنید</p>
                <button
                  onClick={() => setShowCreate(true)}
                  class="px-6 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                >
                  ایجاد اولین نقش
                </button>
              </div>
            }
          >
            <div class="space-y-4">
              <For each={roles()}>
                {(r: any) => (
                  <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all p-6 group">
                    {/* Header */}
                    <div class="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                      <div class="flex-1">
                        <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <span class="text-2xl">🎭</span>
                          {r.Name ?? r.name}
                        </h3>
                        {r.Description ?? r.description ? (
                          <p class="text-sm text-slate-600 mt-1">
                            {r.Description ?? r.description}
                          </p>
                        ) : null}
                      </div>
                      <button
                        onClick={() => deleteRole(r.ID ?? r.id)}
                        class="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-bold flex items-center gap-2 hover:scale-105"
                      >
                        <span>🗑️</span>
                        <span class="text-sm">حذف</span>
                      </button>
                    </div>

                    {/* Permissions Section */}
                    <div class="mb-4">
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                          🔐 دسترسی‌ها
                        </span>
                        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                          {r.Permissions?.length || 0}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <Show
                          when={(r.Permissions || []).length > 0}
                          fallback={
                            <span class="text-sm text-slate-400 italic">
                              هیچ دسترسی‌ای تعریف نشده
                            </span>
                          }
                        >
                          <For each={r.Permissions || []}>
                            {(p: any) => (
                              <span class="inline-flex items-center gap-2 px-3 py-2 bg-linear-to-r from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-indigo-200 transition-all">
                                {p.Name ?? p.name}
                                <button
                                  onClick={() =>
                                    removePerm(r.ID ?? r.id, p.ID ?? p.id)
                                  }
                                  class="text-indigo-500 hover:text-red-600 font-bold transition-colors ml-1"
                                >
                                  ✕
                                </button>
                              </span>
                            )}
                          </For>
                        </Show>
                      </div>
                    </div>

                    {/* Add Permission Section */}
                    <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                      <div class="flex items-center gap-3 flex-wrap">
                        <select
                          id={`add-perm-${r.ID ?? r.id}`}
                          class="flex-1 min-w-[200px] px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium"
                        >
                          <option value="">افزودن دسترسی...</option>
                          {perms()
                            .filter(
                              (p: any) =>
                                !(r.Permissions || []).some(
                                  (rp: any) =>
                                    (rp.ID ?? rp.id) === (p.ID ?? p.id)
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
                          class="px-6 py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold"
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
            <div class="bg-linear-to-r from-purple-600 via-purple-700 to-purple-800 text-white p-6 rounded-t-2xl border-b-4 border-purple-900">
              <h3 class="text-2xl font-bold flex items-center gap-2">
                <span>➕</span>
                <span>ایجاد نقش جدید</span>
              </h3>
              <p class="text-purple-100 text-sm mt-1">
                فرم ایجاد نقش کاربری جدید
              </p>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📝</span>
                  نام نقش *
                </label>
                <input
                  type="text"
                  placeholder="مثال: مدیر"
                  value={newName()}
                  onInput={(e) => setNewName(e.currentTarget.value)}
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📋</span>
                  توضیحات
                </label>
                <textarea
                  placeholder="توضیحات نقش..."
                  value={newDesc()}
                  onInput={(e) => setNewDesc(e.currentTarget.value)}
                  rows={3}
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                />
              </div>
            </div>
            <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-purple-600 p-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={createRole}
                class="flex-1 px-6 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
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

export default Roles;
