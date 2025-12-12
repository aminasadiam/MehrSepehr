import { createSignal } from "solid-js";
import { useAuth } from "../store/auth";
import { useNavigate } from "@solidjs/router";
import LogoPng from "../assets/logos.png";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [remember, setRemember] = createSignal(false);

  const auth = useAuth();
  const navigate = useNavigate();

  // If token present, redirect home
  if (auth.isAuthenticated()) {
    navigate("/");
  }

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    const em = email().trim();
    const pw = password();

    if (!em || !pw) {
      setError("ایمیل و رمز عبور ضروری است.");
      return;
    }

    if (!validateEmail(em)) {
      setError("لطفاً یک ایمیل معتبر وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const result = await auth.login(em, pw);
      if (result.success) {
        if (remember()) {
          // token stored by auth.login; optionally persist a flag
          localStorage.setItem("remember", "1");
        } else {
          localStorage.removeItem("remember");
        }
        navigate("/");
      } else {
        setError(
          result.error || "ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید."
        );
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      class="flex items-center justify-center min-h-screen bg-gray-50"
      dir="rtl"
    >
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div class="flex flex-col items-center mb-4">
          <img src={LogoPng} alt="لوگوی مهر سپهر" class="w-20 mb-3" />
          <h2 class="text-2xl font-bold mb-1 text-center">
            ورود به حساب کاربری
          </h2>
          <p class="text-sm text-center text-gray-500">
            ایمیل و رمز عبور خود را وارد کنید.
          </p>
        </div>

        {error() && (
          <div
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <strong class="block font-medium">خطا</strong>
            <div>{error()}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} autocomplete="on">
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-medium mb-2"
              for="email"
            >
              پست الکترونیکی
            </label>
            <input
              id="email"
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
              autofocus
              placeholder="name@example.com"
              class="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div class="mb-4 relative">
            <label
              class="block text-gray-700 text-sm font-medium mb-2"
              for="password"
            >
              رمز عبور
            </label>
            <input
              id="password"
              type={showPassword() ? "text" : "password"}
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              placeholder="رمز عبور"
              class="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <button
              type="button"
              aria-label={showPassword() ? "پنهان کردن رمز" : "نمایش رمز"}
              onClick={() => setShowPassword(!showPassword())}
              class="absolute left-2 top-9 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword() ? "پنهان" : "نمایش"}
            </button>
          </div>

          <div class="flex items-center justify-between mb-6">
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                class="form-checkbox"
                checked={remember()}
                onChange={(e) => setRemember(e.currentTarget.checked)}
              />
              <span class="mr-2 text-sm text-gray-600">مرا به خاطر بسپار</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading()}
            aria-busy={loading()}
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60"
          >
            {loading() ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}
