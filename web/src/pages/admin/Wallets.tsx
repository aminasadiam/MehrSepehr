import { Component, createSignal, onMount, For, Show } from "solid-js";
import { walletApi, usersApi } from "../../utils/api";

const Wallets: Component = () => {
  const [users, setUsers] = createSignal<any[]>([]);
  const [selectedUserId, setSelectedUserId] = createSignal<number | null>(null);
  const [wallet, setWallet] = createSignal<any | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [amount, setAmount] = createSignal("");

  const loadUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers((res.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری کاربران");
    }
  };

  const loadWallet = async (userId: number) => {
    setLoading(true);
    try {
      const res = await walletApi.adminGetById(userId);
      setWallet((res.data as any) || null);
    } catch (e) {
      console.error(e);
      setWallet(null);
      alert("خطا در بارگذاری کیف پول");
    } finally {
      setLoading(false);
    }
  };

  const addBalance = async () => {
    const userId = selectedUserId();
    const amt = Number(amount());
    if (!userId) return alert("لطفا کاربر را انتخاب کنید");
    if (!amt || amt <= 0) return alert("مقدار معتبر وارد کنید");
    try {
      await walletApi.adminAddBalance(userId, amt);
      setAmount("");
      await loadWallet(userId);
      alert("موجودی با موفقیت افزوده شد");
    } catch (e) {
      console.error(e);
      alert("خطا در افزودن موجودی");
    }
  };

  onMount(loadUsers);

  return (
    <div dir="rtl">
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت کیف‌پول‌ها</h2>
        <p class="text-slate-600">مشاهده و مدیریت موجودی کیف‌پول کاربران</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-2">
            انتخاب کاربر
          </label>
          <select
            value={selectedUserId() ?? ""}
            onInput={(e) => {
              const userId = e.currentTarget.value ? Number(e.currentTarget.value) : null;
              setSelectedUserId(userId);
              if (userId) loadWallet(userId);
            }}
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">انتخاب کاربر...</option>
            <For each={users()}>
              {(user: any) => (
                <option value={user.ID ?? user.id}>
                  {user.Username ?? user.username} ({user.Email ?? user.email})
                </option>
              )}
            </For>
          </select>
        </div>
      </div>

      <Show when={selectedUserId() && !loading()}>
        <Show
          when={wallet()}
          fallback={
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div class="text-6xl mb-4">💳</div>
              <h3 class="text-xl font-semibold text-slate-800 mb-2">
                کیف پول یافت نشد
              </h3>
              <p class="text-slate-600">این کاربر کیف پول ندارد</p>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div class="text-sm opacity-90 mb-2">موجودی فعلی</div>
              <div class="text-4xl font-bold mb-4">
                {Number(wallet()?.Balance ?? wallet()?.balance ?? 0).toLocaleString()} تومان
              </div>
              <div class="text-sm opacity-75">
                ارز: {wallet()?.Currency ?? wallet()?.currency ?? "USD"}
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 class="text-lg font-semibold mb-4">افزودن موجودی</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    مقدار (تومان)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 100000"
                    value={amount()}
                    onInput={(e) => setAmount(e.currentTarget.value)}
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={addBalance}
                  class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  افزودن موجودی
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold mb-4">اطلاعات کیف پول</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-slate-600 mb-1">شناسه کیف پول</div>
                <div class="font-semibold">{wallet()?.ID ?? wallet()?.id}</div>
              </div>
              <div>
                <div class="text-sm text-slate-600 mb-1">شناسه کاربر</div>
                <div class="font-semibold">{wallet()?.UserID ?? wallet()?.user_id}</div>
              </div>
              <div>
                <div class="text-sm text-slate-600 mb-1">تاریخ ایجاد</div>
                <div class="font-semibold">
                  {wallet()?.CreatedAt
                    ? new Date(wallet()?.CreatedAt).toLocaleString("fa-IR")
                    : wallet()?.created_at
                    ? new Date(wallet()?.created_at).toLocaleString("fa-IR")
                    : "—"}
                </div>
              </div>
              <div>
                <div class="text-sm text-slate-600 mb-1">آخرین به‌روزرسانی</div>
                <div class="font-semibold">
                  {wallet()?.UpdatedAt
                    ? new Date(wallet()?.UpdatedAt).toLocaleString("fa-IR")
                    : wallet()?.updated_at
                    ? new Date(wallet()?.updated_at).toLocaleString("fa-IR")
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </Show>
      </Show>

      <Show when={loading()}>
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="text-4xl mb-4">⏳</div>
            <div class="text-slate-600">در حال بارگذاری...</div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Wallets;
