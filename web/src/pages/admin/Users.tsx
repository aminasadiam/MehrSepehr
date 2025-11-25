import { Component, createSignal, onMount } from "solid-js";
import { usersApi } from "../../utils/api";

const Users: Component = () => {
  const [users, setUsers] = createSignal<any[]>([]);

  const load = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers((res.data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };

  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Users</h2>
      <table class="min-w-full table-auto border">
        <thead>
          <tr>
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Username</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Roles</th>
          </tr>
        </thead>
        <tbody>
          {users().map((u) => (
            <tr class="border-t">
              <td class="px-4 py-2">{u.ID ?? u.id}</td>
              <td class="px-4 py-2">{u.Username ?? u.username}</td>
              <td class="px-4 py-2">{u.Email ?? u.email}</td>
              <td class="px-4 py-2">
                {(u.Roles || []).map((r) => r.Name || r.name).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
