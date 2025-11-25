import { Component, createSignal, onMount } from "solid-js";
import { adminApi } from "../../utils/api";

const Roles: Component = () => {
  const [roles, setRoles] = createSignal<any[]>([]);

  const load = async () => {
    try {
      const res = await adminApi.getRoles();
      setRoles((res.data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };

  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Roles</h2>
      <ul>
        {roles().map((r) => (
          <li class="mb-2 border p-2">{r.Name ?? r.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Roles;
