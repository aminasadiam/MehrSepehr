import { Show, createResource, createSignal } from "solid-js";
import { walletApi } from "../utils/api";
import { Wallet, normalizeWallet } from "../types/api";

const formatPrice = (value?: number, currency?: string) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} ${currency ?? "تومان"}`;

const WalletPage = () => {
  const [amount, setAmount] = createSignal<number>(0);
  const [status, setStatus] = createSignal<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [wallet, { refetch }] = createResource<Wallet | null>(async () => {
    const response = await walletApi.getMyWallet();
    return response.data ? normalizeWallet(response.data) : null;
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setStatus(null);
    if (amount() <= 0) {
      setStatus({
        type: "error",
        message: "مبلغ شارژ باید بیشتر از صفر باشد.",
      });
      return;
    }

    try {
      await walletApi.addBalance(amount());
      setAmount(0);
      setStatus({
        type: "success",
        message: "موجودی کیف پول با موفقیت به‌روزرسانی شد.",
      });
      refetch();
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error?.message || "خطا در افزایش موجودی",
      });
    }
  };

  return (
    <div class="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 py-12">
      <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        <div>
          <p class="section-kicker">کیف پول دیجیتال</p>
          <h1 class="text-3xl font-semibold text-slate-900">مدیریت موجودی</h1>
        </div>

        <Show
          when={!wallet.loading}
          fallback={
            <div class="rounded-2xl border-2 border-slate-200 bg-white px-6 py-12 text-center text-slate-600 shadow-lg">
              در حال بارگیری...
            </div>
          }
        >
          <Show
            when={wallet()}
            fallback={<p>کیف پول یافت نشد. لطفاً با پشتیبانی تماس بگیرید.</p>}
          >
            {(w) => (
              <div class="space-y-6">
                <div class="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-4 shadow-2xl">
                  <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold text-slate-900">
                      موجودی فعلی
                    </h2>
                    <span class="text-lg font-bold text-indigo-600">
                      {formatPrice(w().balance, "تومان")}
                    </span>
                  </div>
                  <p class="text-sm text-slate-500">ارز: تومان</p>
                </div>

                <form class="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      class="block text-sm font-semibold text-slate-600"
                      for="amount"
                    >
                      مبلغ شارژ (تومان)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      min="0"
                      value={amount()}
                      onInput={(event) =>
                        setAmount(Number(event.currentTarget.value))
                      }
                      class="mt-2 w-full rounded-2xl border-2 border-cyan-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 bg-white"
                      placeholder="مثلاً ۵۰۰۰۰۰"
                    />
                  </div>

                  <button
                    class="w-full px-4 py-3 bg-linear-to-r from-cyan-500 via-blue-600 to-blue-700 text-white rounded-xl hover:shadow-xl transition-all hover:scale-105 font-extrabold text-lg flex items-center justify-center gap-2"
                    type="submit"
                  >
                    <span>💳</span>
                    افزایش موجودی
                  </button>

                  <Show when={status()}>
                    {(state) => (
                      <div
                        class={`rounded-2xl px-4 py-3 text-sm ${
                          state().type === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {state().message}
                      </div>
                    )}
                  </Show>
                </form>
              </div>
            )}
          </Show>
        </Show>
      </section>
    </div>
  );
};

export default WalletPage;
