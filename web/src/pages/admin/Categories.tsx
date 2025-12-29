import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createMemo,
} from "solid-js";
import { categoriesApi } from "../../utils/api";
import { normalizeCategory } from "../../types/api";

const Categories: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [showCreate, setShowCreate] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [newCategory, setNewCategory] = createSignal({
    name: "",
    parentId: null as number | null,
  });
  const [editing, setEditing] = createSignal<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      const payload = Array.isArray(res.data) ? res.data : [];
      // normalize items to consistent shape
      const normalized = payload.map(normalizeCategory);

      // if API returned children already as tree, use it; otherwise build tree from flat list
      const hasChildrenField = normalized.some(
        (n) => Array.isArray(n.children) && n.children.length > 0
      );
      if (hasChildrenField) {
        setItems(normalized);
      } else {
        const map = new Map<number, any>();
        normalized.forEach((n) => {
          map.set(n.id, { ...n, children: [] });
        });
        const roots: any[] = [];
        map.forEach((node) => {
          const pid = node.parentId ?? null;
          if (pid && map.has(pid)) {
            map.get(pid).children.push(node);
          } else {
            roots.push(node);
          }
        });
        setItems(roots);
      }
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  onMount(load);

  // helper: recursively filter a tree of categories by term (keeps parents if any child matches)
  const filterTree = (cats: any[], term: string): any[] => {
    if (!term) return cats;
    const out: any[] = [];
    cats.forEach((c) => {
      const children = Array.isArray(c.children)
        ? filterTree(c.children, term)
        : [];
      if ((c.name || "").toLowerCase().includes(term) || children.length) {
        out.push({ ...c, children });
      }
    });
    return out;
  };

  // helper: flatten a tree into array with level metadata
  const flatten = (cats: any[], level = 0): any[] => {
    const flat: any[] = [];
    cats.forEach((c: any) => {
      flat.push({ ...c, level });
      if (Array.isArray(c.children) && c.children.length) {
        flat.push(...flatten(c.children, level + 1));
      }
    });
    return flat;
  };

  // helper: find node by id in tree
  const findNodeById = (cats: any[], id: number | string): any | null => {
    for (const c of cats) {
      if (c.id === id) return c;
      if (Array.isArray(c.children)) {
        const found = findNodeById(c.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // helper: collect all ids in a subtree (including root)
  const collectIds = (node: any): Set<number> => {
    const s = new Set<number>();
    if (!node) return s;
    const traverse = (n: any) => {
      s.add(n.id);
      if (Array.isArray(n.children)) {
        n.children.forEach(traverse);
      }
    };
    traverse(node);
    return s;
  };

  const createCategory = async () => {
    const cat = newCategory();
    if (!cat.name.trim()) return alert("نام دسته الزامی است");

    try {
      // send backend-friendly payload keys (parent_id)
      await categoriesApi.create({
        name: cat.name,
        parent_id: cat.parentId ?? null,
      });
      setNewCategory({ name: "", parentId: null });
      setShowCreate(false);
      load();
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد دسته");
    }
  };

  const startEdit = (cat: any) => {
    setEditing(cat);
    setNewCategory({
      name: cat.name,
      parentId: cat.parentId ?? null,
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!editing()?.id) return;
    const updated = newCategory();

    try {
      await categoriesApi.update(editing().id, {
        name: updated.name,
        parent_id: updated.parentId ?? null,
      });
      setShowEdit(false);
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      alert("خطا در بروزرسانی دسته");
    }
  };

  const deleteCategory = async (id: number) => {
    if (!id || !confirm("حذف دسته؟")) return;

    try {
      await categoriesApi.delete(id);
      load();
    } catch (e) {
      console.error(e);
      alert("خطا در حذف دسته");
    }
  };

  // filtered tree based on search term (searches recursively)
  const filteredTree = createMemo(() => {
    const term = search().trim().toLowerCase();
    return filterTree(items(), term);
  });

  // flattened list derived from filteredTree (for display)
  const flattenedFiltered = createMemo(() => flatten(filteredTree()));

  // flattened list of all items (for select lists)
  const flattenedAll = createMemo(() => flatten(items()));

  // compute descendant id set for currently editing node to prevent cycles
  const editingDescendantIds = createMemo(() => {
    const ed = editing();
    if (!ed || !ed.id) return new Set<number>();
    const node = findNodeById(items(), ed.id);
    if (!node) return new Set<number>();
    return collectIds(node);
  });

  const getHierarchy = (cat: any, level = 0): string => {
    return (
      "─".repeat(level) +
      " " +
      cat.name +
      (cat.children?.length ? " (" + cat.children.length + ")" : "")
    );
  };

  return (
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        <button class="btn btn-primary" onClick={() => setShowCreate(true)}>
          ➕ دسته جدید
        </button>
      </div>

      <input
        type="search"
        placeholder="جستجو..."
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
        class="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      <Show when={!loading()} fallback={<p>در حال بارگیری...</p>}>
        <table class="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
          <thead>
            <tr class="bg-indigo-600 text-white">
              <th class="px-4 py-3 text-left">ID</th>
              <th class="px-4 py-3 text-left">نام</th>
              <th class="px-4 py-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <For each={flattenedFiltered()}>
              {(cat) => (
                <tr class="border-b hover:bg-slate-50">
                  <td class="px-4 py-3 text-sm text-slate-500">{cat.id}</td>
                  <td
                    class="px-4 py-3"
                    style={{ "padding-left": `${cat.level * 1.5 + 1}rem` }}
                  >
                    {getHierarchy(cat, cat.level)}
                  </td>
                  <td class="px-4 py-3 text-center flex gap-2 justify-center">
                    <button
                      class="btn btn-outline text-xs"
                      onClick={() => startEdit(cat)}
                    >
                      ویرایش
                    </button>
                    <button
                      class="btn btn-danger text-xs"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      {/* Create Modal */}
      <Show when={showCreate()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 class="text-xl font-bold">دسته جدید</h2>
            <input
              placeholder="نام دسته"
              value={newCategory().name}
              onInput={(e) =>
                setNewCategory({
                  ...newCategory(),
                  name: e.currentTarget.value,
                })
              }
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newCategory().parentId ?? ""}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory(),
                  parentId: Number(e.currentTarget.value) || null,
                })
              }
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">بدون والد</option>
              <For each={flattenedAll()}>
                {(c) => (
                  <option value={c.id}>{getHierarchy(c, c.level)}</option>
                )}
              </For>
            </select>
            <div class="flex gap-3 pt-4">
              <button
                onClick={createCategory}
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                ایجاد
              </button>
              <button
                onClick={() => setShowCreate(false)}
                class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Edit Modal */}
      <Show when={showEdit()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 class="text-xl font-bold">ویرایش دسته</h2>
            <input
              placeholder="نام دسته"
              value={newCategory().name}
              onInput={(e) =>
                setNewCategory({
                  ...newCategory(),
                  name: e.currentTarget.value,
                })
              }
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newCategory().parentId ?? ""}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory(),
                  parentId:
                    e.currentTarget.value === ""
                      ? null
                      : Number(e.currentTarget.value),
                })
              }
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">بدون والد</option>
              <For each={flattenedAll()}>
                {(c) => (
                  <option
                    value={c.id}
                    disabled={
                      editingDescendantIds().has(c.id) || c.id === editing()?.id
                    }
                  >
                    {getHierarchy(c, c.level)}
                  </option>
                )}
              </For>
            </select>
            <div class="flex gap-3 pt-4">
              <button
                onClick={saveEdit}
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                ذخیره
              </button>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setEditing(null);
                }}
                class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Categories;
