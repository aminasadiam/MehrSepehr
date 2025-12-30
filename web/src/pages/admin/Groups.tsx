import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createMemo,
} from "solid-js";
import { adminApi, productsApi, usersApi } from "../../utils/api";

const Groups: Component = () => {
  const [groups, setGroups] = createSignal<any[]>([]);
  const [products, setProducts] = createSignal<any[]>([]);
  const [users, setUsers] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [editId, setEditId] = createSignal<number | null>(null);
  const [newName, setNewName] = createSignal("");
  const [newDescription, setNewDescription] = createSignal("");
  const [search, setSearch] = createSignal("");

  const filteredGroups = createMemo(() => {
    const q = search().toLowerCase();
    return groups().filter((g: any) => {
      const name = (g.Name ?? g.name ?? "").toLowerCase();
      const desc = (g.Description ?? g.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  });

  const load = async () => {
    setLoading(true);
    try {
      const [gRes, pRes, uRes] = await Promise.all([
        adminApi.groups.getAll(),
        productsApi.getAll(),
        usersApi.getAll(),
      ]);

      // Normalize groups data - ensure Products and Users arrays are present
      const normalizedGroups = (
        Array.isArray(gRes.data) ? gRes.data : gRes.data?.items ?? []
      ).map((g: any) => ({
        ...g,
        Products: g.Products || g.products || [],
        Users: g.Users || g.users || [],
      }));

      setGroups(normalizedGroups);

      setProducts(
        Array.isArray(pRes.data) ? pRes.data : pRes.data?.items ?? []
      );

      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.items ?? []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setNewName("");
    setNewDescription("");
  };

  const startEdit = (g: any) => {
    setEditId(g.ID ?? g.id);
    setNewName(g.Name ?? g.name ?? "");
    setNewDescription(g.Description ?? g.description ?? "");
    setShowCreate(true);
  };

  const createOrUpdateGroup = async () => {
    const name = newName().trim();
    if (!name) return alert("نام گروه الزامی است");
    try {
      if (editId()) {
        // Prefer update API if available, otherwise fall back to delete+create
        const groupsApi: any = adminApi.groups;
        if (typeof groupsApi.update === "function") {
          await groupsApi.update(editId()!, {
            name,
            description: newDescription().trim() || undefined,
          });
        } else {
          // fallback for older APIs that don't support update
          await groupsApi.delete(editId()!);
          await groupsApi.create({
            name,
            description: newDescription().trim() || undefined,
          });
        }
        alert("گروه به‌روز شد");
      } else {
        await adminApi.groups.create({
          name,
          description: newDescription().trim() || undefined,
        });
        alert("گروه ایجاد شد");
      }
      resetForm();
      setShowCreate(false);
      await load();
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || "خطا در عملیات گروه";
      alert(`خطا در عملیات گروه: ${errMsg}`);
    }
  };

  const deleteGroup = async (id: number) => {
    if (!confirm("آیا از حذف این گروه اطمینان دارید؟")) return;
    try {
      await adminApi.groups.delete(id);
      await load();
      alert("گروه حذف شد");
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || "خطا در حذف گروه";
      const status = (e as any)?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    }
  };

  const addProduct = async (groupId: number) => {
    const sel = document.getElementById(
      `add-prod-${groupId}`
    ) as HTMLSelectElement | null;
    if (!sel) return;
    const val = sel.value;
    if (!val) return alert("محصول را انتخاب کنید");
    try {
      await adminApi.groups.addProductToGroup(groupId, parseInt(val, 10));
      alert("محصول به گروه افزوده شد");
      await load();
      sel.value = "";
    } catch (e: any) {
      console.error(e);
      const status = e?.status;
      let errMsg = e.message || "خطا در افزودن محصول به گروه";
      if (status === 409) {
        errMsg = "این محصول قبلاً در گروه موجود است";
      }
      alert(`خطا: ${errMsg}`);
    }
  };

  const removeProduct = async (groupId: number, prodId: number) => {
    if (!confirm("آیا حذف محصول از گروه را تایید می‌کنید؟")) return;
    try {
      await adminApi.groups.removeProductFromGroup(groupId, prodId);
      alert("محصول از گروه حذف شد");
      await load();
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || "خطا در حذف محصول از گروه";
      const status = e?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    }
  };

  const addUser = async (groupId: number) => {
    const sel = document.getElementById(
      `add-user-${groupId}`
    ) as HTMLSelectElement | null;
    if (!sel) return;
    const val = sel.value;
    if (!val) return alert("کاربر را انتخاب کنید");
    try {
      await adminApi.groups.addUser(groupId, parseInt(val, 10));
      alert("کاربر به گروه افزوده شد");
      await load();
      sel.value = "";
    } catch (e: any) {
      console.error(e);
      const status = e?.status;
      let errMsg = e.message || "خطا در افزودن کاربر به گروه";
      if (status === 409) {
        errMsg = "این کاربر قبلاً در گروه موجود است";
      }
      alert(`خطا: ${errMsg}`);
    }
  };

  const removeUser = async (groupId: number, userId: number) => {
    if (!confirm("آیا حذف کاربر از گروه را تایید می‌کنید؟")) return;
    try {
      await adminApi.groups.removeUser(groupId, userId);
      alert("کاربر از گروه حذف شد");
      await load();
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || "خطا در حذف کاربر از گروه";
      const status = e?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    }
  };

  // Helper to get group products safely
  const getGroupProducts = (g: any) => g.Products || g.products || [];

  // Helper to get group users safely
  const getGroupUsers = (g: any) => g.Users || g.users || [];

  // Helper to get product ID safely
  const getProductId = (p: any) => p.ID || p.id;

  // Helper to get product name safely
  const getProductName = (p: any) => p.Name || p.name;

  // Helper to get user ID safely
  const getUserId = (u: any) => u.ID || u.id;

  // Helper to get user username safely
  const getUsername = (u: any) => u.Username || u.username;

  onMount(load);

  return (
    <div
      dir="rtl"
      class="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-sky-50"
    >
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-8 rounded-2xl border-b-4 border-blue-900 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold flex items-center gap-3">
                <span class="text-3xl">👥</span>
                مدیریت گروه‌های کاربری
              </h1>
              <p class="text-blue-100 mt-2">
                ایجاد و مدیریت گروه‌ها، محصولات و کاربران
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreate(true);
              }}
              class="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-2"
            >
              <span>➕</span>
              <span>افزودن گروه جدید</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div class="mb-8 flex items-center gap-4">
          <div class="relative flex-1 max-w-md">
            <span class="absolute left-4 top-3 text-2xl">🔍</span>
            <input
              type="text"
              placeholder="جستجو برای نام یا توضیح گروه..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
            />
          </div>
          <span class="text-sm font-medium text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
            {filteredGroups().length} گروه
          </span>
        </div>

        <Show
          when={!loading()}
          fallback={
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="text-5xl mb-4 animate-spin">⏳</div>
                <div class="text-lg text-slate-600">
                  در حال بارگذاری گروه‌ها...
                </div>
              </div>
            </div>
          }
        >
          <Show
            when={filteredGroups().length > 0}
            fallback={
              <div class="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-12 text-center">
                <div class="text-6xl mb-4">👥</div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">
                  گروهی یافت نشد
                </h3>
                <p class="text-slate-600 mb-6">
                  هنوز گروهی ایجاد نشده است. برای شروع، یک گروه جدید ایجاد کنید.
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreate(true);
                  }}
                  class="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                >
                  ایجاد اولین گروه
                </button>
              </div>
            }
          >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <For each={filteredGroups()}>
                {(g: any) => (
                  <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                    {/* Header */}
                    <div class="bg-linear-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 p-5">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                          <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span class="text-2xl">🏷️</span>
                            {g.Name ?? g.name}
                          </h3>
                          {g.Description ? (
                            <p class="text-sm text-slate-600 mt-2">
                              {g.Description ?? g.description}
                            </p>
                          ) : null}
                        </div>
                        <div class="flex gap-2">
                          <button
                            onClick={() => startEdit(g)}
                            class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all font-bold flex items-center gap-1"
                            title="ویرایش"
                          >
                            <span>✏️</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGroup(Number(g.ID ?? g.id))}
                            class="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-bold hover:scale-105"
                            title="حذف"
                          >
                            <span>🗑️</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div class="grid grid-cols-2 gap-3 p-4 border-b border-slate-200">
                      <div class="text-center p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div class="text-3xl font-bold text-blue-600">
                          {getGroupProducts(g).length}
                        </div>
                        <div class="text-xs text-slate-600 font-bold uppercase mt-1">
                          محصول
                        </div>
                      </div>
                      <div class="text-center p-3 bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div class="text-3xl font-bold text-green-600">
                          {getGroupUsers(g).length}
                        </div>
                        <div class="text-xs text-slate-600 font-bold uppercase mt-1">
                          کاربر
                        </div>
                      </div>
                    </div>

                    <div class="p-5 space-y-5">
                      {/* Products Section */}
                      <div>
                        <div class="flex items-center gap-2 mb-3">
                          <span class="text-lg">📦</span>
                          <h4 class="font-bold text-slate-900 uppercase tracking-wide text-sm">
                            محصولات
                          </h4>
                          <span class="ml-auto px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {getGroupProducts(g).length}
                          </span>
                        </div>
                        <div class="space-y-2">
                          <Show
                            when={getGroupProducts(g).length > 0}
                            fallback={
                              <div class="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                هیچ محصولی اختصاص داده نشده
                              </div>
                            }
                          >
                            <div class="max-h-40 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <For each={getGroupProducts(g)}>
                                {(p: any) => (
                                  <div class="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm group hover:bg-blue-50 transition-colors border border-slate-200 hover:border-blue-300">
                                    <span class="text-slate-700 font-medium">
                                      {getProductName(p)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        removeProduct(
                                          g.ID ?? g.id,
                                          getProductId(p)
                                        )
                                      }
                                      class="text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 font-bold transition-colors"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </For>
                            </div>
                          </Show>
                        </div>
                        <div class="flex gap-2 mt-3">
                          <select
                            id={`add-prod-${g.ID ?? g.id}`}
                            class="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white font-medium"
                          >
                            <option value="">انتخاب محصول...</option>
                            {products()
                              .filter(
                                (p: any) =>
                                  !getGroupProducts(g).some(
                                    (gp: any) =>
                                      getProductId(gp) === getProductId(p)
                                  )
                              )
                              .map((p: any) => (
                                <option value={getProductId(p)}>
                                  {getProductName(p)}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => addProduct(g.ID ?? g.id)}
                            class="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-bold hover:scale-105"
                          >
                            ➕
                          </button>
                        </div>
                      </div>

                      {/* Users Section */}
                      <div class="border-t border-slate-200 pt-5">
                        <div class="flex items-center gap-2 mb-3">
                          <span class="text-lg">👤</span>
                          <h4 class="font-bold text-slate-900 uppercase tracking-wide text-sm">
                            کاربران
                          </h4>
                          <span class="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {getGroupUsers(g).length}
                          </span>
                        </div>
                        <div class="space-y-2">
                          <Show
                            when={getGroupUsers(g).length > 0}
                            fallback={
                              <div class="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                هیچ کاربری اختصاص داده نشده
                              </div>
                            }
                          >
                            <div class="max-h-40 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <For each={getGroupUsers(g)}>
                                {(u: any) => (
                                  <div class="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm group hover:bg-green-50 transition-colors border border-slate-200 hover:border-green-300">
                                    <div class="flex items-center gap-2">
                                      <span class="text-lg">👤</span>
                                      <span class="text-slate-700 font-medium">
                                        {getUsername(u)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        removeUser(g.ID ?? g.id, getUserId(u))
                                      }
                                      class="text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 font-bold transition-colors"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </For>
                            </div>
                          </Show>
                        </div>
                        <div class="flex gap-2 mt-3">
                          <select
                            id={`add-user-${g.ID ?? g.id}`}
                            class="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white font-medium"
                          >
                            <option value="">انتخاب کاربر...</option>
                            {users()
                              .filter(
                                (u: any) =>
                                  !getGroupUsers(g).some(
                                    (gu: any) => getUserId(gu) === getUserId(u)
                                  )
                              )
                              .map((u: any) => (
                                <option value={getUserId(u)}>
                                  {getUsername(u)}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => addUser(g.ID ?? g.id)}
                            class="px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-bold hover:scale-105"
                          >
                            ➕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>

        {/* Create/Edit Modal */}
        <Show when={showCreate()}>
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreate(false);
              resetForm();
            }}
          >
            <div
              class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div class="bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-6 rounded-t-2xl border-b-4 border-blue-900 flex items-center justify-between">
                <h3 class="text-2xl font-bold flex items-center gap-2">
                  <span class="text-2xl">👥</span>
                  {editId() ? "ویرایش گروه" : "ایجاد گروه جدید"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  class="text-white hover:bg-white/20 p-1 rounded transition-colors font-bold text-xl"
                >
                  ✕
                </button>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                    <span>🏷️</span>
                    نام گروه *
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: VIP, دانشجویان, عمده‌فروشان"
                    value={newName()}
                    onInput={(e) => setNewName(e.currentTarget.value)}
                    class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div>
                  <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                    <span>📝</span>
                    توضیحات
                  </label>
                  <textarea
                    placeholder="توضیحات این گروه..."
                    value={newDescription()}
                    onInput={(e) => setNewDescription(e.currentTarget.value)}
                    rows={3}
                    class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  />
                </div>
              </div>
              <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-blue-600 p-4 flex gap-3 rounded-b-2xl">
                <button
                  onClick={createOrUpdateGroup}
                  class="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>{editId() ? "ذخیره" : "ایجاد"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
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
    </div>
  );
};

export default Groups;
