import { Component, createSignal, onMount, For, Show, createMemo } from "solid-js";
import { ordersApi, usersApi } from "../../utils/api";
import { A } from "@solidjs/router";

const Orders: Component = () => {
  const [orders, setOrders] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [statusFilter, setStatusFilter] = createSignal<string>("all");
  const [selectedOrder, setSelectedOrder] = createSignal<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.adminGetAll();
      setOrders((res.data as any) || []);
    } catch (e) {
      console.error(e);
      alert("خطا در بارگذاری سفارش‌ها");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.adminUpdate(orderId, { status: newStatus });
      await load();
      alert("وضعیت سفارش به‌روزرسانی شد");
    } catch (e) {
      console.error(e);
      alert("خطا در به‌روزرسانی وضعیت");
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("آیا از حذف این سفارش مطمئن هستید؟")) return;
    try {
      await ordersApi.adminDelete(id);
      await load();
      alert("سفارش حذف شد");
    } catch (e) {
      console.error(e);
      alert("خطا در حذف سفارش");
    }
  };

  const filteredOrders = createMemo(() => {
    let filtered = orders();
    const q = search().trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((o: any) => {
        const id = String(o.ID ?? o.id);
        const status = String(o.Status ?? o.status ?? "").toLowerCase();
        const total = String(o.Total ?? o.total ?? "");
        const user = o.User?.Username ?? o.User?.username ?? "";
        return (
          id.includes(q) ||
          status.includes(q) ||
          total.includes(q) ||
          user.toLowerCase().includes(q)
        );
      });
    }
    if (statusFilter() !== "all") {
      filtered = filtered.filter(
        (o: any) => (o.Status ?? o.status) === statusFilter()
      );
    }
    return filtered;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    shipped: "bg-purple-100 text-purple-800",
  };

  const getStatusColor = (status: string) => {
    return statusColors[status.toLowerCase()] || "bg-slate-100 text-slate-800";
  };

  onMount(load);

  return (
    <div dir="rtl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">مدیریت سفارش‌ها</h2>
          <p class="text-slate-600">مشاهده و مدیریت تمام سفارش‌های سیستم</p>
        </div>
        <button
          onClick={load}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          <span>بارگذاری مجدد</span>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <input
              type="text"
              placeholder="جستجو در سفارش‌ها..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <select
            value={statusFilter()}
            onInput={(e) => setStatusFilter(e.currentTarget.value)}
            class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="processing">در حال پردازش</option>
            <option value="shipped">ارسال شده</option>
            <option value="completed">تکمیل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
          <div class="flex items-center justify-end text-slate-600">
            <span class="text-sm">تعداد: {filteredOrders().length}</span>
          </div>
        </div>
      </div>

      <Show
        when={!loading()}
        fallback={
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="text-4xl mb-4">⏳</div>
              <div class="text-slate-600">در حال بارگذاری...</div>
            </div>
          </div>
        }
      >
        <Show
          when={filteredOrders().length > 0}
          fallback={
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div class="text-6xl mb-4">📦</div>
              <h3 class="text-xl font-semibold text-slate-800 mb-2">
                سفارشی یافت نشد
              </h3>
              <p class="text-slate-600">هیچ سفارشی با این فیلترها وجود ندارد</p>
            </div>
          }
        >
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      شماره سفارش
                    </th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      کاربر
                    </th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      مبلغ کل
                    </th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      تاریخ
                    </th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                  <For each={filteredOrders()}>
                    {(order: any) => (
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-semibold text-slate-900">
                            #{order.ID ?? order.id}
                          </div>
                          <div class="text-xs text-slate-500">
                            {order.OrderDetails?.length || 0} آیتم
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-slate-900">
                            {order.User?.Username ?? order.User?.username ?? "نامشخص"}
                          </div>
                          <div class="text-xs text-slate-500">
                            {order.User?.Email ?? order.User?.email ?? ""}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-semibold text-slate-900">
                            {Number(order.Total ?? order.total ?? 0).toLocaleString()} تومان
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.Status ?? order.status ?? "pending"}
                            onChange={(e) =>
                              updateStatus(order.ID ?? order.id, e.currentTarget.value)
                            }
                            class={`text-xs font-medium px-3 py-1 rounded-full border-0 ${getStatusColor(
                              order.Status ?? order.status ?? "pending"
                            )} cursor-pointer focus:ring-2 focus:ring-indigo-500`}
                          >
                            <option value="pending">در انتظار</option>
                            <option value="processing">در حال پردازش</option>
                            <option value="shipped">ارسال شده</option>
                            <option value="completed">تکمیل شده</option>
                            <option value="cancelled">لغو شده</option>
                          </select>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {order.CreatedAt
                            ? new Date(order.CreatedAt).toLocaleDateString("fa-IR")
                            : order.created_at
                            ? new Date(order.created_at).toLocaleDateString("fa-IR")
                            : "—"}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div class="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              class="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
                            >
                              جزئیات
                            </button>
                            <button
                              onClick={() => deleteOrder(order.ID ?? order.id)}
                              class="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
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
          </div>
        </Show>
      </Show>

      {/* Order Detail Modal */}
      <Show when={selectedOrder()}>
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div class="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold">
                  جزئیات سفارش #{selectedOrder()?.ID ?? selectedOrder()?.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  class="text-white hover:text-slate-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-slate-50 rounded-lg p-4">
                  <div class="text-sm text-slate-600 mb-1">کاربر</div>
                  <div class="font-semibold text-slate-900">
                    {selectedOrder()?.User?.Username ?? selectedOrder()?.User?.username ?? "—"}
                  </div>
                  <div class="text-sm text-slate-600">
                    {selectedOrder()?.User?.Email ?? selectedOrder()?.User?.email ?? ""}
                  </div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4">
                  <div class="text-sm text-slate-600 mb-1">وضعیت</div>
                  <div
                    class={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedOrder()?.Status ?? selectedOrder()?.status ?? "pending"
                    )}`}
                  >
                    {selectedOrder()?.Status ?? selectedOrder()?.status ?? "—"}
                  </div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4">
                  <div class="text-sm text-slate-600 mb-1">مبلغ کل</div>
                  <div class="text-xl font-bold text-slate-900">
                    {Number(
                      selectedOrder()?.Total ?? selectedOrder()?.total ?? 0
                    ).toLocaleString()}{" "}
                    تومان
                  </div>
                </div>
                <div class="bg-slate-50 rounded-lg p-4">
                  <div class="text-sm text-slate-600 mb-1">تاریخ</div>
                  <div class="font-semibold text-slate-900">
                    {selectedOrder()?.CreatedAt
                      ? new Date(selectedOrder()?.CreatedAt).toLocaleString("fa-IR")
                      : selectedOrder()?.created_at
                      ? new Date(selectedOrder()?.created_at).toLocaleString("fa-IR")
                      : "—"}
                  </div>
                </div>
              </div>

              <div class="border-t pt-6">
                <h4 class="text-lg font-semibold mb-4">آیتم‌های سفارش</h4>
                <div class="space-y-3">
                  <For each={selectedOrder()?.OrderDetails || []}>
                    {(detail: any) => (
                      <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div class="flex-1">
                          <div class="font-semibold">
                            {detail.Product?.Name ?? detail.product?.name ?? "محصول"}
                          </div>
                          <div class="text-sm text-slate-600">
                            تعداد: {detail.Quantity ?? detail.quantity ?? 0}
                          </div>
                        </div>
                        <div class="text-left">
                          <div class="font-semibold">
                            {Number(detail.Price ?? detail.price ?? 0).toLocaleString()} تومان
                          </div>
                          <div class="text-sm text-slate-600">
                            کل:{" "}
                            {Number(
                              (detail.Price ?? detail.price ?? 0) *
                                (detail.Quantity ?? detail.quantity ?? 0)
                            ).toLocaleString()}{" "}
                            تومان
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Orders;
