import { Component, createSignal, onMount } from "solid-js";
import { adminApi } from "../../utils/api";

const Permissions: Component = () => {
  const [perms, setPerms] = createSignal<any[]>([]);

  const load = async () => {
    try {
      const res = await adminApi.getPermissions();
      setPerms((res.data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };

  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Permissions</h2>
      <ul>
        {perms().map((p) => (
          <li class="mb-2 border p-2">{p.Name ?? p.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Permissions;
