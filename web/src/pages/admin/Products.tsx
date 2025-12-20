import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createMemo,
} from "solid-js";
import { productsApi, categoriesApi, adminApi } from "../../utils/api";
import { A } from "@solidjs/router";

const Products: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const [categories, setCategories] = createSignal<any[]>([]);
  const [groups, setGroups] = createSignal<any[]>([]);
  const [brands, setBrands] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [categoryFilter, setCategoryFilter] = createSignal<number | null>(null);
  const [showCreate, setShowCreate] = createSignal(false);
  const [editId, setEditId] = createSignal<number | null>(null);
  const [formData, setFormData] = createSignal({
    name: "",
    description: "",
    sku: "",
    price: "",
    stock: "",
    model_number: "",
    warranty: "",
    weight: "",
    dimensions: "",
    power: "",
    material: "",
    capacity: "",
    features: "",
    is_active: true,
    category_id: null as number | null,
    brand_id: null as number | null,
    groups: [] as number[],
    images: [] as any[], // Will contain { file?: File, url?: string, alt: string, is_primary: boolean, order: number }
    sizes: [] as any[],
    colors: [] as any[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, gRes, bRes] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
        adminApi.getGroups(),
        adminApi.getBrands(),
      ]);
      setItems((pRes.data as any) || []);
      setCategories((cRes.data as any) || []);
      setGroups((gRes.data as any) || []);
      setBrands((bRes.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      price: "",
      stock: "",
      model_number: "",
      warranty: "",
      weight: "",
      dimensions: "",
      power: "",
      material: "",
      capacity: "",
      features: "",
      is_active: true,
      category_id: null,
      brand_id: null,
      groups: [],
      images: [],
      sizes: [],
      colors: [],
    });
  };

  const startEdit = (p: any) => {
    setEditId(p.ID ?? p.id);
    setFormData({
      name: p.Name ?? p.name ?? "",
      description: p.Description ?? p.description ?? "",
      sku: p.SKU ?? p.sku ?? "",
      price: String(p.Price ?? p.price ?? 0),
      stock: String(p.Stock ?? p.stock ?? 0),
      model_number: p.ModelNumber ?? p.model_number ?? "",
      warranty: p.Warranty ?? p.warranty ?? "",
      weight: p.Weight ? String(p.Weight) : p.weight ? String(p.weight) : "",
      dimensions: p.Dimensions ?? p.dimensions ?? "",
      power: p.Power ?? p.power ?? "",
      material: p.Material ?? p.material ?? "",
      capacity: p.Capacity ?? p.capacity ?? "",
      features: p.Features ?? p.features ?? "",
      is_active: p.IsActive ?? p.is_active ?? true,
      category_id: p.CategoryID ?? p.category_id ?? null,
      brand_id: p.BrandID ?? p.brand_id ?? null,
      groups: (p.Groups || []).map((g: any) => g.ID ?? g.id),
      images: (p.Images || []).map((img: any) => ({
        file: null,
        url: img.URL ?? img.url,
        alt: img.Alt ?? img.alt ?? "",
        is_primary: img.IsPrimary ?? img.is_primary ?? false,
        order: img.Order ?? img.order ?? 0,
        preview: img.URL ?? img.url,
      })),
      sizes: (p.Sizes || []).map((s: any) => ({
        name: s.Name ?? s.name ?? "",
        stock: s.Stock ?? s.stock ?? 0,
        price: s.Price ?? s.price ?? 0,
      })),
      colors: (p.Colors || []).map((c: any) => ({
        name: c.Name ?? c.name ?? "",
        hex_code: c.HexCode ?? c.hex_code ?? "",
        stock: c.Stock ?? c.stock ?? 0,
      })),
    });
    setShowCreate(true);
  };

  const addImage = () => {
    setFormData({
      ...formData(),
      images: [
        ...formData().images,
        {
          file: null,
          url: "",
          alt: "",
          is_primary: false,
          order: formData().images.length,
          preview: null,
        },
      ],
    });
  };

  // Allow selecting multiple files at once; first replaces current slot, others append
  const handleImageFilesChange = (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const images = [...formData().images];

    Array.from(files).forEach((file, idx) => {
      const targetIndex = idx === 0 ? index : images.length;
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const base =
          targetIndex < images.length
            ? images[targetIndex]
            : { alt: "", is_primary: false };

        const nextImage = {
          ...base,
          file,
          url: "", // will be set after upload
          preview,
        };

        if (targetIndex < images.length) {
          images[targetIndex] = nextImage;
        } else {
          images.push({ ...nextImage, order: images.length });
        }

        // normalize order
        const ordered = images.map((img, i) => ({ ...img, order: i }));
        setFormData({ ...formData(), images: ordered });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const images = formData().images.filter((_, i) => i !== index);
    setFormData({ ...formData(), images });
  };

  const addSize = () => {
    setFormData({
      ...formData(),
      sizes: [...formData().sizes, { name: "", stock: 0, price: "" }],
    });
  };

  const removeSize = (index: number) => {
    const sizes = formData().sizes.filter((_, i) => i !== index);
    setFormData({ ...formData(), sizes });
  };

  const addColor = () => {
    setFormData({
      ...formData(),
      colors: [...formData().colors, { name: "", hex_code: "", stock: 0 }],
    });
  };

  const removeColor = (index: number) => {
    const colors = formData().colors.filter((_, i) => i !== index);
    setFormData({ ...formData(), colors });
  };

  const submit = async () => {
    const data = formData();
    if (!data.name.trim() || !data.sku.trim()) {
      return alert("نام و SKU محصول الزامی است");
    }
    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: Number(data.price || 0),
        stock: Number(data.stock || 0),
        model_number: data.model_number,
        warranty: data.warranty,
        weight: data.weight ? Number(data.weight) : null,
        dimensions: data.dimensions,
        power: data.power,
        material: data.material,
        capacity: data.capacity,
        features: data.features,
        is_active: data.is_active,
      };
      if (data.category_id) payload.category_id = data.category_id;
      if (data.brand_id) payload.brand_id = data.brand_id;
      payload.sizes = data.sizes.filter((s) => s.name.trim());
      payload.colors = data.colors.filter((c) => c.name.trim());

      let productId: number;

      // For new products, create first then upload images
      if (!editId()) {
        payload.images = []; // No images in initial create
        const createRes = await productsApi.create(payload);
        productId = (createRes.data as any)?.ID ?? (createRes.data as any)?.id;
        if (!productId) {
          alert("خطا در دریافت شناسه محصول");
          return;
        }

        // Upload all images for new product
        const imagesToUpload = data.images.filter((img) => img.file);
        for (let i = 0; i < imagesToUpload.length; i++) {
          const img = imagesToUpload[i];
          try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", img.file!);
            uploadFormData.append("alt", img.alt || "");
            uploadFormData.append(
              "is_primary",
              img.is_primary ? "true" : "false"
            );
            uploadFormData.append("order", String(img.order || i));
            await productsApi.uploadImage(productId, uploadFormData);
          } catch (e) {
            console.error("Error uploading image:", e);
            alert(`خطا در بارگذاری تصویر ${i + 1}`);
          }
        }
        alert("محصول جدید ایجاد شد");
      } else {
        // For existing products, upload new files first, then update with all image URLs
        productId = editId()!;
        const uploadedImageUrls: string[] = [];

        // Upload new images first
        const imagesToUpload = data.images.filter(
          (img) => img.file && !img.url
        );
        for (let i = 0; i < imagesToUpload.length; i++) {
          const img = imagesToUpload[i];
          try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", img.file!);
            uploadFormData.append("alt", img.alt || "");
            uploadFormData.append(
              "is_primary",
              img.is_primary ? "true" : "false"
            );
            uploadFormData.append("order", String(img.order || i));
            const uploadRes = await productsApi.uploadImage(
              productId,
              uploadFormData
            );
            const uploadedUrl =
              (uploadRes.data as any)?.url || (uploadRes.data as any)?.URL;
            if (uploadedUrl) uploadedImageUrls.push(uploadedUrl);
          } catch (e) {
            console.error("Error uploading image:", e);
            alert(`خطا در بارگذاری تصویر ${i + 1}`);
          }
        }

        // Build images array: existing URLs + newly uploaded URLs
        let uploadedIndex = 0;
        payload.images = data.images
          .filter((img) => img.url?.trim() || img.file)
          .map((img) => {
            // If it's a new upload, use the uploaded URL
            if (img.file && !img.url && uploadedImageUrls[uploadedIndex]) {
              const url = uploadedImageUrls[uploadedIndex++];
              return {
                url: url,
                alt: img.alt || "",
                is_primary: img.is_primary || false,
                order: img.order || 0,
              };
            }
            // Otherwise use existing URL
            return {
              url: img.url || "",
              alt: img.alt || "",
              is_primary: img.is_primary || false,
              order: img.order || 0,
            };
          });

        await productsApi.update(productId, payload);
        alert("محصول با موفقیت به‌روزرسانی شد");
      }

      // Handle groups
      const existingGroups =
        items()
          .find((p: any) => (p.ID ?? p.id) === productId)
          ?.Groups?.map((g: any) => g.ID ?? g.id) || [];

      for (const gid of existingGroups) {
        try {
          await adminApi.removeProductFromGroup(gid, productId);
        } catch {}
      }

      for (const gid of data.groups) {
        try {
          await adminApi.addProductToGroup(gid, productId);
        } catch {}
      }

      resetForm();
      setShowCreate(false);
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در ثبت محصول");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    try {
      await productsApi.delete(id);
      await load();
      alert("محصول حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف محصول");
    }
  };

  const filteredProducts = createMemo(() => {
    let filtered = items();
    const q = search().trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((p: any) => {
        const name = String(p.Name ?? p.name ?? "").toLowerCase();
        const sku = String(p.SKU ?? p.sku ?? "").toLowerCase();
        return name.includes(q) || sku.includes(q);
      });
    }
    if (categoryFilter()) {
      filtered = filtered.filter(
        (p: any) => (p.CategoryID ?? p.category_id) === categoryFilter()
      );
    }
    return filtered;
  });

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت محصولات</h2>
          <p class="text-slate-600">ایجاد، ویرایش و حذف محصولات</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>افزودن محصول</span>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <input
              type="text"
              placeholder="جستجو در محصولات..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
          <select
            value={categoryFilter() ?? ""}
            onInput={(e) =>
              setCategoryFilter(
                e.currentTarget.value ? Number(e.currentTarget.value) : null
              )
            }
            class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            <For each={categories()}>
              {(cat: any) => (
                <option value={cat.ID ?? cat.id}>{cat.Name ?? cat.name}</option>
              )}
            </For>
          </select>
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
          when={filteredProducts().length > 0}
          fallback={
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div class="text-6xl mb-4">📦</div>
              <h3 class="text-xl font-semibold text-slate-800 mb-2">
                محصولی یافت نشد
              </h3>
              <p class="text-slate-600 mb-4">
                هیچ محصولی با این فیلترها وجود ندارد
              </p>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={filteredProducts()}>
              {(p: any) => (
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div class="mb-3">
                    {p.Images && p.Images.length > 0 ? (
                      <img
                        src={p.Images[0]?.URL ?? p.Images[0]?.url}
                        alt={
                          p.Images[0]?.Alt ??
                          p.Images[0]?.alt ??
                          p.Name ??
                          p.name
                        }
                        class="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div class="w-full h-48 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400">
                        بدون تصویر
                      </div>
                    )}
                    <h3 class="text-lg font-semibold text-slate-900 mb-1">
                      {p.Name ?? p.name}
                    </h3>
                    <div class="text-sm text-slate-500 mb-2">
                      SKU: <span class="font-mono">{p.SKU ?? p.sku}</span>
                    </div>
                    {p.Brand ? (
                      <div class="text-xs mb-2">
                        <span class="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                          {p.Brand.Name ?? p.Brand.name}
                        </span>
                      </div>
                    ) : null}
                    {p.Category ? (
                      <div class="text-xs mb-2">
                        <span class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                          {p.Category.Name ?? p.Category.name}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div class="flex items-center justify-between mb-4 pt-4 border-t border-slate-200">
                    <div>
                      <div class="text-lg font-bold text-indigo-600">
                        {Number(p.Price ?? p.price ?? 0).toLocaleString()} تومان
                      </div>
                      <div class="text-sm text-slate-500">
                        موجودی: {p.Stock ?? p.stock ?? 0}
                      </div>
                    </div>
                  </div>
                  {p.Sizes && p.Sizes.length > 0 ? (
                    <div class="mb-2 text-xs text-slate-600">
                      اندازه‌ها: {p.Sizes.length}
                    </div>
                  ) : null}
                  {p.Colors && p.Colors.length > 0 ? (
                    <div class="mb-2 text-xs text-slate-600">
                      رنگ‌ها: {p.Colors.length}
                    </div>
                  ) : null}
                  <div class="flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      class="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => remove(p.ID ?? p.id)}
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

      {/* Create/Edit Modal - This will be very large, so I'll create it in parts */}
      <Show when={showCreate()}>
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => {
            setShowCreate(false);
            resetForm();
          }}
        >
          <div
            class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div class="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h3 class="text-xl font-bold">
                {editId() ? "ویرایش محصول" : "ایجاد محصول جدید"}
              </h3>
            </div>
            <div class="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 class="text-lg font-semibold mb-4">اطلاعات پایه</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      نام محصول *
                    </label>
                    <input
                      type="text"
                      placeholder="نام محصول"
                      value={formData().name}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          name: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      placeholder="کد محصول"
                      value={formData().sku}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          sku: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      قیمت
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData().price}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          price: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      موجودی
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData().stock}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          stock: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      دسته‌بندی
                    </label>
                    <select
                      value={formData().category_id ?? ""}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          category_id: e.currentTarget.value
                            ? Number(e.currentTarget.value)
                            : null,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">بدون دسته‌بندی</option>
                      <For each={categories()}>
                        {(cat: any) => (
                          <option value={cat.ID ?? cat.id}>
                            {cat.Name ?? cat.name}
                          </option>
                        )}
                      </For>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      برند
                    </label>
                    <select
                      value={formData().brand_id ?? ""}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          brand_id: e.currentTarget.value
                            ? Number(e.currentTarget.value)
                            : null,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">بدون برند</option>
                      <For each={brands()}>
                        {(brand: any) => (
                          <option value={brand.ID ?? brand.id}>
                            {brand.Name ?? brand.name}
                          </option>
                        )}
                      </For>
                    </select>
                  </div>
                </div>
                <div class="mt-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    توضیحات
                  </label>
                  <textarea
                    placeholder="توضیحات محصول..."
                    value={formData().description}
                    onInput={(e) =>
                      setFormData({
                        ...formData(),
                        description: e.currentTarget.value,
                      })
                    }
                    rows={3}
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Additional Fields */}
              <div>
                <h4 class="text-lg font-semibold mb-4">اطلاعات تکمیلی</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      شماره مدل
                    </label>
                    <input
                      type="text"
                      value={formData().model_number}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          model_number: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      گارانتی
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 2 سال"
                      value={formData().warranty}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          warranty: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      وزن (کیلوگرم)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData().weight}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          weight: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      ابعاد
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 30x40x50 سانتی‌متر"
                      value={formData().dimensions}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          dimensions: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      قدرت
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 1000W"
                      value={formData().power}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          power: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      جنس
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: استیل ضد زنگ"
                      value={formData().material}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          material: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      ظرفیت
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 5 لیتر"
                      value={formData().capacity}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          capacity: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      ویژگی‌ها
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: دیجیتال، تایمر، ضد چکه"
                      value={formData().features}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          features: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div class="mt-4">
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData().is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData(),
                          is_active: e.currentTarget.checked,
                        })
                      }
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-sm font-medium text-slate-700">فعال</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-semibold">تصاویر</h4>
                  <button
                    onClick={addImage}
                    class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                  >
                    + افزودن تصویر
                  </button>
                </div>
                <div class="space-y-3">
                  <For each={formData().images}>
                    {(img, index) => (
                      <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div class="flex gap-4 items-start">
                          {/* Image Preview */}
                          <div class="shrink-0">
                            {img.preview || img.url ? (
                              <img
                                src={img.preview || img.url}
                                alt={img.alt || "Preview"}
                                class="w-24 h-24 object-cover rounded-lg border border-slate-300"
                              />
                            ) : (
                              <div class="w-24 h-24 bg-slate-200 rounded-lg border border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                                بدون تصویر
                              </div>
                            )}
                          </div>

                          {/* File Input */}
                          <div class="flex-1 space-y-2">
                            <div>
                              <label class="block text-xs font-medium text-slate-700 mb-1">
                                انتخاب تصویر
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  handleImageFilesChange(
                                    index(),
                                    e.currentTarget.files
                                  );
                                  // reset input so selecting same files again works
                                  e.currentTarget.value = "";
                                }}
                                class="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                              />
                            </div>
                            <div>
                              <label class="block text-xs font-medium text-slate-700 mb-1">
                                متن جایگزین (Alt)
                              </label>
                              <input
                                type="text"
                                placeholder="توضیحات تصویر"
                                value={img.alt || ""}
                                onInput={(e) => {
                                  const images = [...formData().images];
                                  images[index()].alt = e.currentTarget.value;
                                  setFormData({ ...formData(), images });
                                }}
                                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              />
                            </div>
                            <div class="flex items-center gap-4">
                              <label class="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={img.is_primary || false}
                                  onChange={(e) => {
                                    const images = formData().images.map(
                                      (im, i) =>
                                        i === index()
                                          ? {
                                              ...im,
                                              is_primary:
                                                e.currentTarget.checked,
                                            }
                                          : { ...im, is_primary: false }
                                    );
                                    setFormData({ ...formData(), images });
                                  }}
                                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>تصویر اصلی</span>
                              </label>
                              <button
                                onClick={() => removeImage(index())}
                                class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-semibold">اندازه‌ها</h4>
                  <button
                    onClick={addSize}
                    class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                  >
                    + افزودن اندازه
                  </button>
                </div>
                <div class="space-y-3">
                  <For each={formData().sizes}>
                    {(size, index) => (
                      <div class="flex gap-3 p-3 bg-slate-50 rounded-lg">
                        <input
                          type="text"
                          placeholder="نام اندازه"
                          value={size.name}
                          onInput={(e) => {
                            const sizes = [...formData().sizes];
                            sizes[index()].name = e.currentTarget.value;
                            setFormData({ ...formData(), sizes });
                          }}
                          class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="موجودی"
                          value={size.stock}
                          onInput={(e) => {
                            const sizes = [...formData().sizes];
                            sizes[index()].stock = Number(
                              e.currentTarget.value
                            );
                            setFormData({ ...formData(), sizes });
                          }}
                          class="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="قیمت (اختیاری)"
                          value={size.price}
                          onInput={(e) => {
                            const sizes = [...formData().sizes];
                            sizes[index()].price = e.currentTarget.value;
                            setFormData({ ...formData(), sizes });
                          }}
                          class="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeSize(index())}
                          class="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Colors */}
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-semibold">رنگ‌ها</h4>
                  <button
                    onClick={addColor}
                    class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                  >
                    + افزودن رنگ
                  </button>
                </div>
                <div class="space-y-3">
                  <For each={formData().colors}>
                    {(color, index) => (
                      <div class="flex gap-3 p-3 bg-slate-50 rounded-lg items-center">
                        <input
                          type="text"
                          placeholder="نام رنگ"
                          value={color.name}
                          onInput={(e) => {
                            const colors = [...formData().colors];
                            colors[index()].name = e.currentTarget.value;
                            setFormData({ ...formData(), colors });
                          }}
                          class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="کد رنگ (#hex)"
                          value={color.hex_code}
                          onInput={(e) => {
                            const colors = [...formData().colors];
                            colors[index()].hex_code = e.currentTarget.value;
                            setFormData({ ...formData(), colors });
                          }}
                          class="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        {color.hex_code ? (
                          <div
                            class="w-8 h-8 rounded border border-slate-300"
                            style={{ "background-color": color.hex_code }}
                          />
                        ) : null}
                        <input
                          type="number"
                          placeholder="موجودی"
                          value={color.stock}
                          onInput={(e) => {
                            const colors = [...formData().colors];
                            colors[index()].stock = Number(
                              e.currentTarget.value
                            );
                            setFormData({ ...formData(), colors });
                          }}
                          class="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeColor(index())}
                          class="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Groups */}
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  گروه‌ها
                </label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  <For each={groups()}>
                    {(g: any) => {
                      const checked = formData().groups.includes(g.ID ?? g.id);
                      return (
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const currentGroups = formData().groups;
                              if (checked) {
                                setFormData({
                                  ...formData(),
                                  groups: currentGroups.filter(
                                    (id) => id !== (g.ID ?? g.id)
                                  ),
                                });
                              } else {
                                setFormData({
                                  ...formData(),
                                  groups: [...currentGroups, g.ID ?? g.id],
                                });
                              }
                            }}
                            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span class="text-sm">{g.Name ?? g.name}</span>
                        </label>
                      );
                    }}
                  </For>
                </div>
              </div>

              <div class="flex gap-3 pt-4 border-t">
                <button
                  onClick={submit}
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editId() ? "ذخیره" : "ایجاد"}
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
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

export default Products;
