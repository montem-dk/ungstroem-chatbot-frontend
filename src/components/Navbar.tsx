"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!(user || token));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/auth/login");
  };

  return (
    <>
      <nav className="w-full fixed top-0 left-0 bg-[#153f68] text-white flex justify-between items-center px-12 py-7 shadow-md z-50">
  {/* Left Side — Logo */}
  <div
    onClick={() => router.push("/")}
    className="flex items-center gap-2 cursor-pointer select-none"
  >
    <img src="/ungstrøm.avif" alt="Logo" className="w-10 h-10 object-contain" />
    <h1 className="text-lg font-semibold tracking-wide">UNGSTRØM</h1>
  </div>

  {/* Right Side — Buttons */}
  <div className="flex items-center gap-4">
    <button
      onClick={() => router.push("/chat")}
      className="bg-white text-[#153f68] font-medium px-6 py-2 rounded-full hover:bg-gray-100 transition"
    >
      Chat
    </button>

    {isLoggedIn ? (
      <button
        onClick={handleLogout}
        className="bg-white text-[#153f68] font-medium px-6 py-2 rounded-full hover:bg-gray-100 transition"
      >
        Logout
      </button>
    ) : (
      <button
        onClick={() => router.push("/auth/login")}
        className="bg-white text-[#153f68] font-medium px-6 py-2 rounded-full hover:bg-gray-100 transition"
      >
        Login
      </button>
    )}
  </div>
</nav>

      {/* Adds space below the fixed navbar so it doesn't hide content */}
      <div className="h-20"></div>
    </>
  );
}
