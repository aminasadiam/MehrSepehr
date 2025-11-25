import { For, Show, createResource } from "solid-js";
import { ordersApi } from "../utils/api";
import { Order, normalizeOrder } from "../types/api";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatPrice = (value?: number) =>
  `${Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;
const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

const Orders = () => {
  const [orders, { refetch }] = createResource<Order[]>(async () => {
    const response = await ordersApi.getAll();
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map(normalizeOrder);
  });

  return (
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="section-kicker">مدیریت خرید</p>
          <h1 class="text-3xl font-semibold text-slate-900">
            سفارش‌های ثبت شده
          </h1>
        </div>
        <button class="btn btn-outline" type="button" onClick={() => refetch()}>
          بروزرسانی
          <i class="fa-solid fa-rotate-left text-sm"></i>
        </button>
      </div>

      <Show
        when={!orders.loading}
        fallback={
          <div class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            در حال خواندن سفارش‌ها...
          </div>
        }
      >
        <Show
          when={(orders() ?? []).length > 0}
          fallback={
            <div class="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              هنوز سفارشی ثبت نکرده‌اید.
            </div>
          }
        >
          <div class="space-y-4">
            <For each={orders()}>
              {(order) => (
                <article class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p class="text-sm text-slate-500">سفارش #{order.id}</p>
                      <p class="text-base font-semibold text-slate-900">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      class={`rounded-full px-4 py-1 text-sm font-medium ${
                        statusStyles[order.status.toLowerCase()] ??
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div class="mt-4 grid gap-4 sm:grid-cols-2">
                    <div class="rounded-2xl border border-slate-100 p-4">
                      <p class="text-sm text-slate-500">جمع سفارش</p>
                      <p class="text-xl font-semibold text-slate-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div class="rounded-2xl border border-slate-100 p-4">
                      <p class="text-sm text-slate-500">آدرس ارسال</p>
                      <p class="text-slate-700">
                        {order.address || "در حال تکمیل توسط مشتری"}
                      </p>
                    </div>
                  </div>
                  <Show when={order.details?.length}>
                    <div class="mt-6 rounded-2xl border border-slate-100 p-4">
                      <p class="text-sm font-semibold text-slate-600">
                        اقلام سفارش
                      </p>
                      <div class="mt-4 space-y-3">
                        <For each={order.details}>
                          {(detail) => (
                            <div class="flex flex-wrap items-center justify-between text-sm text-slate-600">
                              <div>
                                <p class="font-medium text-slate-900">
                                  {detail.product?.name ??
                                    `کالا #${detail.productId}`}
                                </p>
                                <p>تعداد: {detail.quantity}</p>
                              </div>
                              <p class="font-semibold">
                                {formatPrice(detail.price)}
                              </p>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                </article>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </section>
  );
};

export default Orders;
