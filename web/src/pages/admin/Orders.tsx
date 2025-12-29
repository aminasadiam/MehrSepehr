import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createMemo,
} from "solid-js";
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
      await ordersApi.updateStatus(orderId, newStatus);
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
      await ordersApi.remove(id);
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
    <div
      dir="rtl"
      class="min-h-screen bg-linear-to-br from-slate-50 via-orange-50 to-rose-50"
    >
      <div class="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="sticky top-0 z-10 bg-linear-to-r from-orange-600 via-orange-700 to-orange-800 text-white p-8 rounded-2xl border-b-4 border-orange-900 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold flex items-center gap-3">
                <span class="text-3xl">📦</span>
                مدیریت سفارش‌ها
              </h1>
              <p class="text-orange-100 mt-2">
                مشاهده و مدیریت تمام سفارش‌های سیستم
              </p>
            </div>
            <button
              onClick={load}
              class="px-8 py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-2"
            >
              <span>🔄</span>
              <span>بارگذاری مجدد</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div class="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="relative">
              <span class="absolute right-4 top-3 text-2xl">🔍</span>
              <input
                type="text"
                placeholder="جستجو در سفارش‌ها..."
                value={search()}
                onInput={(e) => setSearch(e.currentTarget.value)}
                class="w-full pl-4 pr-12 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
            <select
              value={statusFilter()}
              onInput={(e) => setStatusFilter(e.currentTarget.value)}
              class="px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-medium"
            >
              <option value="all">📊 همه وضعیت‌ها</option>
              <option value="pending">⏱️ در انتظار</option>
              <option value="processing">⚙️ در حال پردازش</option>
              <option value="shipped">🚚 ارسال شده</option>
              <option value="completed">✅ تکمیل شده</option>
              <option value="cancelled">❌ لغو شده</option>
            </select>
            <div class="flex items-center justify-end">
              <div class="px-6 py-3 bg-linear-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg">
                <span class="text-sm font-bold text-orange-700">
                  📈 تعداد: {filteredOrders().length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Show
          when={!loading()}
          fallback={
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="text-5xl mb-4 animate-spin">⏳</div>
                <div class="text-lg text-slate-600">
                  در حال بارگذاری سفارش‌ها...
                </div>
              </div>
            </div>
          }
        >
          <Show
            when={filteredOrders().length > 0}
            fallback={
              <div class="bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-12 text-center">
                <div class="text-6xl mb-4">📦</div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">
                  سفارشی یافت نشد
                </h3>
                <p class="text-slate-600">
                  هیچ سفارشی با این فیلترها وجود ندارد
                </p>
              </div>
            }
          >
            <div class="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-linear-to-r from-slate-800 to-slate-900 text-white sticky top-0">
                    <tr>
                      <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                        شماره سفارش
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                        کاربر
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                        مبلغ کل
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                        تاریخ
                      </th>
                      <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-200">
                    <For each={filteredOrders()}>
                      {(order: any) => (
                        <tr class="hover:bg-orange-50 transition-colors group">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-bold text-slate-900">
                              #{order.ID ?? order.id}
                            </div>
                            <div class="text-xs text-slate-500">
                              {order.OrderDetails?.length || 0} آیتم
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-semibold text-slate-900">
                              {order.User?.Username ??
                                order.User?.username ??
                                "نامشخص"}
                            </div>
                            <div class="text-xs text-slate-500">
                              {order.User?.Email ?? order.User?.email ?? ""}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-bold text-orange-600">
                              {Number(
                                order.Total ?? order.total ?? 0
                              ).toLocaleString()}{" "}
                              <span class="text-xs">تومان</span>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.Status ?? order.status ?? "pending"}
                              onChange={(e) =>
                                updateStatus(
                                  order.ID ?? order.id,
                                  e.currentTarget.value
                                )
                              }
                              class={`text-xs font-bold px-3 py-2 rounded-lg border-2 cursor-pointer focus:ring-2 focus:ring-orange-400 ${getStatusColor(
                                order.Status ?? order.status ?? "pending"
                              )}`}
                            >
                              <option value="pending">⏱️ در انتظار</option>
                              <option value="processing">
                                ⚙️ در حال پردازش
                              </option>
                              <option value="shipped">🚚 ارسال شده</option>
                              <option value="completed">✅ تکمیل شده</option>
                              <option value="cancelled">❌ لغو شده</option>
                            </select>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {order.CreatedAt
                              ? new Date(order.CreatedAt).toLocaleDateString(
                                  "fa-IR"
                                )
                              : order.created_at
                              ? new Date(order.created_at).toLocaleDateString(
                                  "fa-IR"
                                )
                              : "—"}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                class="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-bold"
                              >
                                جزئیات
                              </button>
                              <button
                                onClick={() =>
                                  deleteOrder(order.ID ?? order.id)
                                }
                                class="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-bold hover:scale-105"
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
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div class="sticky top-0 bg-linear-to-r from-orange-600 via-orange-700 to-orange-800 text-white p-6 rounded-t-2xl border-b-4 border-orange-900 flex items-center justify-between">
                <h3 class="text-2xl font-bold flex items-center gap-2">
                  <span class="text-2xl">📦</span>
                  جزئیات سفارش #{selectedOrder()?.ID ?? selectedOrder()?.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  class="text-white hover:text-orange-100 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div class="p-6">
                {/* Order Info Grid */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div class="text-xs font-bold text-slate-600 uppercase mb-1">
                      👤 کاربر
                    </div>
                    <div class="font-bold text-slate-900">
                      {selectedOrder()?.User?.Username ??
                        selectedOrder()?.User?.username ??
                        "—"}
                    </div>
                    <div class="text-sm text-slate-600">
                      {selectedOrder()?.User?.Email ??
                        selectedOrder()?.User?.email ??
                        ""}
                    </div>
                  </div>
                  <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div class="text-xs font-bold text-slate-600 uppercase mb-1">
                      📊 وضعیت
                    </div>
                    <div
                      class={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(
                        selectedOrder()?.Status ??
                          selectedOrder()?.status ??
                          "pending"
                      )}`}
                    >
                      {selectedOrder()?.Status ??
                        selectedOrder()?.status ??
                        "—"}
                    </div>
                  </div>
                  <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div class="text-xs font-bold text-slate-600 uppercase mb-1">
                      💰 مبلغ کل
                    </div>
                    <div class="text-2xl font-bold text-orange-600">
                      {Number(
                        selectedOrder()?.Total ?? selectedOrder()?.total ?? 0
                      ).toLocaleString()}{" "}
                      <span class="text-sm text-slate-600">تومان</span>
                    </div>
                  </div>
                  <div class="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div class="text-xs font-bold text-slate-600 uppercase mb-1">
                      📅 تاریخ
                    </div>
                    <div class="font-bold text-slate-900">
                      {selectedOrder()?.CreatedAt
                        ? new Date(selectedOrder()?.CreatedAt).toLocaleString(
                            "fa-IR"
                          )
                        : selectedOrder()?.created_at
                        ? new Date(selectedOrder()?.created_at).toLocaleString(
                            "fa-IR"
                          )
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div class="border-t pt-6">
                  <h4 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>🛒</span>
                    آیتم‌های سفارش
                  </h4>
                  <div class="space-y-3">
                    <For each={selectedOrder()?.OrderDetails || []}>
                      {(detail: any) => (
                        <div class="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 group hover:border-orange-300 transition-colors">
                          <div class="flex-1">
                            <div class="font-bold text-slate-900">
                              {detail.Product?.Name ??
                                detail.product?.name ??
                                "محصول"}
                            </div>
                            <div class="text-sm text-slate-600">
                              تعداد: {detail.Quantity ?? detail.quantity ?? 0}
                            </div>
                          </div>
                          <div class="text-left">
                            <div class="font-bold text-orange-600">
                              {Number(
                                detail.Price ?? detail.price ?? 0
                              ).toLocaleString()}{" "}
                              <span class="text-xs text-slate-600">تومان</span>
                            </div>
                            <div class="text-sm text-slate-600">
                              کل:{" "}
                              {Number(
                                (detail.Price ?? detail.price ?? 0) *
                                  (detail.Quantity ?? detail.quantity ?? 0)
                              ).toLocaleString()}{" "}
                              <span class="text-xs">تومان</span>
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
    </div>
  );
};

export default Orders;
