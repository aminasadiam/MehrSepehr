import { Component, createSignal, onMount, For, Show } from "solid-js";
import { adminApi } from "../../utils/api";

const Brands: Component = () => {
  const [brands, setBrands] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [newBrand, setNewBrand] = createSignal({
    name: "",
    description: "",
    logo: "",
  });
  const [editing, setEditing] = createSignal<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBrands();
      setBrands((res.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری برندها");
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async () => {
    const brand = newBrand();
    if (!brand.name.trim()) return alert("نام برند الزامی است");
    try {
      await adminApi.createBrand(brand);
      setNewBrand({ name: "", description: "", logo: "" });
      setShowCreate(false);
      await load();
      alert("برند با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد برند");
    }
  };

  const startEdit = (brand: any) => {
    setEditing({
      id: brand.ID ?? brand.id,
      name: brand.Name ?? brand.name ?? "",
      description: brand.Description ?? brand.description ?? "",
      logo: brand.Logo ?? brand.logo ?? "",
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    const brand = editing();
    if (!brand || !brand.name.trim()) return alert("نام برند الزامی است");
    try {
      await adminApi.updateBrand(brand.id, {
        name: brand.name,
        description: brand.description,
        logo: brand.logo,
      });
      setShowEdit(false);
      setEditing(null);
      await load();
      alert("برند با موفقیت به‌روزرسانی شد");
    } catch (e) {
      console.error(e);
      alert("خطا در به‌روزرسانی برند");
    }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm("آیا از حذف این برند مطمئن هستید؟")) return;
    try {
      await adminApi.deleteBrand(id);
      await load();
      alert("برند حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف برند");
    }
  };

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت برندها</h2>
          <p class="text-slate-600">ایجاد و مدیریت برندهای محصولات</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>افزودن برند</span>
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
          when={brands().length > 0}
          fallback={
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div class="text-6xl mb-4">🏷️</div>
              <h3 class="text-xl font-semibold text-slate-800 mb-2">برندی یافت نشد</h3>
              <p class="text-slate-600 mb-4">هیچ برندی وجود ندارد</p>
              <button
                onClick={() => setShowCreate(true)}
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ایجاد اولین برند
              </button>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={brands()}>
              {(brand: any) => (
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      {brand.Logo ?? brand.logo ? (
                        <img
                          src={brand.Logo ?? brand.logo}
                          alt={brand.Name ?? brand.name}
                          class="w-16 h-16 object-contain mb-3"
                        />
                      ) : null}
                      <h3 class="text-lg font-semibold text-slate-900 mb-1">
                        {brand.Name ?? brand.name}
                      </h3>
                      {brand.Description ?? brand.description ? (
                        <p class="text-sm text-slate-600 line-clamp-2">
                          {brand.Description ?? brand.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => startEdit(brand)}
                      class="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteBrand(brand.ID ?? brand.id)}
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
              <h3 class="text-xl font-bold">ایجاد برند جدید</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">نام برند *</label>
                <input
                  type="text"
                  placeholder="مثال: سامسونگ"
                  value={newBrand().name}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), name: e.currentTarget.value })
                  }
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">توضیحات</label>
                <textarea
                  placeholder="توضیحات برند..."
                  value={newBrand().description}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), description: e.currentTarget.value })
                  }
                  rows={3}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">لوگو (URL)</label>
                <input
                  type="text"
                  placeholder="آدرس تصویر لوگو"
                  value={newBrand().logo}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), logo: e.currentTarget.value })
                  }
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button
                  onClick={createBrand}
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
              <h3 class="text-xl font-bold">ویرایش برند</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">نام برند *</label>
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
                <label class="block text-sm font-medium text-slate-700 mb-2">توضیحات</label>
                <textarea
                  value={editing()?.description ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), description: e.currentTarget.value })
                  }
                  rows={3}
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">لوگو (URL)</label>
                <input
                  type="text"
                  value={editing()?.logo ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), logo: e.currentTarget.value })
                  }
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

export default Brands;

