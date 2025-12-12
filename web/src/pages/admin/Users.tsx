import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createMemo,
} from "solid-js";
import { usersApi, adminApi, authApi } from "../../utils/api";
import { A } from "@solidjs/router";

const Users: Component = () => {
  const [users, setUsers] = createSignal<any[]>([]);
  const [roles, setRoles] = createSignal<any[]>([]);
  const [groups, setGroups] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);

  const [showCreate, setShowCreate] = createSignal(false);
  const [showEdit, setShowEdit] = createSignal(false);
  const [newUser, setNewUser] = createSignal({
    username: "",
    email: "",
    password: "",
    phone: "",
    avatar: "",
  });
  const [editing, setEditing] = createSignal<any | null>(null);
  const [search, setSearch] = createSignal("");
  const [selectedRoles, setSelectedRoles] = createSignal<number[]>([]);
  const [selectedGroups, setSelectedGroups] = createSignal<number[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, gRes] = await Promise.all([
        usersApi.getAll(),
        adminApi.getRoles(),
        adminApi.getGroups(),
      ]);
      setUsers((uRes.data as any) || []);
      setRoles((rRes.data as any) || []);
      setGroups((gRes.data as any) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => setShowCreate(true);

  const createUser = async () => {
    const p = newUser();
    if (!p.username || !p.email || !p.password)
      return alert("همه فیلدها لازم هستند");
    try {
      await authApi.register(
        p.username,
        p.email,
        p.password,
        p.phone,
        p.avatar
      );
      setNewUser({
        username: "",
        email: "",
        password: "",
        phone: "",
        avatar: "",
      });
      setShowCreate(false);
      await load();
      alert("کاربر با موفقیت ایجاد شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ایجاد کاربر");
    }
  };

  const openEdit = async (id: number) => {
    try {
      const res = await usersApi.getById(id);
      const u = (res.data as any) || {};
      setEditing(u || null);
      setShowEdit(true);
      setSelectedRoles((u.Roles || []).map((r: any) => Number(r.ID ?? r.id)));
      setSelectedGroups((u.Groups || []).map((g: any) => Number(g.ID ?? g.id)));
      setEditing((prev: any) => ({
        ...(prev || {}),
        phone: u.phone ?? u.Phone ?? "",
        avatar: u.avatar ?? u.Avatar ?? "",
      }));
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری کاربر");
    }
  };

  const saveEdit = async () => {
    const u = editing();
    if (!u) return;
    try {
      const payload: any = {
        username: u.Username ?? u.username,
        email: u.Email ?? u.email,
      };
      if ((u as any).phone !== undefined) payload.phone = (u as any).phone;
      if ((u as any).avatar !== undefined) payload.avatar = (u as any).avatar;
      if ((u as any).password) payload.password = (u as any).password;

      await usersApi.update(u.ID ?? u.id, payload);

      const existingRoleIds = (u.Roles || []).map((r: any) =>
        Number(r.ID ?? r.id)
      );
      const wantRoleIds = selectedRoles().map(Number);
      const toAddRoles = wantRoleIds.filter(
        (id) => !existingRoleIds.includes(id)
      );
      const toRemoveRoles = existingRoleIds.filter(
        (id: number) => !wantRoleIds.includes(id)
      );
      for (const rid of toAddRoles) await usersApi.addRole(u.ID ?? u.id, rid);
      for (const rid of toRemoveRoles)
        await usersApi.removeRole(u.ID ?? u.id, rid);

      const existingGroupIds = (u.Groups || []).map((g: any) =>
        Number(g.ID ?? g.id)
      );
      const wantGroupIds = selectedGroups().map(Number);
      const toAddGroups = wantGroupIds.filter(
        (id) => !existingGroupIds.includes(id)
      );
      const toRemoveGroups = existingGroupIds.filter(
        (id: number) => !wantGroupIds.includes(id)
      );
      for (const gid of toAddGroups)
        await adminApi.addUserToGroup(gid, u.ID ?? u.id);
      for (const gid of toRemoveGroups)
        await adminApi.removeUserFromGroup(gid, u.ID ?? u.id);

      await load();
      setShowEdit(false);
      setEditing(null);
      alert("تغییرات ذخیره شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ذخیره تغییرات");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      await usersApi.delete(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("خطا در حذف کاربر");
    }
  };

  const toggleSelectedRole = (roleId: number) => {
    const s = selectedRoles().map(Number);
    const idNum = Number(roleId);
    if (s.includes(idNum)) setSelectedRoles(s.filter((id) => id !== idNum));
    else setSelectedRoles([...s, idNum]);
  };

  const toggleSelectedGroup = (groupId: number) => {
    const s = selectedGroups().map(Number);
    const idNum = Number(groupId);
    if (s.includes(idNum)) setSelectedGroups(s.filter((id) => id !== idNum));
    else setSelectedGroups([...s, idNum]);
  };

  const uploadAvatarForUser = async (userId: number, file: File) => {
    try {
      const form = new FormData();
      form.append("avatar", file);
      await adminApi.uploadUserAvatar(userId, form);
      await load();
      alert("تصویر پروفایل بارگذاری شد");
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری تصویر");
    }
  };

  onMount(load);

  return (
    <div class="p-6" dir="rtl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold">مدیریت کاربران</h2>
        <div class="flex gap-2">
          <button class="btn btn-outline" onClick={openCreate}>
            افزودن کاربر
          </button>
          <button class="btn btn-ghost" onClick={load}>
            بارگذاری مجدد
          </button>
        </div>
      </div>

      <div class="mb-4 flex items-center gap-3">
        <input
          class="border rounded px-3 py-2 flex-1"
          placeholder="جستجو بر اساس نام کاربری یا ایمیل..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
        <button class="btn btn-sm" onClick={() => setSearch("")}>
          پاک کردن
        </button>
      </div>

      <Show
        when={!loading()}
        fallback={<div class="p-4 text-center">در حال بارگذاری...</div>}
      >
        <div class="bg-white rounded shadow overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-2 text-right">ID</th>
                <th class="px-4 py-2 text-right">نام کاربری</th>
                <th class="px-4 py-2 text-right">ایمیل</th>
                <th class="px-4 py-2 text-right">نقش‌ها</th>
                <th class="px-4 py-2 text-right">گروه‌ها</th>
                <th class="px-4 py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              <For
                each={createMemo(() => {
                  const q = search().trim().toLowerCase();
                  if (!q) return users();
                  return (users() || []).filter((u: any) => {
                    const username = String(
                      u.Username ?? u.username ?? ""
                    ).toLowerCase();
                    const email = String(
                      u.Email ?? u.email ?? ""
                    ).toLowerCase();
                    return (
                      username.includes(q) ||
                      email.includes(q) ||
                      String(u.ID ?? u.id).includes(q)
                    );
                  });
                })()}
              >
                {(u: any) => (
                  <tr class="border-t hover:bg-slate-50">
                    <td class="px-4 py-2 text-right">{u.ID ?? u.id}</td>
                    <td class="px-4 py-2 text-right">
                      <A
                        href={`/admin/users/${u.ID ?? u.id}`}
                        class="text-blue-600 hover:underline"
                      >
                        {u.Username ?? u.username}
                      </A>
                    </td>
                    <td class="px-4 py-2 text-right">{u.Email ?? u.email}</td>
                    <td class="px-4 py-2 text-right">
                      <div class="flex gap-2 flex-wrap">
                        <For each={u.Roles || []}>
                          {(r: any) => (
                            <span class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                              {r.Name ?? r.name}
                            </span>
                          )}
                        </For>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-right">
                      <div class="flex gap-2 flex-wrap">
                        <For each={u.Groups || []}>
                          {(g: any) => (
                            <span class="px-2 py-1 bg-slate-100 rounded">
                              {g.Name ?? g.name}
                            </span>
                          )}
                        </For>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-right">
                      <div class="flex gap-2 justify-end">
                        <button
                          class="btn btn-sm"
                          onClick={() => openEdit(u.ID ?? u.id)}
                        >
                          ویرایش
                        </button>
                        <button
                          class="btn btn-sm btn-danger"
                          onClick={() => deleteUser(u.ID ?? u.id)}
                        >
                          حذف
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

      {/* Create modal */}
      <Show when={showCreate()}>
        <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div class="bg-white p-6 rounded w-11/12 max-w-2xl" dir="rtl">
            <h3 class="text-lg font-semibold mb-4">ایجاد کاربر جدید</h3>
            <div class="grid grid-cols-1 gap-2">
              <input
                class="border rounded px-2 py-1"
                placeholder="نام کاربری"
                value={newUser().username}
                onInput={(e) =>
                  setNewUser({ ...newUser(), username: e.currentTarget.value })
                }
              />
              <input
                class="border rounded px-2 py-1"
                placeholder="ایمیل"
                value={newUser().email}
                onInput={(e) =>
                  setNewUser({ ...newUser(), email: e.currentTarget.value })
                }
              />
              <input
                class="border rounded px-2 py-1"
                placeholder="رمز عبور"
                type="password"
                value={newUser().password}
                onInput={(e) =>
                  setNewUser({ ...newUser(), password: e.currentTarget.value })
                }
              />
              <input
                class="border rounded px-2 py-1"
                placeholder="شماره تلفن"
                value={newUser().phone}
                onInput={(e) =>
                  setNewUser({ ...newUser(), phone: e.currentTarget.value })
                }
              />
              <input
                class="border rounded px-2 py-1"
                placeholder="آدرس تصویر پروفایل (URL)"
                value={newUser().avatar}
                onInput={(e) =>
                  setNewUser({ ...newUser(), avatar: e.currentTarget.value })
                }
              />
              <div class="flex gap-2 justify-end mt-3">
                <button class="btn btn-primary" onClick={createUser}>
                  ساخت
                </button>
                <button
                  class="btn btn-outline"
                  onClick={() => setShowCreate(false)}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Edit modal */}
      <Show when={showEdit() && editing()}>
        <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div class="bg-white p-6 rounded w-11/12 max-w-2xl" dir="rtl">
            <h3 class="text-lg font-semibold mb-4">ویرایش کاربر</h3>
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="text-sm">نام کاربری</label>
                <input
                  class="border rounded px-2 py-1 w-full"
                  value={editing().Username ?? editing().username}
                  onInput={(e) =>
                    setEditing({
                      ...editing(),
                      Username: e.currentTarget.value,
                      username: e.currentTarget.value,
                    })
                  }
                />
              </div>
              <div>
                <label class="text-sm">ایمیل</label>
                <input
                  class="border rounded px-2 py-1 w-full"
                  value={editing().Email ?? editing().email}
                  onInput={(e) =>
                    setEditing({
                      ...editing(),
                      Email: e.currentTarget.value,
                      email: e.currentTarget.value,
                    })
                  }
                />
              </div>

              <div>
                <label class="text-sm">شماره تلفن</label>
                <input
                  class="border rounded px-2 py-1 w-full"
                  value={editing().phone ?? editing().Phone ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), phone: e.currentTarget.value })
                  }
                />
              </div>

              <div>
                <label class="text-sm">آدرس تصویر پروفایل (URL)</label>
                <input
                  class="border rounded px-2 py-1 w-full"
                  value={editing().avatar ?? editing().Avatar ?? ""}
                  onInput={(e) =>
                    setEditing({ ...editing(), avatar: e.currentTarget.value })
                  }
                />
                <div class="mt-2">
                  <label class="text-sm">یا آپلود تصویر</label>
                  <input
                    type="file"
                    accept="image/*"
                    onInput={(e: any) => {
                      const f = e.currentTarget.files?.[0];
                      if (f)
                        uploadAvatarForUser(editing().ID ?? editing().id, f);
                    }}
                  />
                </div>
              </div>

              <div>
                <label class="text-sm">
                  رمز جدید (خالی بگذارید اگر نمی‌خواهید تغییر دهید)
                </label>
                <input
                  class="border rounded px-2 py-1 w-full"
                  type="password"
                  onInput={(e) =>
                    setEditing({
                      ...editing(),
                      password: e.currentTarget.value,
                    })
                  }
                />
              </div>

              <div>
                <div class="text-sm font-medium">نقش‌ها</div>
                <div class="mt-2">
                  <div class="text-sm text-slate-600 mb-1">انتخاب نقش‌ها</div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <For each={roles()}>
                      {(r: any) => {
                        const rid = Number(r.ID ?? r.id);
                        const checked = selectedRoles()
                          .map(Number)
                          .includes(rid);
                        const permCount = (r.Permissions || []).length;
                        return (
                          <div class="p-2 border rounded flex items-start justify-between">
                            <div>
                              <label class="inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleSelectedRole(rid)}
                                />
                                <span class="font-medium">
                                  {r.Name ?? r.name}
                                </span>
                              </label>
                              <div class="text-xs text-slate-500 mt-1">
                                {r.Description ?? r.description ?? ""}
                              </div>
                              <div class="text-xs text-slate-400 mt-1">
                                {permCount} دسترسی
                              </div>
                            </div>
                            <div class="flex flex-col items-end gap-1">
                              <For each={r.Permissions || []}>
                                {(p: any) => (
                                  <span class="px-2 py-1 bg-slate-50 rounded text-xs">
                                    {p.Name ?? p.name}
                                  </span>
                                )}
                              </For>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>

              <div>
                <div class="text-sm font-medium">گروه‌ها</div>
                <div class="mt-3">
                  <div class="text-sm text-slate-600 mb-1">
                    عضویت در گروه‌ها
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <For each={groups()}>
                      {(g: any) => {
                        const gid = Number(g.ID ?? g.id);
                        const checked = selectedGroups()
                          .map(Number)
                          .includes(gid);
                        return (
                          <label class="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelectedGroup(gid)}
                            />
                            <span class="text-sm">{g.Name ?? g.name}</span>
                          </label>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>

              <div>
                <div class="text-sm font-medium">دسترسی‌ها (از نقش‌ها)</div>
                <div class="flex gap-2 flex-wrap mt-2">
                  {Array.from(
                    new Set(
                      (editing().Roles || []).flatMap((r: any) =>
                        (r.Permissions || []).map((p: any) => p.Name ?? p.name)
                      )
                    )
                  ).map((p: any) => (
                    <span class="px-2 py-1 bg-slate-50 rounded">{p}</span>
                  ))}
                </div>
              </div>

              <div class="flex gap-2 justify-end mt-4">
                <button class="btn btn-primary" onClick={saveEdit}>
                  ذخیره
                </button>
                <button
                  class="btn btn-outline"
                  onClick={() => {
                    setShowEdit(false);
                    setEditing(null);
                  }}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Users;
