import { Component, createSignal, onMount } from "solid-js";
import { walletApi } from "../../utils/api";

const Wallets: Component = () => {
  const [wallet, setWallet] = createSignal<any | null>(null);

  const load = async () => {
    try {
      // show empty UI; admin will view by id via input in a fuller UI
    } catch (e) {
      console.error(e);
    }
  };

  onMount(load);

  return (
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Wallets</h2>
      <p class="text-sm text-slate-600">
        Use wallet ID view or user tools to manage balances.
      </p>
    </div>
  );
};

export default Wallets;
