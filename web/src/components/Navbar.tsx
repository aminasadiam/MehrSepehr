import LogoPng from "../assets/logos.png";
import { useAuth } from "../store/auth";

export default function Navbar() {
  const auth = useAuth();

  return (
    <nav class="flex items-center justify-between flex-wrap p-3 sm:p-6 border-b border-gray-300 bg-white">
      <div class="flex items-center">
        <a href="/">
          <img src={LogoPng} alt="Logo" class="h-6 sm:h-8" />
        </a>
      </div>
      <div class="flex items-center gap-4" dir="rtl">
        {auth.isAuthenticated() ? (
          <>
            <div class="hidden sm:flex items-center gap-4">
              <span class="text-gray-700">
                خوش آمدید، {auth.user()?.username}
              </span>
              {auth.isAdmin() && (
                <a
                  href="/admin"
                  class="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  مدیریت
                </a>
              )}
              <button
                onClick={() => auth.logout()}
                class="text-red-500 hover:text-red-700 font-semibold"
              >
                خروج
              </button>
            </div>

            {/* Compact mobile actions */}
            <div class="flex sm:hidden items-center gap-2">
              <a
                href="/profile"
                aria-label="پروفایل"
                class="text-slate-700 p-2 rounded-md hover:bg-slate-100"
              >
                <i class="fa-solid fa-circle-user"></i>
              </a>
              {auth.isAdmin() && (
                <a
                  href="/admin"
                  aria-label="پنل"
                  class="text-indigo-600 p-2 rounded-md hover:bg-slate-100"
                >
                  <i class="fa-solid fa-user-shield"></i>
                </a>
              )}
              <button
                onClick={() => auth.logout()}
                aria-label="خروج"
                class="text-red-500 p-2 rounded-md hover:bg-slate-100"
              >
                <i class="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          </>
        ) : (
          <>
            <div class="hidden sm:flex items-center gap-4">
              <a
                href="/login"
                class="text-blue-500 hover:text-blue-700 font-semibold"
              >
                ورود
              </a>
              <a
                href="/register"
                class="text-green-500 hover:text-green-700 font-semibold"
              >
                ثبت‌نام
              </a>
            </div>
            <div class="flex sm:hidden items-center gap-2">
              <a
                href="/login"
                aria-label="ورود"
                class="text-blue-500 p-2 rounded-md hover:bg-slate-100"
              >
                <i class="fa-solid fa-right-to-bracket"></i>
              </a>
              <a
                href="/register"
                aria-label="ثبت‌نام"
                class="text-green-500 p-2 rounded-md hover:bg-slate-100"
              >
                <i class="fa-solid fa-user-plus"></i>
              </a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
