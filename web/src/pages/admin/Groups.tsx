import { Component, createSignal, onMount, For, Show } from "solid-js";
import { adminApi, productsApi, usersApi } from "../../utils/api";

const Groups: Component = () => {
  const [groups, setGroups] = createSignal<any[]>([]);
  const [products, setProducts] = createSignal<any[]>([]);
  const [users, setUsers] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [newName, setNewName] = createSignal("");

  const load = async () => {
    setLoading(true);
    try {
      const [gRes, pRes, uRes] = await Promise.all([
        adminApi.getGroups(),
        productsApi.getAll(),
        usersApi.getAll(),
      ]);
      setGroups((gRes.data as any) || []);
      setProducts((pRes.data as any) || []);
      setUsers((uRes.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    const name = newName().trim();
    if (!name) return alert("نام گروه را وارد کنید");
    try {
      await adminApi.createGroup({ name });
      setNewName("");
      setShowCreate(false);
      await load();
      alert("گروه با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد گروه");
    }
  };

  const deleteGroup = async (id: number) => {
    if (!confirm("آیا از حذف این گروه اطمینان دارید؟")) return;
    try {
      await adminApi.deleteGroup(id);
      await load();
      alert("گروه حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف گروه");
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
      await adminApi.addProductToGroup(groupId, parseInt(val, 10));
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در افزودن محصول به گروه");
    }
  };

  const removeProduct = async (groupId: number, prodId: number) => {
    if (!confirm("آیا حذف محصول از گروه را تایید می‌کنید؟")) return;
    try {
      await adminApi.removeProductFromGroup(groupId, prodId);
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در حذف محصول از گروه");
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
      await adminApi.addUserToGroup(groupId, parseInt(val, 10));
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در افزودن کاربر به گروه");
    }
  };

  const removeUser = async (groupId: number, userId: number) => {
    if (!confirm("آیا حذف کاربر از گروه را تایید می‌کنید؟")) return;
    try {
      await adminApi.removeUserFromGroup(groupId, userId);
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در حذف کاربر از گروه");
    }
  };

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت گروه‌ها</h2>
          <p class="text-slate-600">ایجاد گروه‌ها و مدیریت دسترسی محصولات</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>افزودن گروه</span>
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
        <div class="space-y-6">
          <For each={groups()}>
            {(g: any) => (
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold text-slate-900 mb-1">
                      {g.Name ?? g.name}
                    </h3>
                    {g.Description ? (
                      <p class="text-sm text-slate-600">{g.Description ?? g.description}</p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => deleteGroup(g.ID ?? g.id)}
                    class="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    حذف گروه
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Products Section */}
                  <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-semibold mb-3 text-slate-900">محصولات گروه</h4>
                    <div class="space-y-2 mb-3">
                      <Show
                        when={(g.Products || []).length > 0}
                        fallback={
                          <div class="text-sm text-slate-400 text-center py-4">
                            هیچ محصولی ندارد
                          </div>
                        }
                      >
                        <For each={g.Products || []}>
                          {(p: any) => (
                            <div class="flex items-center justify-between bg-white rounded px-3 py-2">
                              <span class="text-sm">{p.Name ?? p.name}</span>
                              <button
                                onClick={() => removeProduct(g.ID ?? g.id, p.ID ?? p.id)}
                                class="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </For>
                      </Show>
                    </div>
                    <div class="flex items-center gap-2">
                      <select
                        id={`add-prod-${g.ID ?? g.id}`}
                        class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">افزودن محصول...</option>
                        {products()
                          .filter(
                            (p: any) =>
                              !(g.Products || []).some(
                                (gp: any) => (gp.ID ?? gp.id) === (p.ID ?? p.id)
                              )
                          )
                          .map((p: any) => (
                            <option value={p.ID ?? p.id}>{p.Name ?? p.name}</option>
                          ))}
                      </select>
                      <button
                        onClick={() => addProduct(g.ID ?? g.id)}
                        class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        افزودن
                      </button>
                    </div>
                  </div>

                  {/* Users Section */}
                  <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-semibold mb-3 text-slate-900">کاربران گروه</h4>
                    <div class="space-y-2 mb-3">
                      <Show
                        when={(g.Users || []).length > 0}
                        fallback={
                          <div class="text-sm text-slate-400 text-center py-4">
                            هیچ کاربری ندارد
                          </div>
                        }
                      >
                        <For each={g.Users || []}>
                          {(u: any) => (
                            <div class="flex items-center justify-between bg-white rounded px-3 py-2">
                              <span class="text-sm">{u.Username ?? u.username}</span>
                              <button
                                onClick={() => removeUser(g.ID ?? g.id, u.ID ?? u.id)}
                                class="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </For>
                      </Show>
                    </div>
                    <div class="flex items-center gap-2">
                      <select
                        id={`add-user-${g.ID ?? g.id}`}
                        class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">افزودن کاربر...</option>
                        {users()
                          .filter(
                            (u: any) =>
                              !(g.Users || []).some(
                                (gu: any) => (gu.ID ?? gu.id) === (u.ID ?? u.id)
                              )
                          )
                          .map((u: any) => (
                            <option value={u.ID ?? u.id}>
                              {u.Username ?? u.username}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => addUser(g.ID ?? g.id)}
                        class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        افزودن
                      </button>
                    </div>
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
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h3 class="text-xl font-bold">ایجاد گروه جدید</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">نام گروه *</label>
                <input
                  type="text"
                  placeholder="مثال: VIP"
                  value={newName()}
                  onInput={(e) => setNewName(e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  onClick={createGroup}
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

export default Groups;
