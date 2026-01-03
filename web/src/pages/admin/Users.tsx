import { Component, createSignal, onMount, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { usersApi, rolesApi, groupsApi } from "../../utils/api";

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
  });
  const [editing, setEditing] = createSignal<any | null>(null);
  const [search, setSearch] = createSignal("");
  const [selectedRoles, setSelectedRoles] = createSignal<number[]>([]);
  const [selectedGroups, setSelectedGroups] = createSignal<number[]>([]);

  // Helper to get ID safely (handles both id and ID)
  const getId = (obj: any): number => obj.id || obj.ID || 0;
  const getName = (obj: any): string => obj.name || obj.Name || "";

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, gRes] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
        groupsApi.getAll(),
      ]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : []);
      setRoles(Array.isArray(rRes.data) ? rRes.data : []);
      setGroups(Array.isArray(gRes.data) ? gRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  onMount(load);

  const filteredUsers = () => {
    const term = search().toLowerCase();
    return users().filter(
      (u) =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  };

  const createUser = async () => {
    try {
      await usersApi.create(newUser());
      setNewUser({ username: "", email: "", password: "", phone: "" });
      setShowCreate(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (user: any) => {
    setEditing(user);
    setSelectedRoles(
      (user.Roles || user.roles || []).map((r: any) => r.id || r.ID) || []
    );
    setSelectedGroups(
      (user.Groups || user.groups || []).map((g: any) => g.id || g.ID) || []
    );
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!editing()) return;
    try {
      await usersApi.update(getId(editing()), {
        username: editing().username,
        email: editing().email,
        phone: editing().phone,
      });

      const currentRoles = (editing().Roles || editing().roles || []).map(
        (r: any) => getId(r)
      );
      for (const rid of selectedRoles()) {
        if (!currentRoles.includes(rid)) {
          await usersApi.addRole(getId(editing()), rid);
        }
      }
      for (const rid of currentRoles) {
        if (!selectedRoles().includes(rid)) {
          await usersApi.removeRole(getId(editing()), rid);
        }
      }

      const currentGroups = (editing().Groups || editing().groups || []).map(
        (g: any) => getId(g)
      );
      for (const gid of selectedGroups()) {
        if (!currentGroups.includes(gid)) {
          await groupsApi.addUser(gid, getId(editing()));
        }
      }
      for (const gid of currentGroups) {
        if (!selectedGroups().includes(gid)) {
          await groupsApi.removeUser(gid, getId(editing()));
        }
      }

      setShowEdit(false);
      setEditing(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("حذف کاربر؟")) return;
    try {
      await usersApi.delete(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatar = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !editing()) return;
    const form = new FormData();
    form.append("avatar", file);
    try {
      await usersApi.uploadAvatar(getId(editing()), form);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div class="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white p-8 rounded-2xl border-b-4 border-indigo-900 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold flex items-center gap-3">
                <span class="text-3xl">👥</span>
                مدیریت کاربران
              </h1>
              <p class="text-indigo-100 mt-2">
                مدیریت کاربران، نقش‌ها و دسترسی‌ها
              </p>
            </div>
            <button
              class="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <span>➕</span>
              <span>کاربر جدید</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div class="mb-8 flex items-center gap-4">
          <div class="relative flex-1 max-w-md">
            <span class="absolute left-4 top-3 text-2xl">🔍</span>
            <input
              type="search"
              placeholder="جستجو برای نام کاربری یا ایمیل..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white shadow-sm"
            />
          </div>
          <span class="text-sm font-medium text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
            {filteredUsers().length} کاربر
          </span>
        </div>

        <Show
          when={!loading()}
          fallback={
            <div class="text-center py-12">
              <p class="text-lg text-slate-600">در حال بارگیری کاربران...</p>
            </div>
          }
        >
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <For each={filteredUsers()}>
              {(user) => (
                <div class="rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all p-6 space-y-4 group">
                  {/* User Header */}
                  <div class="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div class="flex items-center gap-4 flex-1">
                      <div class="relative">
                        <img
                          src={user.avatar || "/avatar-placeholder.png"}
                          alt={user.username}
                          class="h-16 w-16 rounded-full object-cover border-3 border-indigo-200 group-hover:border-indigo-400 transition-colors"
                        />
                        <span class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-lg text-slate-800 truncate">
                          {user.username}
                        </p>
                        <p class="text-sm text-slate-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Roles Section */}
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                        نقش‌ها
                      </span>
                      <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        {user.Roles?.length || 0}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <Show
                        when={user.Roles && user.Roles.length > 0}
                        fallback={
                          <span class="text-xs text-slate-400 italic">
                            هیچ نقشی تعریف نشده
                          </span>
                        }
                      >
                        <For each={user.Roles || []}>
                          {(r: any) => (
                            <span class="px-3 py-1 bg-linear-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700 hover:from-indigo-100 hover:to-indigo-200 transition-all">
                              {r.name}
                            </span>
                          )}
                        </For>
                      </Show>
                    </div>
                  </div>

                  {/* Groups Section */}
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-bold text-purple-600 uppercase tracking-wide">
                        گروه‌ها
                      </span>
                      <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {user.Groups?.length || 0}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <Show
                        when={user.Groups && user.Groups.length > 0}
                        fallback={
                          <span class="text-xs text-slate-400 italic">
                            هیچ گروهی تعریف نشده
                          </span>
                        }
                      >
                        <For each={user.Groups || []}>
                          {(g: any) => (
                            <span class="px-3 py-1 bg-linear-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all">
                              {g.name}
                            </span>
                          )}
                        </For>
                      </Show>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div class="flex gap-3 pt-4">
                    <button
                      class="flex-1 px-4 py-3 bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2 text-sm"
                      onClick={() => startEdit(user)}
                    >
                      <span>✏️</span>
                      <span>ویرایش</span>
                    </button>
                    <button
                      class="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-bold flex items-center justify-center gap-2 hover:scale-105"
                      onClick={() => deleteUser(user.id)}
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>

          <Show when={filteredUsers().length === 0}>
            <div class="text-center py-16">
              <p class="text-2xl mb-2">😴</p>
              <p class="text-lg text-slate-600">هیچ کاربری پیدا نشد</p>
              <p class="text-sm text-slate-500 mt-2">
                جستجوی خود را امتحان کنید یا کاربر جدید اضافه کنید
              </p>
            </div>
          </Show>
        </Show>
      </div>

      {/* Create Modal */}
      <Show when={showCreate()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div class="bg-linear-to-r from-green-600 via-green-700 to-green-800 text-white p-6 rounded-t-2xl border-b-4 border-green-900">
              <h2 class="text-2xl font-bold flex items-center gap-3">
                <span class="text-2xl">➕</span>
                کاربر جدید
              </h2>
              <p class="text-green-100 text-sm mt-1">فرم ایجاد کاربر جدید</p>
            </div>

            {/* Modal Content */}
            <div class="p-6 space-y-4">
              {/* Section 1: Basic Info */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                <h3 class="text-sm font-bold text-green-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span class="text-lg">👤</span>
                  اطلاعات کاربر
                </h3>
                <div class="space-y-3">
                  <input
                    placeholder="نام کاربری"
                    value={newUser().username}
                    onInput={(e) =>
                      setNewUser({
                        ...newUser(),
                        username: e.currentTarget.value,
                      })
                    }
                    class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <input
                    placeholder="ایمیل"
                    value={newUser().email}
                    onInput={(e) =>
                      setNewUser({ ...newUser(), email: e.currentTarget.value })
                    }
                    class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <input
                    type="password"
                    placeholder="رمز عبور"
                    value={newUser().password}
                    onInput={(e) =>
                      setNewUser({
                        ...newUser(),
                        password: e.currentTarget.value,
                      })
                    }
                    class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <input
                    placeholder="تلفن"
                    value={newUser().phone}
                    onInput={(e) =>
                      setNewUser({ ...newUser(), phone: e.currentTarget.value })
                    }
                    class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-green-600 p-4 flex gap-3 rounded-b-2xl">
              <button
                class="flex-1 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
                onClick={createUser}
              >
                <span>✅</span>
                <span>ایجاد</span>
              </button>
              <button
                class="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-bold flex items-center justify-center gap-2"
                onClick={() => setShowCreate(false)}
              >
                <span>❌</span>
                <span>لغو</span>
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Edit Modal */}
      <Show when={showEdit() && editing()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div class="sticky top-0 bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white p-6 rounded-t-2xl border-b-4 border-indigo-900">
              <h2 class="text-2xl font-bold flex items-center gap-3">
                <span class="text-2xl">✏️</span>
                ویرایش {editing()?.username}
              </h2>
              <p class="text-indigo-100 text-sm mt-1">
                ویرایش اطلاعات کاربر، نقش‌ها و گروه‌ها
              </p>
            </div>

            {/* Modal Content */}
            <div class="p-6 space-y-6">
              {/* Section 1: Basic Info */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 hover:border-indigo-300 transition-colors">
                <h3 class="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span class="text-lg">👤</span>
                  اطلاعات شخصی
                </h3>
                <div class="space-y-3">
                  <div>
                    <label class="flex text-xs font-bold text-slate-700 mb-1 items-center gap-2">
                      <span>📝</span>
                      نام کاربری
                    </label>
                    <input
                      placeholder="نام کاربری"
                      value={editing()?.username || ""}
                      onInput={(e) =>
                        setEditing({
                          ...editing(),
                          username: e.currentTarget.value,
                        })
                      }
                      class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                  <div>
                    <label class="flex text-xs font-bold text-slate-700 mb-1 items-center gap-2">
                      <span>📧</span>
                      ایمیل
                    </label>
                    <input
                      placeholder="ایمیل"
                      value={editing()?.email || ""}
                      onInput={(e) =>
                        setEditing({
                          ...editing(),
                          email: e.currentTarget.value,
                        })
                      }
                      class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                  <div>
                    <label class="flex text-xs font-bold text-slate-700 mb-1 items-center gap-2">
                      <span>📱</span>
                      تلفن
                    </label>
                    <input
                      placeholder="تلفن"
                      value={editing()?.phone || ""}
                      onInput={(e) =>
                        setEditing({
                          ...editing(),
                          phone: e.currentTarget.value,
                        })
                      }
                      class="w-full rounded-lg border-2 border-slate-200 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Avatar */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 hover:border-amber-300 transition-colors">
                <h3 class="text-sm font-bold text-amber-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span class="text-lg">🖼️</span>
                  تصویر کاربر
                </h3>
                <div class="flex items-center gap-4">
                  <img
                    src={editing()?.avatar || "/avatar-placeholder.png"}
                    alt={editing()?.username}
                    class="w-20 h-20 rounded-full object-cover border-3 border-amber-200"
                  />
                  <label class="flex-1 cursor-pointer">
                    <div class="w-full px-4 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2">
                      <span>📷</span>
                      <span>انتخاب تصویر</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatar}
                      class="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Section 3: Roles */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 hover:border-sky-300 transition-colors">
                <h3 class="text-sm font-bold text-sky-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span class="text-lg">🎭</span>
                  نقش‌ها
                  <span class="ml-auto px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">
                    {selectedRoles().length}
                  </span>
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <For each={roles()}>
                    {(role) => (
                      <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-sky-50 transition-colors border border-sky-100 hover:border-sky-300">
                        <input
                          type="checkbox"
                          checked={selectedRoles().includes(getId(role))}
                          onChange={(e) => {
                            if (e.currentTarget.checked) {
                              setSelectedRoles([
                                ...selectedRoles(),
                                getId(role),
                              ]);
                            } else {
                              setSelectedRoles(
                                selectedRoles().filter(
                                  (id) => id !== getId(role)
                                )
                              );
                            }
                          }}
                          class="w-4 h-4 rounded border-sky-300 cursor-pointer accent-sky-600"
                        />
                        <span class="text-sm font-medium text-slate-700">
                          {getName(role)}
                        </span>
                      </label>
                    )}
                  </For>
                </div>
              </div>

              {/* Section 4: Groups */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 hover:border-green-300 transition-colors">
                <h3 class="text-sm font-bold text-green-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span class="text-lg">👥</span>
                  گروه‌ها
                  <span class="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {selectedGroups().length}
                  </span>
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <For each={groups()}>
                    {(group) => (
                      <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-colors border border-green-100 hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={selectedGroups().includes(getId(group))}
                          onChange={(e) => {
                            if (e.currentTarget.checked) {
                              setSelectedGroups([
                                ...selectedGroups(),
                                getId(group),
                              ]);
                            } else {
                              setSelectedGroups(
                                selectedGroups().filter(
                                  (id) => id !== getId(group)
                                )
                              );
                            }
                          }}
                          class="w-4 h-4 rounded border-green-300 cursor-pointer accent-green-600"
                        />
                        <span class="text-sm font-medium text-slate-700">
                          {getName(group)}
                        </span>
                      </label>
                    )}
                  </For>
                </div>
              </div>

              {/* Section 5: Permissions */}
              <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 hover:border-pink-300 transition-colors">
                <h3 class="text-sm font-bold text-pink-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span class="text-lg">🔐</span>
                  دسترسی‌ها (از نقش‌ها)
                </h3>
                <Show
                  when={
                    Array.from(
                      new Set(
                        (editing()?.Roles || []).flatMap((r: any) =>
                          (r.Permissions || []).map(
                            (p: any) => p.name ?? p.Name
                          )
                        )
                      )
                    ).length > 0
                  }
                  fallback={
                    <p class="text-sm text-slate-500 italic text-center py-4">
                      هیچ دسترسی‌ای برای نقش‌های انتخاب‌شده تعریف نشده
                    </p>
                  }
                >
                  <div class="flex flex-wrap gap-2">
                    <For
                      each={Array.from(
                        new Set(
                          (editing()?.Roles || []).flatMap((r: any) =>
                            (r.Permissions || []).map(
                              (p: any) => p.name ?? p.Name
                            )
                          )
                        )
                      )}
                    >
                      {(p) => (
                        <span class="px-3 py-2 bg-linear-to-r from-pink-100 to-pink-50 border border-pink-200 rounded-lg text-xs font-medium text-pink-700 hover:from-pink-200 hover:to-pink-100 transition-all">
                          {p as string}
                        </span>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>

            {/* Modal Footer */}
            <div class="sticky bottom-0 bg-linear-to-r from-slate-900 to-slate-800 border-t-4 border-indigo-600 p-4 flex gap-3 rounded-b-2xl">
              <button
                class="flex-1 px-6 py-3 bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold flex items-center justify-center gap-2"
                onClick={saveEdit}
              >
                <span>💾</span>
                <span>ذخیره</span>
              </button>
              <button
                class="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-bold flex items-center justify-center gap-2"
                onClick={() => {
                  setShowEdit(false);
                  setEditing(null);
                }}
              >
                <span>❌</span>
                <span>بستن</span>
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Users;
