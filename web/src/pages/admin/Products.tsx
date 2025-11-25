import { Component, createSignal, onMount } from "solid-js";
import { productsApi } from "../../utils/api";

const Products: Component = () => {
  const [items, setItems] = createSignal<any[]>([]);
  const load = async () => {
    try {
      const res = await productsApi.getAll();
      setItems((res.data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };
  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Products</h2>
      <ul>
        {items().map((p) => (
          <li class="mb-2 border p-2">
            {p.Name ?? p.name} - ${p.Price ?? p.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
