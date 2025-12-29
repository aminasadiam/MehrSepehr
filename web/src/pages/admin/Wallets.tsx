import { Component, createSignal, onMount, For, Show } from "solid-js";
import { walletApi, usersApi } from "../../utils/api";

const Wallets: Component = () => {
  const [users, setUsers] = createSignal<any[]>([]);
  const [selectedUserId, setSelectedUserId] = createSignal<number | null>(null);
  const [selectedUserData, setSelectedUserData] = createSignal<any | null>(
    null
  );
  const [wallet, setWallet] = createSignal<any | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [amount, setAmount] = createSignal("");
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");

  const loadUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers((res.data as any) || []);
    } catch (e) {
      console.error(e);
      setError("خطا در بارگذاری کاربران");
    }
  };

  const loadWallet = async (userId: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await walletApi.adminGetById(userId);
      setWallet((res.data as any) || null);
      const user = users().find((u) => (u.ID || u.id) === userId);
      setSelectedUserData(user || null);
    } catch (e) {
      console.error(e);
      setWallet(null);
      setError("خطا در بارگذاری کیف پول");
    } finally {
      setLoading(false);
    }
  };

  const addBalance = async () => {
    const userId = selectedUserId();
    const amt = Number(amount());
    setError("");
    setSuccess("");

    if (!userId) {
      setError("لطفا کاربر را انتخاب کنید");
      return;
    }
    if (!amt || amt <= 0) {
      setError("مقدار باید بیشتر از صفر باشد");
      return;
    }

    try {
      await walletApi.adminAddBalance(userId, amt);
      setSuccess(`✓ موجودی ${amt.toLocaleString()} تومان با موفقیت افزوده شد`);
      setAmount("");
      setTimeout(() => setSuccess(""), 3000);
      await loadWallet(userId);
    } catch (e) {
      console.error(e);
      const errMsg = (e as any)?.message || "خطا در افزودن موجودی";
      setError(`✗ ${errMsg}`);
    }
  };

  onMount(loadUsers);

  return (
    <div
      dir="rtl"
      class="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50"
    >
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-cyan-600 via-blue-700 to-blue-800 text-white p-8 rounded-3xl border-b-4 border-blue-900 mb-8 shadow-2xl">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h1 class="text-4xl font-extrabold flex items-center gap-3">
                <span class="text-5xl">💳</span>
                مدیریت کیف‌پول‌ها
              </h1>
              <p class="text-blue-100 mt-3 text-lg font-medium">
                مشاهده، ویرایش و مدیریت موجودی کیف‌پول کاربران
              </p>
            </div>
            <div class="hidden lg:flex items-center justify-center w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20">
              <span class="text-6xl">💰</span>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        <Show when={error()}>
          <div class="mb-6 px-6 py-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold shadow-lg animate-pulse">
            <span class="text-2xl">⚠️</span>
            <span>{error()}</span>
            <button
              type="button"
              onClick={() => setError("")}
              class="mr-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </Show>

        <Show when={success()}>
          <div class="mb-6 px-6 py-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center gap-3 text-green-700 font-bold shadow-lg">
            <span class="text-2xl">✅</span>
            <span>{success()}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              class="mr-auto text-green-400 hover:text-green-600"
            >
              ✕
            </button>
          </div>
        </Show>

        {/* Main Grid */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: User Selection & Add Balance */}
          <div class="lg:col-span-1 space-y-6">
            {/* User Selector Card */}
            <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all p-6 hover:border-cyan-300">
              <h2 class="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span class="text-2xl">👥</span>
                انتخاب کاربر
              </h2>
              <select
                value={selectedUserId() ?? ""}
                onInput={(e) => {
                  const userId = e.currentTarget.value
                    ? Number(e.currentTarget.value)
                    : null;
                  setSelectedUserId(userId);
                  if (userId) loadWallet(userId);
                }}
                class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium bg-slate-50 hover:bg-white text-slate-900"
              >
                <option value="">🔍 انتخاب کاربر...</option>
                <For each={users()}>
                  {(user: any) => (
                    <option value={user.ID ?? user.id} class="bg-white">
                      {user.Username ?? user.username} •{" "}
                      {user.Email ?? user.email}
                    </option>
                  )}
                </For>
              </select>
            </div>

            {/* Add Balance Card */}
            <Show when={selectedUserId()}>
              <div class="bg-linear-to-br from-cyan-50 via-blue-50 to-blue-100 rounded-3xl border-2 border-cyan-200 shadow-lg p-6 hover:shadow-xl transition-all">
                <h2 class="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span class="text-2xl">➕</span>
                  افزودن موجودی
                </h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      💵 مقدار (تومان)
                    </label>
                    <input
                      type="number"
                      placeholder="مثال: 100,000"
                      value={amount()}
                      onInput={(e) => setAmount(e.currentTarget.value)}
                      class="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-bold text-lg bg-white"
                    />
                    <p class="text-xs text-slate-600 mt-2 font-medium">
                      موجودی فعلی:{" "}
                      <span class="font-bold text-cyan-700">
                        {Number(
                          wallet()?.Balance ?? wallet()?.balance ?? 0
                        ).toLocaleString()}{" "}
                        تومان
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={addBalance}
                    disabled={!amount() || Number(amount()) <= 0}
                    class="w-full px-4 py-3 bg-linear-to-r from-cyan-500 via-blue-600 to-blue-700 text-white rounded-xl hover:shadow-xl transition-all hover:scale-105 font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span>💳</span>
                    افزودن موجودی
                  </button>
                </div>
              </div>
            </Show>
          </div>

          {/* Right: Wallet Info */}
          <div class="lg:col-span-2">
            <Show
              when={!loading() && selectedUserId()}
              fallback={
                <Show when={loading()}>
                  <div class="flex items-center justify-center py-16 bg-white rounded-3xl border-2 border-slate-200 shadow-lg">
                    <div class="text-center">
                      <div class="text-6xl mb-4 animate-bounce">⏳</div>
                      <p class="text-lg text-slate-600 font-bold">
                        در حال بارگذاری اطلاعات کیف پول...
                      </p>
                    </div>
                  </div>
                </Show>
              }
            >
              <Show
                when={wallet()}
                fallback={
                  <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-12 text-center">
                    <div class="text-7xl mb-4">📭</div>
                    <h3 class="text-2xl font-extrabold text-slate-800 mb-2">
                      کیف پول یافت نشد
                    </h3>
                    <p class="text-slate-600 font-medium">
                      این کاربر هنوز کیف پول فعال ندارد
                    </p>
                  </div>
                }
              >
                <div class="space-y-6">
                  {/* User Info Card */}
                  <Show when={selectedUserData()}>
                    <div class="bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 shadow-lg p-6">
                      <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                          {selectedUserData()?.Username?.[0]?.toUpperCase() ||
                            selectedUserData()?.username?.[0]?.toUpperCase() ||
                            "👤"}
                        </div>
                        <div class="flex-1">
                          <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            کاربر فعال
                          </p>
                          <p class="text-xl font-extrabold text-slate-900">
                            {selectedUserData()?.Username ||
                              selectedUserData()?.username}
                          </p>
                          <p class="text-sm text-slate-600 font-medium">
                            {selectedUserData()?.Email ||
                              selectedUserData()?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Show>

                  {/* Balance Display Card */}
                  <div class="bg-linear-to-br from-cyan-500 via-blue-600 to-blue-700 rounded-3xl shadow-2xl p-8 text-white border-2 border-blue-400 overflow-hidden relative">
                    <div class="absolute inset-0 opacity-10 bg-linear-to-br from-white to-transparent"></div>
                    <div class="relative z-10">
                      <p class="text-sm opacity-90 mb-3 font-bold uppercase tracking-widest">
                        💰 موجودی فعلی کیف پول
                      </p>
                      <div class="mb-4">
                        <div class="text-6xl font-extrabold tracking-tight">
                          {Number(
                            wallet()?.Balance ?? wallet()?.balance ?? 0
                          ).toLocaleString()}
                        </div>
                        <p class="text-2xl font-bold mt-2 opacity-90">تومان</p>
                      </div>
                      <div class="pt-4 border-t-2 border-white/20 flex items-center justify-between text-sm">
                        <span class="opacity-75">
                          ارز:{" "}
                          {wallet()?.Currency ?? wallet()?.currency ?? "TRY"}
                        </span>
                        <span class="opacity-75 font-bold">
                          شناسه: #{wallet()?.ID ?? wallet()?.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Details Grid */}
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-linear-to-br from-blue-50 to-cyan-100 rounded-2xl p-5 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all">
                      <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                        🆔 شناسه کیف پول
                      </p>
                      <p class="text-2xl font-extrabold text-blue-900 font-mono">
                        {wallet()?.ID ?? wallet()?.id}
                      </p>
                    </div>
                    <div class="bg-linear-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border-2 border-green-200 shadow-md hover:shadow-lg transition-all">
                      <p class="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">
                        👤 شناسه کاربر
                      </p>
                      <p class="text-2xl font-extrabold text-green-900 font-mono">
                        {wallet()?.UserID ?? wallet()?.user_id}
                      </p>
                    </div>
                    <div class="bg-linear-to-br from-purple-50 to-violet-100 rounded-2xl p-5 border-2 border-purple-200 shadow-md hover:shadow-lg transition-all">
                      <p class="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">
                        📅 تاریخ ایجاد
                      </p>
                      <p class="text-sm font-bold text-purple-900">
                        {wallet()?.CreatedAt
                          ? new Date(wallet().CreatedAt).toLocaleString("fa-IR")
                          : wallet()?.created_at
                          ? new Date(wallet().created_at).toLocaleString(
                              "fa-IR"
                            )
                          : "—"}
                      </p>
                    </div>
                    <div class="bg-linear-to-br from-amber-50 to-orange-100 rounded-2xl p-5 border-2 border-amber-200 shadow-md hover:shadow-lg transition-all">
                      <p class="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
                        🔄 آخرین به‌روزرسانی
                      </p>
                      <p class="text-sm font-bold text-amber-900">
                        {wallet()?.UpdatedAt
                          ? new Date(wallet().UpdatedAt).toLocaleString("fa-IR")
                          : wallet()?.updated_at
                          ? new Date(wallet().updated_at).toLocaleString(
                              "fa-IR"
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallets;
