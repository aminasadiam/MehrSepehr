import { For, Show, createResource } from "solid-js";
import { A } from "@solidjs/router";
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
    <div class="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 py-12">
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="section-kicker">مدیریت خرید</p>
            <h1 class="text-3xl font-semibold text-slate-900">
              سفارش‌های ثبت شده
            </h1>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 bg-white shadow-md hover:shadow-lg"
            type="button"
            onClick={() => refetch()}
          >
            <i class="fa-solid fa-rotate-left text-sm"></i>
            بروزرسانی
          </button>
        </div>

        <Show
          when={!orders.loading}
          fallback={
            <div class="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600">
              در حال بارگیری...
            </div>
          }
        >
          <Show
            when={orders()?.length}
            fallback={
              <p class="text-center text-slate-600">هیچ سفارشی یافت نشد.</p>
            }
          >
            <div class="grid gap-6 lg:grid-cols-2">
              <For each={orders()}>
                {(order) => {
                  const statusClass =
                    statusStyles[order.status?.toLowerCase() || "pending"];
                  return (
                    <article class="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-4 shadow-2xl">
                      <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p class="text-sm text-slate-500">شماره سفارش</p>
                          <h3 class="text-xl font-bold text-slate-900">
                            #{order.id}
                          </h3>
                        </div>
                        <span
                          class={`inline-block rounded-full px-4 py-1 text-sm font-medium ${statusClass}`}
                        >
                          {order.status || "در حال بررسی"}
                        </span>
                      </div>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p class="text-slate-500">تاریخ ثبت</p>
                          <p class="text-slate-700">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p class="text-slate-500">مبلغ کل</p>
                          <p class="font-bold text-indigo-600">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <div class="col-span-2">
                          <p class="text-slate-500">روش پرداخت</p>
                          <p class="text-slate-700">
                            {order.paymentMethod || "کیف پول"}
                          </p>
                        </div>
                        <div class="col-span-2">
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
                                    {formatPrice(detail.unitPrice)}
                                  </p>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                      <div class="flex items-center justify-between mt-4">
                        <A
                          href={`/orders/${order.id}`}
                          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 bg-white hover:shadow-md text-sm"
                        >
                          <i class="fa-solid fa-eye"></i>
                          مشاهده سفارش
                        </A>
                        <span class="text-xs text-slate-400">
                          شماره پیگیری: #{order.id}
                        </span>
                      </div>
                    </article>
                  );
                }}
              </For>
            </div>
          </Show>
        </Show>
      </section>
    </div>
  );
};

export default Orders;
