import { A } from "@solidjs/router";
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
      class="flex items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-sky-50 to-white"
      dir="rtl"
    >
      {/* Subtle overlay for depth */}
      <div class="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>

      {/* Decorative SVG blobs */}
      <svg
        class="absolute -top-20 -right-20 w-96 h-96 opacity-30"
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(300,300)">
          <path
            d="M120,-180C170,-150,210,-100,220,-40C230,20,210,80,170,120C130,160,70,180,10,190C-50,200,-100,190,-140,160C-180,130,-210,80,-220,20C-230,-40,-220,-100,-180,-140C-140,-180,-70,-210,-10,-200C50,-190,100,-210,120,-180Z"
            fill="#7c3aed"
          />
        </g>
      </svg>

      <svg
        class="absolute -bottom-24 -left-16 w-80 h-80 opacity-20"
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(300,300)">
          <path
            d="M100,-140C140,-110,170,-70,170,-30C170,10,140,50,100,80C60,110,10,130,-30,140C-70,150,-120,140,-150,110C-180,80,-200,40,-200,0C-200,-40,-180,-80,-150,-110C-120,-140,-70,-160,-30,-150C10,-140,60,-170,100,-140Z"
            fill="#06b6d4"
          />
        </g>
      </svg>

      <div class="relative w-full max-w-md px-4 sm:px-6">
        {/* Logo and Header */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200 mb-6 shadow-2xl">
            <img
              src={LogoPng}
              alt="لوگوی مهر سپهر"
              class="w-16 h-16 object-contain"
            />
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-3">
            خوش آمدید
          </h1>
          <p class="text-lg text-slate-600">به فروشگاه مهر سپهر</p>
        </div>

        {/* Login Card */}
        <div class="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 backdrop-blur-sm">
          <div class="mb-8">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 text-center">
              ورود به حساب کاربری
            </h2>
            <p class="text-center text-slate-600 text-sm">
              ایمیل و رمز عبور خود را وارد کنید
            </p>
          </div>

          {error() && (
            <div
              class="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-start gap-3 shadow-sm"
              role="alert"
            >
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                <i class="fa-solid fa-exclamation text-white text-xs"></i>
              </div>
              <div class="flex-1">
                <strong class="block font-bold mb-1">خطا</strong>
                <div class="text-sm">{error()}</div>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                class="text-red-400 hover:text-red-600 transition-colors"
                aria-label="بستن"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} autocomplete="on" class="space-y-5">
            {/* Email Input */}
            <div>
              <label
                class="block text-slate-700 text-sm font-bold mb-2"
                for="email"
              >
                پست الکترونیکی
              </label>
              <div class="relative">
                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <i class="fa-solid fa-envelope"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                  autofocus
                  placeholder="name@example.com"
                  class="w-full py-3.5 pl-4 pr-12 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-sm hover:border-indigo-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                class="block text-slate-700 text-sm font-bold mb-2"
                for="password"
              >
                رمز عبور
              </label>
              <div class="relative">
                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <i class="fa-solid fa-lock"></i>
                </div>
                <input
                  id="password"
                  type={showPassword() ? "text" : "password"}
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                  placeholder="رمز عبور خود را وارد کنید"
                  class="w-full py-3.5 pl-4 pr-24 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-sm hover:border-indigo-300"
                />
                <button
                  type="button"
                  aria-label={showPassword() ? "پنهان کردن رمز" : "نمایش رمز"}
                  onClick={() => setShowPassword(!showPassword())}
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                  {showPassword() ? (
                    <i class="fa-solid fa-eye-slash"></i>
                  ) : (
                    <i class="fa-solid fa-eye"></i>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div class="flex items-center justify-between">
              <label class="inline-flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  class="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-all"
                  checked={remember()}
                  onChange={(e) => setRemember(e.currentTarget.checked)}
                />
                <span class="mr-3 text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                  مرا به خاطر بسپار
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading()}
              aria-busy={loading()}
              class="group w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              {loading() ? (
                <>
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <span>ورود</span>
                  <i class="fa-solid fa-arrow-left group-hover:translate-x-[-4px] transition-transform"></i>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div class="mt-8 pt-6 border-t border-slate-200 text-center">
            <p class="text-sm text-slate-600 mb-4">حساب کاربری ندارید؟</p>
            <A
              href="/register"
              class="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-600 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <i class="fa-solid fa-user-plus"></i>
              ثبت نام
            </A>
          </div>
        </div>

        {/* Back to Home */}
        <div class="mt-6 text-center">
          <A
            href="/"
            class="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            <i class="fa-solid fa-arrow-right"></i>
            بازگشت به صفحه اصلی
          </A>
        </div>
      </div>
    </div>
  );
}
