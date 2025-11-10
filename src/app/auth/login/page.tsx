"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      console.log("Login successful:", data);
      if (data.status_code !== 200) {
        throw new Error(data.error || "Login failed");
      }
      login(data.user, data.token);
      if (email === "paskar@ungstroem.dk") {
        router.push("/admin");
        } else {
        router.push("/chat");
    }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#405f76] flex items-center justify-center p-4">
  <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">
    {/* Left hero */}
    <div className="relative hidden lg:flex items-center">
      {/* adjusted gradient: deep blue tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#153f68] via-[#1e5a91] to-[#3a7bbf]" />

      {/* soft translucent shapes */}
      <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-10 right-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative text-white px-12 py-16">
        <h1 className="text-3xl font-semibold drop-shadow-sm">
          Welcome to Ungstrøm
        </h1>
        <p className="mt-4 max-w-md leading-relaxed text-white/90">
          Vores mission på Ungstrøm er at skabe et miljø, hvor unge kan opleve en kraftfuld sammensmeltning af deres indre og ydre liv. Med sloganet "Når liv og sjæl mødes", afspejler vi vores dedikation til at hjælpe de unge med at finde harmoni mellem deres personlige erfaringer og følelser - deres 'sjæl' - og deres hverdagsliv og sociale interaktioner - deres 'liv'. Denne tilgang er afgørende for helingsprocessen hos omsorgssvigtede unge, idet den fremmer en dyb forbindelse mellem personlig vækst og dagligdags livserfaringer. Hos Ungstrøm fokuserer vi på en integreret tilgang, der omfatter både følelsesmæssig og praktisk udvikling, og vi er forpligtet til at skabe et støttende miljø, hvor de unge kan finde dybere mening i deres livserfaringer og personlige rejse
        </p>

        {/* gradient bars for motion */}
        <div className="mt-10 flex gap-3">
          <span className="h-2 w-14 rounded-full bg-white/40" />
          <span className="h-2 w-20 rounded-full bg-white/40" />
          <span className="h-2 w-10 rounded-full bg-white/40" />
        </div>
      </div>
    </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm"
            autoComplete="on"
          >
            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              User Login
            </h2>

            {error && (
              <div className="mt-4 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <label className="block mt-6 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@gmail.com"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition"
              required
            />

            <label className="block mt-4 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition"
              required
            />

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#153f68] to-[#3a7bbf] text-white px-4 py-2.5 font-semibold shadow-md hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-fuchsia-200 active:scale-[0.99] transition"
            >
              Login
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              By logging in you agree to our Terms & Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
