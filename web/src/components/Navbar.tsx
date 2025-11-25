import LogoPng from "../assets/logos.png";
import { useAuth } from "../store/auth";

export default function Navbar() {
  const auth = useAuth();

  return (
    <nav class="flex items-center justify-between flex-wrap p-6 border-b border-gray-300 bg-white">
      <div class="flex items-center">
        <a href="/">
          <img src={LogoPng} alt="Logo" class="h-8" />
        </a>
      </div>
      <div class="flex items-center gap-4">
        {auth.isAuthenticated() ? (
          <>
            <span class="text-gray-700">Welcome, {auth.user()?.username}</span>
            {auth.isAdmin() && (
              <a
                href="/admin"
                class="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Admin
              </a>
            )}
            <button
              onClick={() => auth.logout()}
              class="text-red-500 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              class="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Login
            </a>
            <a
              href="/register"
              class="text-green-500 hover:text-green-700 font-semibold"
            >
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
