import { Component, createSignal, onMount, For, Show, createMemo } from "solid-js";
import { categoriesApi } from "../../utils/api";

const Categories: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [newCategory, setNewCategory] = createSignal({
    name: "",
    slug: "",
    description: "",
  });
  const [editing, setEditing] = createSignal<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      setItems((res.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    const cat = newCategory();
    if (!cat.name.trim()) return alert("نام دسته‌بندی الزامی است");
    try {
      await categoriesApi.create(cat);
      setNewCategory({ name: "", slug: "", description: "" });
      setShowCreate(false);
      await load();
      alert("دسته‌بندی با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد دسته‌بندی");
    }
  };

  const startEdit = (cat: any) => {
    setEditing({
      id: cat.ID ?? cat.id,
      name: cat.Name ?? cat.name ?? "",
      slug: cat.Slug ?? cat.slug ?? "",
      description: cat.Description ?? cat.description ?? "",
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    const cat = editing();
    if (!cat || !cat.name.trim()) return alert("نام دسته‌بندی الزامی است");
    try {
      await categoriesApi.update(cat.id, {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      });
      setShowEdit(false);
      setEditing(null);
      await load();
      alert("دسته‌بندی با موفقیت به‌روزرسانی شد");
    } catch (e) {
      console.error(e);
      alert("خطا در به‌روزرسانی دسته‌بندی");
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return;
    try {
      await categoriesApi.delete(id);
      await load();
      alert("دسته‌بندی حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف دسته‌بندی");
    }
  };

  const filteredCategories = createMemo(() => {
    const q = search().trim().toLowerCase();
    if (!q) return items();
    return items().filter((cat: any) => {
      const name = String(cat.Name ?? cat.name ?? "").toLowerCase();
      const slug = String(cat.Slug ?? cat.slug ?? "").toLowerCase();
      const desc = String(cat.Description ?? cat.description ?? "").toLowerCase();
      return name.includes(q) || slug.includes(q) || desc.includes(q);
    });
  });

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت دسته‌بندی‌ها</h2>
          <p class="text-slate-600">ایجاد و مدیریت دسته‌بندی محصولات</p>
        </div>
        <div class="flex gap-3">
          <button
            onClick={() => setShowCreate(true)}
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>افزودن دسته‌بندی</span>
          </button>
          <button
            onClick={load}
            class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            🔄
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div class="relative">
          <input
            type="text"
            placeholder="جستجو در دسته‌بندی‌ها..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            class="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
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
          when={filteredCategories().length > 0}
          fallback={
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div class="text-6xl mb-4">📋</div>
              <h3 class="text-xl font-semibold text-slate-800 mb-2">
                دسته‌بندی‌ای یافت نشد
              </h3>
              <p class="text-slate-600 mb-4">هیچ دسته‌بندی‌ای وجود ندارد</p>
              <button
                onClick={() => setShowCreate(true)}
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ایجاد اولین دسته‌بندی
              </button>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={filteredCategories()}>
              {(cat: any) => (
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-slate-900 mb-1">
                        {cat.Name ?? cat.name}
                      </h3>
                      {cat.Slug ?? cat.slug ? (
                        <div class="text-sm text-slate-500 mb-2">
                          <span class="font-mono bg-slate-100 px-2 py-1 rounded">
                            {cat.Slug ?? cat.slug}
                          </span>
                        </div>
                      ) : null}
                      {cat.Description ?? cat.description ? (
                        <p class="text-sm text-slate-600 line-clamp-2">
                          {cat.Description ?? cat.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => startEdit(cat)}
                      class="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.ID ?? cat.id)}
                      class="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
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
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h3 class="text-xl font-bold">ایجاد دسته‌بندی جدید</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  نام دسته‌بندی *
                </label>
                <input
                  type="text"
                  placeholder="مثال: الکترونیک"
                  value={newCategory().name}
                  onInput={(e) =>
                    setNewCategory({ ...newCategory(), name: e.currentTarget.value })
                  }
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Slug (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثال: electronics"
                  value={newCategory().slug}
                  onInput={(e) =>
                    setNewCategory({ ...newCategory(), slug: e.currentTarget.value })
                  }
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  placeholder="توضیحات دسته‌بندی..."
                  value={newCategory().description}
                  onInput={(e) =>
                    setNewCategory({ ...newCategory(), description: e.currentTarget.value })
                  }
                  rows={3}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  onClick={createCategory}
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

      {/* Edit Modal */}
      <Show when={showEdit() && editing()}>
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEdit(false);
            setEditing(null);
          }}
        >
          <div
            class="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h3 class="text-xl font-bold">ویرایش دسته‌بندی</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  نام دسته‌بندی *
                </label>
                <input
                  type="text"
                  value={editing()?.name ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), name: e.currentTarget.value })
                  }
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={editing()?.slug ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), slug: e.currentTarget.value })
                  }
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={editing()?.description ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), description: e.currentTarget.value })
                  }
                  rows={3}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  onClick={saveEdit}
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  ذخیره
                </button>
                <button
                  onClick={() => {
                    setShowEdit(false);
                    setEditing(null);
                  }}
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

export default Categories;
