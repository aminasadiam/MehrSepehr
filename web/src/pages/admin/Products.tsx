import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createMemo,
} from "solid-js";
import {
  productsApi,
  categoriesApi,
  adminApi,
  getImageUrl,
} from "../../utils/api";
import { A } from "@solidjs/router";
import HtmlEditor from "../../components/HtmlEditor";

const Products: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const [categories, setCategories] = createSignal<any[]>([]);
  const [groups, setGroups] = createSignal<any[]>([]);
  const [brands, setBrands] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [categoryFilter, setCategoryFilter] = createSignal<number | null>(null);
  const [viewMode, setViewMode] = createSignal<"grid" | "table">("grid");
  const [showCreate, setShowCreate] = createSignal(false);
  const [editId, setEditId] = createSignal<number | null>(null);
  const [showGroupPrices, setShowGroupPrices] = createSignal(false);
  const [groupPrices, setGroupPrices] = createSignal<
    Array<{ groupId: number; price: number }>
  >([]);
  const [formData, setFormData] = createSignal({
    name: "",
    description: "",
    sku: "",
    stock: "",
    modelNumber: "",
    warranty: "",
    weight: "",
    dimensions: "",
    power: "",
    material: "",
    capacity: "",
    features: "",
    isActive: true,
    categoryId: null as number | null,
    brandId: null as number | null,
    groups: [] as number[],
    images: [] as any[], // Will contain { file?: File, url?: string, alt: string, isPrimary: boolean, order: number }
    sizes: [] as any[],
    colors: [] as any[],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, gRes, bRes] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
        adminApi.groups.getAll(),
        adminApi.brands.getAll(),
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
      stock: "",
      modelNumber: "",
      warranty: "",
      weight: "",
      dimensions: "",
      power: "",
      material: "",
      capacity: "",
      features: "",
      isActive: true,
      categoryId: null,
      brandId: null,
      groups: [],
      images: [],
      sizes: [],
      colors: [],
    });
  };

  const startEdit = async (p: any) => {
    // Fetch full product details to ensure Groups are preloaded
    try {
      const productId = p.ID ?? p.id;
      const fullProduct = await productsApi.getById(productId);
      const prod = fullProduct.data || p;

      setEditId(productId);
      setFormData({
        name: prod.Name ?? prod.name ?? "",
        description: prod.Description ?? prod.description ?? "",
        sku: prod.SKU ?? prod.sku ?? "",
        stock: String(prod.Stock ?? prod.stock ?? 0),
        modelNumber: prod.ModelNumber ?? prod.model_number ?? "",
        warranty: prod.Warranty ?? prod.warranty ?? "",
        weight: prod.Weight
          ? String(prod.Weight)
          : prod.weight
          ? String(prod.weight)
          : "",
        dimensions: prod.Dimensions ?? prod.dimensions ?? "",
        power: prod.Power ?? prod.power ?? "",
        material: prod.Material ?? prod.material ?? "",
        capacity: prod.Capacity ?? prod.capacity ?? "",
        features: prod.Features ?? prod.features ?? "",
        isActive: prod.IsActive ?? prod.is_active ?? true,
        categoryId: prod.CategoryID ?? prod.category_id ?? null,
        brandId: prod.BrandID ?? prod.brand_id ?? null,
        groups: (prod.Groups || prod.groups || []).map(
          (g: any) => g.ID ?? g.id
        ),
        images: (prod.Images || prod.images || []).map((img: any) => ({
          file: null,
          url: img.URL ?? img.url,
          alt: img.Alt ?? img.alt ?? "",
          isPrimary: img.IsPrimary ?? img.is_primary ?? false,
          order: img.Order ?? img.order ?? 0,
          preview: img.URL ?? img.url,
        })),
        sizes: (prod.Sizes || prod.sizes || []).map((s: any) => ({
          name: s.Name ?? s.name ?? "",
          stock: s.Stock ?? s.stock ?? 0,
          price: s.Price ?? s.price ?? "",
        })),
        colors: (prod.Colors || prod.colors || []).map((c: any) => ({
          name: c.Name ?? c.name ?? "",
          hexCode: c.HexCode ?? c.hex_code ?? "",
          stock: c.Stock ?? c.stock ?? 0,
        })),
      });
      setShowCreate(true);
    } catch (err) {
      console.error("Error fetching product details:", err);
      // Fallback to original data if fetch fails
      setEditId(p.ID ?? p.id);
      setFormData({
        name: p.Name ?? p.name ?? "",
        description: p.Description ?? p.description ?? "",
        sku: p.SKU ?? p.sku ?? "",
        stock: String(p.Stock ?? p.stock ?? 0),
        modelNumber: p.ModelNumber ?? p.model_number ?? "",
        warranty: p.Warranty ?? p.warranty ?? "",
        weight: p.Weight ? String(p.Weight) : p.weight ? String(p.weight) : "",
        dimensions: p.Dimensions ?? p.dimensions ?? "",
        power: p.Power ?? p.power ?? "",
        material: p.Material ?? p.material ?? "",
        capacity: p.Capacity ?? p.capacity ?? "",
        features: p.Features ?? p.features ?? "",
        isActive: p.IsActive ?? p.is_active ?? true,
        categoryId: p.CategoryID ?? p.category_id ?? null,
        brandId: p.BrandID ?? p.brand_id ?? null,
        groups: (p.Groups || p.groups || []).map((g: any) => g.ID ?? g.id),
        images: (p.Images || p.images || []).map((img: any) => ({
          file: null,
          url: img.URL ?? img.url,
          alt: img.Alt ?? img.alt ?? "",
          isPrimary: img.IsPrimary ?? img.is_primary ?? false,
          order: img.Order ?? img.order ?? 0,
          preview: img.URL ?? img.url,
        })),
        sizes: (p.Sizes || p.sizes || []).map((s: any) => ({
          name: s.Name ?? s.name ?? "",
          stock: s.Stock ?? s.stock ?? 0,
          price: s.Price ?? s.price ?? "",
        })),
        colors: (p.Colors || p.colors || []).map((c: any) => ({
          name: c.Name ?? c.name ?? "",
          hexCode: c.HexCode ?? c.hex_code ?? "",
          stock: c.Stock ?? c.stock ?? 0,
        })),
      });
      setShowCreate(true);
    }
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
            : { alt: "", isPrimary: false };

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
        stock: Number(data.stock || 0),
        model_number: data.modelNumber,
        warranty: data.warranty,
        weight: data.weight ? Number(data.weight) : null,
        dimensions: data.dimensions,
        power: data.power,
        material: data.material,
        capacity: data.capacity,
        features: data.features,
        is_active: data.isActive,
      };
      if (data.categoryId) payload.category_id = data.categoryId;
      if (data.brandId) payload.brand_id = data.brandId;
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
              img.isPrimary ? "true" : "false"
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
              img.isPrimary ? "true" : "false"
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
                is_primary: img.isPrimary || false,
                order: img.order || 0,
              };
            }
            // Otherwise use existing URL
            return {
              url: img.url || "",
              alt: img.alt || "",
              is_primary: img.isPrimary || false,
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
          await adminApi.groups.removeProductFromGroup(gid, productId);
        } catch {}
      }

      for (const gid of data.groups) {
        try {
          await adminApi.groups.addProductToGroup(gid, productId);
        } catch {}
      }

      // Save group prices
      const currentGroupPrices = groupPrices();
      if (currentGroupPrices && currentGroupPrices.length > 0) {
        for (const gp of currentGroupPrices) {
          try {
            await productsApi.setGroupPrice(productId, gp.groupId, gp.price);
          } catch (e) {
            console.error("Error setting group price:", e);
          }
        }
      }

      resetForm();
      setShowCreate(false);
      setGroupPrices([]);
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
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
        >
          <i class="fa-solid fa-plus"></i>
          افزودن محصول جدید
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative md:col-span-2">
            <input
              type="text"
              placeholder="جستجو در محصولات (نام یا SKU)..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i class="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>
          <select
            value={categoryFilter() ?? ""}
            onInput={(e) =>
              setCategoryFilter(
                e.currentTarget.value ? Number(e.currentTarget.value) : null
              )
            }
            class="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">📁 همه دسته‌بندی‌ها</option>
            <For each={categories()}>
              {(cat: any) => (
                <option value={cat.ID ?? cat.id}>{cat.Name ?? cat.name}</option>
              )}
            </For>
          </select>
        </div>
        <div class="flex gap-2 mt-4">
          <button
            onClick={() => setViewMode("grid")}
            class={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode() === "grid"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <i class="fa-solid fa-grip-vertical"></i>
            نمای شطرنجی
          </button>
          <button
            onClick={() => setViewMode("table")}
            class={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode() === "table"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <i class="fa-solid fa-table"></i>
            نمای جدول
          </button>
          <div class="flex-1"></div>
          <span class="px-4 py-2 text-sm text-slate-600 font-medium">
            {filteredProducts().length} محصول
          </span>
        </div>
      </div>

      <Show
        when={!loading()}
        fallback={
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="inline-block animate-spin mb-4">
                <i class="fa-solid fa-spinner text-4xl text-blue-600"></i>
              </div>
              <div class="text-slate-600 text-lg">در حال بارگذاری...</div>
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
              <p class="text-slate-600">هیچ محصولی با این فیلترها وجود ندارد</p>
            </div>
          }
        >
          <Show when={viewMode() === "grid"}>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={filteredProducts()}>
                {(p: any) => (
                  <div class="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden">
                    <div class="relative h-48 bg-slate-100 overflow-hidden">
                      {p.Images && p.Images.length > 0 ? (
                        <img
                          src={
                            (
                              p.Images[0]?.URL ??
                              p.Images[0]?.url ??
                              ""
                            ).startsWith("http")
                              ? p.Images[0]?.URL ?? p.Images[0]?.url
                              : `http://localhost:8080${
                                  p.Images[0]?.URL ?? p.Images[0]?.url
                                }`
                          }
                          alt={
                            p.Images[0]?.Alt ??
                            p.Images[0]?.alt ??
                            p.Name ??
                            p.name
                          }
                          class="w-full h-full object-cover"
                        />
                      ) : (
                        <div class="w-full h-full flex items-center justify-center text-slate-400">
                          <i class="fa-solid fa-image text-4xl"></i>
                        </div>
                      )}
                      {(!p.IsActive || !p.is_active) && (
                        <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span class="text-white font-bold">غیر فعال</span>
                        </div>
                      )}
                    </div>

                    <div class="p-4">
                      <h3 class="text-base font-bold text-slate-900 line-clamp-2 mb-2">
                        {p.Name ?? p.name}
                      </h3>

                      <div class="space-y-2 text-xs text-slate-600 mb-3">
                        <div>
                          <span class="font-mono">SKU: {p.SKU ?? p.sku}</span>
                        </div>
                        {p.ModelNumber ?? p.model_number ? (
                          <div>
                            <i class="fa-solid fa-microchip text-slate-400"></i>{" "}
                            مدل: {p.ModelNumber ?? p.model_number}
                          </div>
                        ) : null}
                        {p.Warranty ?? p.warranty ? (
                          <div>
                            <i class="fa-solid fa-shield text-slate-400"></i>{" "}
                            گارانتی: {p.Warranty ?? p.warranty}
                          </div>
                        ) : null}
                      </div>

                      {(p.Brand || p.Category) && (
                        <div class="flex gap-2 mb-3 flex-wrap">
                          {p.Brand ? (
                            <span class="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                              {p.Brand.Name ?? p.Brand.name}
                            </span>
                          ) : null}
                          {p.Category ? (
                            <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {p.Category.Name ?? p.Category.name}
                            </span>
                          ) : null}
                        </div>
                      )}

                      <div class="border-t border-slate-200 pt-3 mb-3">
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-xl font-bold text-blue-600">
                            {Number(p.Price ?? p.price ?? 0).toLocaleString(
                              "fa-IR"
                            )}{" "}
                            تومان
                          </span>
                          <span class="text-sm font-semibold">
                            موجودی:{" "}
                            <span
                              class={
                                (p.Stock ?? p.stock ?? 0) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {p.Stock ?? p.stock ?? 0}
                            </span>
                          </span>
                        </div>
                      </div>

                      {((p.Sizes && p.Sizes.length > 0) ||
                        (p.Colors && p.Colors.length > 0)) && (
                        <div class="text-xs text-slate-600 mb-3 space-y-1">
                          {p.Sizes && p.Sizes.length > 0 ? (
                            <div>
                              <i class="fa-solid fa-ruler text-slate-400"></i>{" "}
                              {p.Sizes.length} سایز
                            </div>
                          ) : null}
                          {p.Colors && p.Colors.length > 0 ? (
                            <div>
                              <i class="fa-solid fa-palette text-slate-400"></i>{" "}
                              {p.Colors.length} رنگ
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div class="flex gap-2 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => startEdit(p)}
                          class="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          title="ویرایش محصول"
                        >
                          <i class="fa-solid fa-pen-to-square"></i> ویرایش
                        </button>
                        <button
                          onClick={() => remove(p.ID ?? p.id)}
                          class="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          title="حذف محصول"
                        >
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={viewMode() === "table"}>
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                      نام محصول
                    </th>
                    <th class="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                      SKU
                    </th>
                    <th class="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                      قیمت
                    </th>
                    <th class="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                      موجودی
                    </th>
                    <th class="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                      دسته‌بندی
                    </th>
                    <th class="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <For each={filteredProducts()}>
                    {(p: any) => (
                      <tr class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            {p.Images && p.Images[0] ? (
                              <img
                                src={
                                  (
                                    p.Images[0]?.URL ??
                                    p.Images[0]?.url ??
                                    ""
                                  ).startsWith("http")
                                    ? p.Images[0]?.URL ?? p.Images[0]?.url
                                    : `http://localhost:8080${
                                        p.Images[0]?.URL ?? p.Images[0]?.url
                                      }`
                                }
                                alt=""
                                class="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div class="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-slate-400">
                                <i class="fa-solid fa-image text-sm"></i>
                              </div>
                            )}
                            <div>
                              <div class="font-medium text-slate-900 text-sm">
                                {p.Name ?? p.name}
                              </div>
                              <div class="text-xs text-slate-500">
                                {p.Brand?.Name ?? p.Brand?.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm font-mono text-slate-700">
                          {p.SKU ?? p.sku}
                        </td>
                        <td class="px-6 py-4 text-sm font-bold text-blue-600">
                          {Number(p.Price ?? p.price ?? 0).toLocaleString(
                            "fa-IR"
                          )}{" "}
                          تومان
                        </td>
                        <td class="px-6 py-4 text-sm">
                          <span
                            class={`px-3 py-1 rounded-full text-xs font-semibold ${
                              (p.Stock ?? p.stock ?? 0) > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {p.Stock ?? p.stock ?? 0}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm">
                          <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {p.Category?.Name ?? p.Category?.name ?? "-"}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm">
                          <div class="flex gap-2">
                            <button
                              onClick={() => startEdit(p)}
                              class="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs font-medium"
                            >
                              <i class="fa-solid fa-pen-to-square"></i> ویرایش
                            </button>
                            <button
                              onClick={() => remove(p.ID ?? p.id)}
                              class="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-xs font-medium"
                            >
                              <i class="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Show>
      </Show>

      {/* Create/Edit Modal */}
      <Show when={showCreate()}>
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => {
            setShowCreate(false);
            resetForm();
          }}
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div class="sticky top-0 z-10 bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-8 rounded-t-2xl border-b-4 border-blue-900">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-3xl font-bold flex items-center gap-3 mb-1">
                    {editId() ? (
                      <>
                        <div class="bg-blue-500 p-3 rounded-xl">
                          <i class="fa-solid fa-pen-to-square text-xl"></i>
                        </div>
                        ویرایش محصول
                      </>
                    ) : (
                      <>
                        <div class="bg-blue-500 p-3 rounded-xl">
                          <i class="fa-solid fa-plus text-xl"></i>
                        </div>
                        ایجاد محصول جدید
                      </>
                    )}
                  </h3>
                  <p class="text-blue-100 text-sm mt-1">
                    مدیریت جزئیات محصول شامل اطلاعات، تصاویر و قیمت‌گذاری
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  class="bg-blue-500/30 hover:bg-blue-500/50 text-white p-3 rounded-xl transition-colors"
                  title="بستن"
                >
                  <i class="fa-solid fa-times text-2xl"></i>
                </button>
              </div>
            </div>
            <div class="p-8 space-y-8">
              {/* Tab-like sections with better organization */}

              {/* Section 1: Basic Information */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-300 transition-colors">
                <div class="flex items-center gap-3 mb-6">
                  <div class="bg-blue-100 text-blue-700 p-3 rounded-xl">
                    <i class="fa-solid fa-info-circle text-xl"></i>
                  </div>
                  <h4 class="text-2xl font-bold text-slate-900">
                    اطلاعات پایه
                  </h4>
                  <span class="text-red-500 text-sm font-semibold">
                    * الزامی
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <span class="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        1
                      </span>
                      نام محصول
                      <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: گوشی هوشمند..."
                      value={formData().name}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          name: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <span class="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        2
                      </span>
                      کد SKU
                      <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: SKU-12345..."
                      value={formData().sku}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          sku: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-box text-green-500"></i>
                      موجودی
                    </label>
                    <input
                      type="number"
                      placeholder="تعداد موجود"
                      value={formData().stock}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          stock: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-folder text-purple-500"></i>
                      دسته‌بندی
                    </label>
                    <select
                      value={formData().categoryId ?? ""}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          categoryId: e.currentTarget.value
                            ? Number(e.currentTarget.value)
                            : null,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-800 bg-white"
                    >
                      <option value="">انتخاب دسته‌بندی...</option>
                      <For each={categories()}>
                        {(cat: any) => (
                          <option value={cat.ID ?? cat.id}>
                            {cat.Name ?? cat.name}
                          </option>
                        )}
                      </For>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-tag text-orange-500"></i>
                      برند
                    </label>
                    <select
                      value={formData().brandId ?? ""}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          brandId: e.currentTarget.value
                            ? Number(e.currentTarget.value)
                            : null,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-800 bg-white"
                    >
                      <option value="">انتخاب برند...</option>
                      <For each={brands()}>
                        {(brand: any) => (
                          <option value={brand.ID ?? brand.id}>
                            {brand.Name ?? brand.name}
                          </option>
                        )}
                      </For>
                    </select>
                  </div>
                  <div class="md:col-span-2 space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-align-left text-sky-500"></i>
                      توضیحات (HTML)
                    </label>
                    <HtmlEditor
                      value={formData().description}
                      onChange={(html) =>
                        setFormData({
                          ...formData(),
                          description: html,
                        })
                      }
                      placeholder="توضیحات مفصل محصول را وارد کنید..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Specifications */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 hover:border-amber-300 transition-colors">
                <div class="flex items-center gap-3 mb-6">
                  <div class="bg-amber-100 text-amber-700 p-3 rounded-xl">
                    <i class="fa-solid fa-gears text-xl"></i>
                  </div>
                  <h4 class="text-2xl font-bold text-slate-900">مشخصات فنی</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-microchip text-amber-600"></i>
                      شماره مدل
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: Model-2024-Pro"
                      value={formData().modelNumber}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          modelNumber: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-shield text-green-600"></i>
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
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-weight text-red-600"></i>
                      وزن (کیلوگرم)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.5"
                      value={formData().weight}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          weight: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-ruler text-blue-600"></i>
                      ابعاد
                    </label>
                    <input
                      type="text"
                      placeholder="30x40x50 سانتی‌متر"
                      value={formData().dimensions}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          dimensions: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-bolt text-yellow-600"></i>
                      قدرت
                    </label>
                    <input
                      type="text"
                      placeholder="1000W"
                      value={formData().power}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          power: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-cube text-indigo-600"></i>
                      جنس
                    </label>
                    <input
                      type="text"
                      placeholder="استیل ضد زنگ"
                      value={formData().material}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          material: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-droplet text-cyan-600"></i>
                      ظرفیت
                    </label>
                    <input
                      type="text"
                      placeholder="5 لیتر"
                      value={formData().capacity}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          capacity: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="flex text-sm font-bold text-slate-800 items-center gap-2">
                      <i class="fa-solid fa-star text-pink-600"></i>
                      ویژگی‌ها
                    </label>
                    <input
                      type="text"
                      placeholder="دیجیتال، تایمر، ضد چکه"
                      value={formData().features}
                      onInput={(e) =>
                        setFormData({
                          ...formData(),
                          features: e.currentTarget.value,
                        })
                      }
                      class="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div class="mt-6 flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-slate-200">
                  <input
                    type="checkbox"
                    id="active-toggle"
                    checked={formData().isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData(),
                        isActive: e.currentTarget.checked,
                      })
                    }
                    class="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <label
                    for="active-toggle"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <span class="text-sm font-bold text-slate-800">
                      فعال بودن محصول
                    </span>
                    {formData().isActive ? (
                      <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        فعال
                      </span>
                    ) : (
                      <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        غیرفعال
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Section 3: Images Management */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 hover:border-sky-300 transition-colors">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="bg-sky-100 text-sky-700 p-3 rounded-xl">
                      <i class="fa-solid fa-image text-xl"></i>
                    </div>
                    <h4 class="text-2xl font-bold text-slate-900">
                      تصاویر محصول
                    </h4>
                    <span class="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold">
                      {formData().images.length}
                    </span>
                  </div>
                  <button
                    onClick={addImage}
                    class="px-5 py-3 bg-linear-to-r from-sky-500 to-sky-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-plus"></i>
                    افزودن تصویر جدید
                  </button>
                </div>
                <Show
                  when={formData().images.length === 0}
                  fallback={
                    <div class="space-y-4">
                      <For each={formData().images}>
                        {(img, index) => (
                          <div class="bg-white rounded-xl border-2 border-slate-200 hover:border-sky-400 transition-all overflow-hidden shadow-sm hover:shadow-md">
                            <div class="flex gap-4 p-6">
                              {/* Image Preview */}
                              <div class="shrink-0">
                                {img.preview || img.url ? (
                                  <div class="relative">
                                    <img
                                      src={img.preview || getImageUrl(img.url)}
                                      alt={img.alt || "Preview"}
                                      class="w-32 h-32 object-cover rounded-xl border-2 border-slate-300 shadow-md"
                                    />
                                    {img.isPrimary && (
                                      <div class="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <i class="fa-solid fa-star"></i>
                                        اصلی
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div class="w-32 h-32 bg-linear-to-br from-slate-200 to-slate-300 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-500 flex-col text-center text-sm">
                                    <i class="fa-solid fa-image text-3xl mb-2"></i>
                                    بدون تصویر
                                  </div>
                                )}
                              </div>

                              {/* File Input */}
                              <div class="flex-1 space-y-4">
                                <div>
                                  <label class="flex text-sm font-bold text-slate-800 mb-2 items-center gap-2">
                                    <i class="fa-solid fa-cloud-arrow-up text-sky-500"></i>
                                    انتخاب یا بارگذاری تصویر
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
                                      e.currentTarget.value = "";
                                    }}
                                    class="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer transition-all"
                                  />
                                </div>
                                <div>
                                  <label class="flex text-sm font-bold text-slate-800 mb-2 items-center gap-2">
                                    <i class="fa-solid fa-font text-slate-500"></i>
                                    متن جایگزین (Alt Text)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="توضیحات مختصر تصویر برای SEO"
                                    value={img.alt || ""}
                                    onInput={(e) => {
                                      const images = [...formData().images];
                                      images[index()].alt =
                                        e.currentTarget.value;
                                      setFormData({ ...formData(), images });
                                    }}
                                    class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-800 placeholder:text-slate-400"
                                  />
                                </div>
                                <div class="flex items-center gap-4 pt-2 border-t border-slate-200">
                                  <label class="flex items-center gap-3 cursor-pointer hover:bg-yellow-50 px-3 py-2 rounded-lg transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={img.isPrimary || false}
                                      onChange={(e) => {
                                        const images = formData().images.map(
                                          (im, i) =>
                                            i === index()
                                              ? {
                                                  ...im,
                                                  isPrimary:
                                                    e.currentTarget.checked,
                                                }
                                              : { ...im, isPrimary: false }
                                        );
                                        setFormData({ ...formData(), images });
                                      }}
                                      class="w-5 h-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                    />
                                    <span class="font-bold text-slate-800 flex items-center gap-2">
                                      <i class="fa-solid fa-star text-yellow-500"></i>
                                      تصویر اصلی
                                    </span>
                                  </label>
                                  <button
                                    onClick={() => removeImage(index())}
                                    class="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all hover:scale-105 flex items-center gap-2 text-sm"
                                  >
                                    <i class="fa-solid fa-trash"></i>
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  }
                >
                  <div class="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                    <i class="fa-solid fa-image text-5xl text-slate-300 mb-4 block"></i>
                    <p class="text-slate-600 font-semibold mb-2">
                      هیچ تصویری افزوده نشده‌است
                    </p>
                    <p class="text-slate-500 text-sm">
                      برای شروع، دکمه "افزودن تصویر جدید" را کلیک کنید
                    </p>
                  </div>
                </Show>
              </div>

              {/* Section 4: Sizes */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 hover:border-green-300 transition-colors">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="bg-green-100 text-green-700 p-3 rounded-xl">
                      <i class="fa-solid fa-ruler text-xl"></i>
                    </div>
                    <h4 class="text-2xl font-bold text-slate-900">
                      اندازه‌ها و سایزها
                    </h4>
                    <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {formData().sizes.length}
                    </span>
                  </div>
                  <button
                    onClick={addSize}
                    class="px-5 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-plus"></i>
                    افزودن سایز جدید
                  </button>
                </div>
                <Show
                  when={formData().sizes.length === 0}
                  fallback={
                    <div class="space-y-3">
                      <For each={formData().sizes}>
                        {(size, index) => (
                          <div class="bg-white rounded-xl border-2 border-slate-200 hover:border-green-400 transition-all p-5 flex gap-4 items-end shadow-sm hover:shadow-md">
                            <div class="flex-1">
                              <label class="block text-sm font-bold text-slate-800 mb-2">
                                نام سایز
                              </label>
                              <input
                                type="text"
                                placeholder="مثال: Large, XL, 42"
                                value={size.name}
                                onInput={(e) => {
                                  const sizes = [...formData().sizes];
                                  sizes[index()].name = e.currentTarget.value;
                                  setFormData({ ...formData(), sizes });
                                }}
                                class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                              />
                            </div>
                            <div class="w-32">
                              <label class="block text-sm font-bold text-slate-800 mb-2">
                                موجودی
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={size.stock}
                                onInput={(e) => {
                                  const sizes = [...formData().sizes];
                                  sizes[index()].stock = Number(
                                    e.currentTarget.value
                                  );
                                  setFormData({ ...formData(), sizes });
                                }}
                                class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-800 text-center font-bold"
                              />
                            </div>
                            <div class="w-40">
                              <label class="block text-sm font-bold text-slate-800 mb-2">
                                قیمت اختیاری
                              </label>
                              <input
                                type="number"
                                placeholder="مثال: 150000"
                                value={size.price}
                                onInput={(e) => {
                                  const sizes = [...formData().sizes];
                                  sizes[index()].price = e.currentTarget.value;
                                  setFormData({ ...formData(), sizes });
                                }}
                                class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-800 text-center"
                              />
                            </div>
                            <button
                              onClick={() => removeSize(index())}
                              class="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all hover:scale-105"
                            >
                              <i class="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                  }
                >
                  <div class="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                    <i class="fa-solid fa-ruler text-5xl text-slate-300 mb-4 block"></i>
                    <p class="text-slate-600 font-semibold">
                      هیچ سایزی افزوده نشده‌است
                    </p>
                  </div>
                </Show>
              </div>

              {/* Section 5: Colors */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 hover:border-pink-300 transition-colors">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="bg-pink-100 text-pink-700 p-3 rounded-xl">
                      <i class="fa-solid fa-palette text-xl"></i>
                    </div>
                    <h4 class="text-2xl font-bold text-slate-900">
                      رنگ‌ها و گونه‌ها
                    </h4>
                    <span class="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold">
                      {formData().colors.length}
                    </span>
                  </div>
                  <button
                    onClick={addColor}
                    class="px-5 py-3 bg-linear-to-r from-pink-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <i class="fa-solid fa-plus"></i>
                    افزودن رنگ جدید
                  </button>
                </div>
                <Show
                  when={formData().colors.length === 0}
                  fallback={
                    <div class="space-y-3">
                      <For each={formData().colors}>
                        {(color, index) => (
                          <div class="bg-white rounded-xl border-2 border-slate-200 hover:border-pink-400 transition-all p-5 flex gap-4 items-end shadow-sm hover:shadow-md">
                            <div class="flex-1">
                              <label class="block text-sm font-bold text-slate-800 mb-2">
                                نام رنگ
                              </label>
                              <input
                                type="text"
                                placeholder="مثال: قرمز، آبی، مشکی"
                                value={color.name}
                                onInput={(e) => {
                                  const colors = [...formData().colors];
                                  colors[index()].name = e.currentTarget.value;
                                  setFormData({ ...formData(), colors });
                                }}
                                class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                              />
                            </div>
                            <div class="w-40">
                              <label class="block text-sm font-bold text-slate-800 mb-2">
                                کد رنگ HEX
                              </label>
                              <input
                                type="text"
                                placeholder="#FF0000"
                                value={color.hexCode}
                                onInput={(e) => {
                                  const colors = [...formData().colors];
                                  colors[index()].hexCode =
                                    e.currentTarget.value;
                                  setFormData({ ...formData(), colors });
                                }}
                                class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-slate-800 placeholder:text-slate-400 font-mono text-center"
                              />
                            </div>
                            {color.hexCode ? (
                              <div class="flex flex-col items-center gap-2">
                                <div
                                  class="w-12 h-12 rounded-xl border-2 border-slate-300 shadow-md hover:shadow-lg transition-all cursor-pointer"
                                  style={{ "background-color": color.hexCode }}
                                  title={color.hexCode}
                                />
                                <span class="text-xs font-mono text-slate-600">
                                  {color.hexCode}
                                </span>
                              </div>
                            ) : null}
                            <div class="w-32">
                              <label class="block text-sm font-bold text-slate-800 mb-2">
                                موجودی
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={color.stock}
                                onInput={(e) => {
                                  const colors = [...formData().colors];
                                  colors[index()].stock = Number(
                                    e.currentTarget.value
                                  );
                                  setFormData({ ...formData(), colors });
                                }}
                                class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-slate-800 text-center font-bold"
                              />
                            </div>
                            <button
                              onClick={() => removeColor(index())}
                              class="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all hover:scale-105"
                            >
                              <i class="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                  }
                >
                  <div class="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                    <i class="fa-solid fa-palette text-5xl text-slate-300 mb-4 block"></i>
                    <p class="text-slate-600 font-semibold">
                      هیچ رنگی افزوده نشده‌است
                    </p>
                  </div>
                </Show>
              </div>

              {/* Section 6: Groups & Pricing */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 transition-colors">
                <div class="flex items-center gap-3 mb-6">
                  <div class="bg-indigo-100 text-indigo-700 p-3 rounded-xl">
                    <i class="fa-solid fa-users-gear text-xl"></i>
                  </div>
                  <h4 class="text-2xl font-bold text-slate-900">
                    دسترسی گروه‌ها و قیمت‌گذاری
                  </h4>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="flex text-sm font-bold text-slate-800 mb-4 items-center gap-2">
                      <i class="fa-solid fa-shield-halved text-indigo-600"></i>
                      گروه‌های کاربری دسترسی‌پذیر
                    </label>
                    <div class="bg-white rounded-xl border-2 border-slate-200 p-6">
                      <Show
                        when={groups().length === 0}
                        fallback={
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <For each={groups()}>
                              {(g: any) => {
                                const checked = formData().groups.includes(
                                  g.ID ?? g.id
                                );
                                return (
                                  <label class="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 p-3 rounded-lg transition-colors border-2 border-transparent hover:border-indigo-300">
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
                                            groups: [
                                              ...currentGroups,
                                              g.ID ?? g.id,
                                            ],
                                          });
                                        }
                                      }}
                                      class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span class="font-semibold text-slate-800">
                                      {g.Name ?? g.name}
                                    </span>
                                    {checked && (
                                      <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">
                                        <i class="fa-solid fa-check mr-1"></i>
                                        فعال
                                      </span>
                                    )}
                                  </label>
                                );
                              }}
                            </For>
                          </div>
                        }
                      >
                        <div class="text-center py-8 text-slate-500">
                          <i class="fa-solid fa-inbox text-4xl text-slate-300 mb-3 block"></i>
                          <p class="font-semibold">هیچ گروهی موجود نیست</p>
                        </div>
                      </Show>
                    </div>
                  </div>

                  {editId() && (
                    <>
                      <div class="border-t-2 border-slate-300 pt-6">
                        <button
                          onClick={() => setShowGroupPrices(!showGroupPrices())}
                          class="w-full px-6 py-4 bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
                        >
                          <i
                            class={`fa-solid fa-${
                              showGroupPrices() ? "chevron-up" : "chevron-down"
                            }`}
                          ></i>
                          <i class="fa-solid fa-dollar-sign"></i>
                          {showGroupPrices()
                            ? "پنهان کردن قیمت‌های گروهی"
                            : "مدیریت قیمت‌های گروهی"}
                        </button>
                      </div>

                      <Show when={showGroupPrices()}>
                        <div class="bg-linear-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 space-y-4">
                          <div class="flex items-start gap-3 mb-4">
                            <i class="fa-solid fa-circle-info text-indigo-600 text-xl mt-1"></i>
                            <div>
                              <p class="font-bold text-indigo-900">
                                تنظیم قیمت اختصاصی
                              </p>
                              <p class="text-sm text-indigo-700 mt-1">
                                می‌توانید قیمت‌های مختلفی برای هر گروه کاربری
                                تعریف کنید
                              </p>
                            </div>
                          </div>
                          <div class="space-y-3">
                            <For each={groups()}>
                              {(g: any) => (
                                <div class="bg-white rounded-xl border-2 border-indigo-200 p-4 hover:shadow-md transition-all">
                                  <div class="flex items-end gap-3">
                                    <div class="flex-1">
                                      <label class="block text-sm font-bold text-slate-800 mb-2">
                                        <i class="fa-solid fa-users text-indigo-600 mr-2"></i>
                                        {g.Name ?? g.name}
                                      </label>
                                      <input
                                        type="number"
                                        placeholder="قیمت را وارد کنید"
                                        step="1"
                                        value={
                                          groupPrices().find(
                                            (gp) =>
                                              gp.groupId === (g.ID ?? g.id)
                                          )?.price ?? ""
                                        }
                                        onInput={(e) => {
                                          const gId = g.ID ?? g.id;
                                          const price = Number(
                                            e.currentTarget.value || 0
                                          );
                                          const existing = groupPrices().find(
                                            (gp) => gp.groupId === gId
                                          );
                                          if (existing) {
                                            setGroupPrices(
                                              groupPrices().map((gp) =>
                                                gp.groupId === gId
                                                  ? { ...gp, price }
                                                  : gp
                                              )
                                            );
                                          } else {
                                            setGroupPrices([
                                              ...groupPrices(),
                                              { groupId: gId, price },
                                            ]);
                                          }
                                        }}
                                        class="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 font-semibold text-lg"
                                      />
                                    </div>
                                    <span class="text-lg font-bold text-indigo-600 whitespace-nowrap">
                                      تومان
                                    </span>
                                  </div>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </>
                  )}
                </div>
              </div>

              <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-blue-600 p-8 flex gap-4 -m-8 mt-8 rounded-b-2xl shadow-2xl">
                <button
                  onClick={submit}
                  class="flex-1 px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                >
                  <i class="fa-solid fa-floppy-disk text-xl"></i>
                  {editId() ? "✓ ذخیره تغییرات" : "✓ ایجاد محصول جدید"}
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  class="px-8 py-4 bg-slate-600 text-white rounded-xl hover:bg-slate-700 hover:scale-105 transition-all font-bold flex items-center gap-3 shadow-lg"
                >
                  <i class="fa-solid fa-circle-xmark text-xl"></i>
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
