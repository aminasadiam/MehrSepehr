import { Component, createSignal, onMount, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { brandsApi } from "../../utils/api";

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
      const res = await brandsApi.getAll();
      const items = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      setBrands(items as any[]);
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || "خطا در بارگذاری برندها";
      const status = (e as any)?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  onMount(load);

  const createBrand = async () => {
    const brand = newBrand();
    if (!brand.name.trim()) return alert("نام برند الزامی است");

    try {
      await brandsApi.create(brand);
      setNewBrand({ name: "", description: "", logo: "" });
      setShowCreate(false);
      await load();
      alert("برند ایجاد شد");
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || "خطا در ایجاد برند";
      const status = (e as any)?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    }
  };

  const startEdit = (brand: any) => {
    setEditing(brand);
    setNewBrand({
      name: brand.name,
      description: brand.description || "",
      logo: brand.logo || "",
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!editing()) return;
    const edited = editing();
    const brandId = edited.id || edited.ID;

    if (!brandId) {
      alert("خطا: شناسه برند یافت نشد");
      return;
    }

    const updated = newBrand();

    try {
      await brandsApi.update(brandId, updated);
      setShowEdit(false);
      setEditing(null);
      await load();
      alert("برند بروزرسانی شد");
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || "خطا در بروزرسانی برند";
      const status = (e as any)?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    }
  };

  const deleteBrand = async (id: number | undefined) => {
    if (!id) {
      alert("خطا: شناسه برند یافت نشد");
      return;
    }
    if (!confirm("حذف برند؟")) return;

    try {
      await brandsApi.delete(id);
      await load();
      alert("برند حذف شد");
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || "خطا در حذف برند";
      const status = (e as any)?.status;
      alert(`خطا: ${errMsg}${status ? ` (HTTP ${status})` : ""}`);
    }
  };

  return (
    <div class="min-h-screen bg-linear-to-br from-slate-50 via-red-50 to-rose-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white p-8 rounded-2xl border-b-4 border-red-900 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold flex items-center gap-3">
                <span class="text-3xl">🏷️</span>
                مدیریت برندها
              </h1>
              <p class="text-red-100 mt-2">
                ایجاد و مدیریت برندها و لوگوهای سیستم
              </p>
            </div>
            <button
              class="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <span>➕</span>
              <span>برند جدید</span>
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
                  در حال بارگذاری برندها...
                </div>
              </div>
            </div>
          }
        >
          <Show
            when={brands().length > 0}
            fallback={
              <div class="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-12 text-center">
                <div class="text-6xl mb-4">🏷️</div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">
                  برندی یافت نشد
                </h3>
                <p class="text-slate-600 mb-6">هنوز برندی ایجاد نشده است</p>
                <button
                  class="px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                  onClick={() => setShowCreate(true)}
                >
                  ایجاد اولین برند
                </button>
              </div>
            }
          >
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <For each={brands()}>
                {(brand) => (
                  <div class="rounded-2xl border-2 border-slate-200 bg-white hover:border-red-300 shadow-sm hover:shadow-lg transition-all p-6 space-y-4 group">
                    <div class="flex items-center gap-4 pb-4 border-b border-slate-200">
                      <Show
                        when={brand.logo}
                        fallback={
                          <div class="h-20 w-20 bg-linear-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center text-2xl">
                            🏢
                          </div>
                        }
                      >
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          class="h-20 w-20 rounded-xl object-cover border-2 border-slate-200 group-hover:border-red-300 transition-colors"
                        />
                      </Show>
                      <div class="flex-1">
                        <p class="font-bold text-lg text-slate-900">
                          {brand.name}
                        </p>
                        <Show when={brand.description}>
                          <p class="text-sm text-slate-600 line-clamp-1 mt-1">
                            {brand.description}
                          </p>
                        </Show>
                      </div>
                    </div>

                    <div class="flex gap-3">
                      <button
                        class="flex-1 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2 text-sm"
                        onClick={() => startEdit(brand)}
                      >
                        <span>✏️</span>
                        <span>ویرایش</span>
                      </button>
                      <button
                        class="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-bold hover:scale-105"
                        onClick={() => deleteBrand(brand.id || brand.ID)}
                      >
                        <span>🗑️</span>
                      </button>
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
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white p-6 rounded-t-2xl border-b-4 border-red-900">
              <h2 class="text-2xl font-bold flex items-center gap-2">
                <span>➕</span>
                <span>برند جدید</span>
              </h2>
              <p class="text-red-100 text-sm mt-1">فرم ایجاد برند جدید</p>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📝</span>
                  نام برند *
                </label>
                <input
                  placeholder="نام برند"
                  value={newBrand().name}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), name: e.currentTarget.value })
                  }
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📋</span>
                  توضیحات
                </label>
                <textarea
                  placeholder="توضیحات برند..."
                  value={newBrand().description}
                  onInput={(e) =>
                    setNewBrand({
                      ...newBrand(),
                      description: e.currentTarget.value,
                    })
                  }
                  rows={3}
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                />
              </div>
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>🖼️</span>
                  لینک لوگو
                </label>
                <input
                  placeholder="https://..."
                  value={newBrand().logo}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), logo: e.currentTarget.value })
                  }
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
            </div>
            <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-red-600 p-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={createBrand}
                class="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
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

      {/* Edit Modal */}
      <Show when={showEdit()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white p-6 rounded-t-2xl border-b-4 border-red-900">
              <h2 class="text-2xl font-bold flex items-center gap-2">
                <span>✏️</span>
                <span>ویرایش برند</span>
              </h2>
              <p class="text-red-100 text-sm mt-1">ویرایش اطلاعات برند</p>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📝</span>
                  نام برند *
                </label>
                <input
                  placeholder="نام برند"
                  value={newBrand().name}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), name: e.currentTarget.value })
                  }
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>📋</span>
                  توضیحات
                </label>
                <textarea
                  placeholder="توضیحات برند..."
                  value={newBrand().description}
                  onInput={(e) =>
                    setNewBrand({
                      ...newBrand(),
                      description: e.currentTarget.value,
                    })
                  }
                  rows={3}
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                />
              </div>
              <div>
                <label class="flex text-xs font-bold text-slate-700 mb-2 items-center gap-2">
                  <span>🖼️</span>
                  لینک لوگو
                </label>
                <input
                  placeholder="https://..."
                  value={newBrand().logo}
                  onInput={(e) =>
                    setNewBrand({ ...newBrand(), logo: e.currentTarget.value })
                  }
                  class="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
            </div>
            <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-red-600 p-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={saveEdit}
                class="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>ذخیره</span>
              </button>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setEditing(null);
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
  );
};

export default Brands;
