import { Component, createSignal, onMount, For, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { usersApi, adminApi, walletApi, ordersApi } from "../../utils/api";

const UserDetail: Component = () => {
  const params = useParams();
  const id = Number(params.id);

  const [user, setUser] = createSignal<any | null>(null);
  const [roles, setRoles] = createSignal<any[]>([]);
  const [roleToAdd, setRoleToAdd] = createSignal<number | null>(null);
  const [orders, setOrders] = createSignal<any[]>([]);
  const [wallet, setWallet] = createSignal<any | null>(null);
  const [loading, setLoading] = createSignal(true);

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, allOrders] = await Promise.all([
        usersApi.getById(id),
        adminApi.roles.getAll(),
        ordersApi.adminGetAll(),
      ]);
      const u = (uRes.data as any) || null;
      setUser(u);
      setRoles((rRes.data as any) || []);

      const all = (allOrders.data as any) || [];
      setOrders(
        all.filter(
          (o: any) =>
            (o.User?.ID ?? o.user_id ?? o.user?.id) ===
            ((uRes.data as any)?.ID ?? (uRes.data as any)?.id)
        )
      );

      try {
        const w = await walletApi.adminGetById(id);
        setWallet((w.data as any) || null);
      } catch (_) {
        setWallet(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  onMount(load);

  const addRoleToUser = async () => {
    const u = user();
    if (!u) return;
    const uid = u.ID ?? u.id;
    const rid = roleToAdd();
    if (!rid) return alert("ابتدا نقش را انتخاب کنید");
    try {
      await usersApi.addRole(uid, rid);
      setRoleToAdd(null);
      await load();
      alert("نقش اضافه شد");
    } catch (e) {
      console.error(e);
      alert("خطا در افزودن نقش");
    }
  };

  const removeRoleFromUser = async (rid: number) => {
    const u = user();
    if (!u) return;
    const uid = u.ID ?? u.id;
    try {
      await usersApi.removeRole(uid, rid);
      await load();
      alert("نقش حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف نقش");
    }
  };

  const saveBasic = async () => {
    const u = user();
    if (!u) return;
    const uid = u.ID ?? u.id;
    const payload: any = {
      username: u.Username ?? u.username,
      email: u.Email ?? u.email,
      phone: u.phone ?? u.Phone,
    };
    if ((u as any).password) payload.password = (u as any).password;
    try {
      await usersApi.update(uid, payload);
      await load();
      alert("ذخیره شد");
    } catch (e) {
      console.error(e);
      alert("خطا در ذخیره‌سازی");
    }
  };

  const addBalance = async () => {
    const amtStr = prompt("مقدار برای افزودن به کیف پول:");
    if (!amtStr) return;
    const amt = Number(amtStr);
    if (!amt) return alert("مقدار معتبر نیست");
    try {
      await walletApi.adminAddBalance(id, amt);
      await load();
      alert("افزایش یافت");
    } catch (e) {
      console.error(e);
      alert("خطا در افزودن موجودی");
    }
  };

  return (
    <div class="p-6" dir="rtl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <A href="/admin/users" class="text-sm text-slate-500">
            بازگشت
          </A>
          <h2 class="text-2xl font-semibold">جزئیات کاربر</h2>
        </div>
      </div>

      <Show when={!loading()} fallback={<div>در حال بارگذاری...</div>}>
        <Show when={user()} fallback={<div>کاربر پیدا نشد</div>}>
          <div>
            <section class="bg-white p-4 rounded shadow mb-4">
              <h3 class="font-semibold mb-2">اطلاعات پایه</h3>
              <div class="grid grid-cols-1 gap-3 max-w-xl">
                <label class="text-sm">
                  نام کاربری
                  <input
                    value={user()?.Username ?? user()?.username ?? ""}
                    onInput={(e: any) =>
                      setUser({
                        ...user(),
                        Username: e.currentTarget.value,
                        username: e.currentTarget.value,
                      })
                    }
                    class="border rounded px-2 py-1 w-full"
                  />
                </label>
                <label class="text-sm">
                  ایمیل
                  <input
                    value={user()?.Email ?? user()?.email ?? ""}
                    onInput={(e: any) =>
                      setUser({
                        ...user(),
                        Email: e.currentTarget.value,
                        email: e.currentTarget.value,
                      })
                    }
                    class="border rounded px-2 py-1 w-full"
                  />
                </label>
                <label class="text-sm">
                  شماره تلفن
                  <input
                    value={user()?.phone ?? user()?.Phone ?? ""}
                    onInput={(e: any) =>
                      setUser({ ...user(), phone: e.currentTarget.value })
                    }
                    class="border rounded px-2 py-1 w-full"
                  />
                </label>
                <label class="text-sm">
                  رمز جدید (خالی بگذارید اگر نمی‌خواهید تغییر دهید)
                  <input
                    type="password"
                    onInput={(e: any) =>
                      setUser({ ...user(), password: e.currentTarget.value })
                    }
                    class="border rounded px-2 py-1 w-full"
                  />
                </label>
                <div class="flex gap-2 justify-end">
                  <button class="btn btn-primary" onClick={saveBasic}>
                    ذخیره
                  </button>
                </div>
              </div>
            </section>

            <section class="bg-white p-4 rounded shadow mb-4">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold mb-2">نقش‌ها</h3>
              </div>

              <div class="flex gap-2 items-center mt-2">
                <select
                  class="border rounded px-2 py-1"
                  value={roleToAdd() ?? ""}
                  onInput={(e: any) =>
                    setRoleToAdd(Number(e.currentTarget.value) || null)
                  }
                >
                  <option value="">انتخاب نقش...</option>
                  <For each={roles()}>
                    {(r: any) => (
                      <option value={Number(r.ID ?? r.id)}>
                        {r.Name ?? r.name}
                      </option>
                    )}
                  </For>
                </select>
                <button class="btn btn-sm btn-primary" onClick={addRoleToUser}>
                  افزودن نقش
                </button>
              </div>

              <div class="mt-4">
                <div class="text-sm text-slate-600 mb-2">نقش‌های کاربر</div>
                <div class="bg-white border rounded">
                  <table class="min-w-full">
                    <thead class="bg-slate-50">
                      <tr>
                        <th class="px-4 py-2 text-right">نام نقش</th>
                        <th class="px-4 py-2 text-right">توضیحات</th>
                        <th class="px-4 py-2 text-right">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={user()?.Roles || []}>
                        {(r: any) => {
                          const rid = Number(r.ID ?? r.id);
                          return (
                            <tr class="border-t">
                              <td class="px-4 py-2 text-right">
                                {r.Name ?? r.name}
                              </td>
                              <td class="px-4 py-2 text-right">
                                {r.Description ?? r.description ?? ""}
                              </td>
                              <td class="px-4 py-2 text-right">
                                <button
                                  class="btn btn-sm btn-danger"
                                  onClick={() => {
                                    if (
                                      confirm("آیا از حذف این نقش مطمئن هستید؟")
                                    )
                                      removeRoleFromUser(rid);
                                  }}
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          );
                        }}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section class="bg-white p-4 rounded shadow mb-4">
              <h3 class="font-semibold mb-2">دسترسی‌ها</h3>
              <div class="flex gap-2 flex-wrap">
                {Array.from(
                  new Set(
                    (user()?.Roles || []).flatMap((r: any) =>
                      (r.Permissions || []).map((p: any) => p.Name ?? p.name)
                    )
                  )
                ).map((p: any) => (
                  <span class="px-2 py-1 bg-slate-50 rounded">{p}</span>
                ))}
              </div>
            </section>

            <section class="bg-white p-4 rounded shadow mb-4">
              <h3 class="font-semibold mb-2">کیف پول</h3>
              <div>موجودی: {wallet()?.Balance ?? wallet()?.balance ?? "—"}</div>
              <div class="mt-2">
                <button class="btn btn-sm" onClick={addBalance}>
                  افزایش موجودی
                </button>
              </div>
            </section>

            <section class="bg-white p-4 rounded shadow mb-4">
              <h3 class="font-semibold mb-2">سفارش‌ها</h3>
              <For each={orders()}>
                {(o: any) => (
                  <div class="border rounded p-2 mb-2">
                    <div>سفارش #{o.ID ?? o.id}</div>
                    <div>وضعیت: {o.Status ?? o.status}</div>
                    <div>مبلغ: {o.Total ?? o.total}</div>
                    <A
                      href={`/admin/orders/${o.ID ?? o.id}`}
                      class="text-sm text-blue-600"
                    >
                      جزییات سفارش
                    </A>
                  </div>
                )}
              </For>
            </section>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default UserDetail;
