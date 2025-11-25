import { Component, createSignal, onMount } from "solid-js";
import { categoriesApi } from "../../utils/api";

const Categories: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const load = async () => {
    try {
      const res = await categoriesApi.getAll();
      setItems((res.data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };
  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Categories</h2>
      <ul>
        {items().map((c) => (
          <li class="mb-2 border p-2">{c.Name ?? c.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
