import { Component, createSignal, onMount } from "solid-js";
import { ordersApi } from "../../utils/api";

const Orders: Component = () => {
  const [orders, setOrders] = createSignal<any[]>([]);
  const load = async () => {
    try {
      const res = await ordersApi.adminGetAll();
      setOrders((res.data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };
  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Orders</h2>
      <ul>
        {orders().map((o) => (
          <li class="mb-2 border p-2">
            Order #{o.ID ?? o.id} - {o.Status ?? o.status} - $
            {o.Total ?? o.total}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
