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
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div>
        <p class="section-kicker">کیف پول دیجیتال</p>
        <h1 class="text-3xl font-semibold text-slate-900">موجودی من</h1>
      </div>

      <Show
        when={!wallet.loading}
        fallback={
          <div class="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            در حال بارگذاری کیف پول...
          </div>
        }
      >
        <Show
          when={wallet()}
          fallback={
            <div class="rounded-3xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
              کیف پولی برای شما ثبت نشده است.
            </div>
          }
        >
          {(data) => (
            <div class="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <article class="rounded-3xl border border-slate-100 bg-linear-to-br from-blue-500 to-indigo-600 p-8 text-white shadow-xl">
                <p class="text-sm">موجودی فعلی</p>
                <p class="mt-2 text-4xl font-semibold">
                  {formatPrice(data().balance, data().currency)}
                </p>
                <p class="mt-6 text-sm text-blue-100">
                  آخرین بروزرسانی:{" "}
                  {data().updatedAt
                    ? new Date(data().updatedAt!).toLocaleString("fa-IR")
                    : "دسترسی ندارد"}
                </p>
              </article>

              <form
                class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-5"
                onSubmit={handleSubmit}
              >
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
                    class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="مثلاً ۵۰۰۰۰۰"
                  />
                </div>

                <button class="btn btn-primary w-full" type="submit">
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
  );
};

export default WalletPage;
