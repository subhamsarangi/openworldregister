"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase-browser";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("Unauthorized: You must use the correct admin email to access this portal.");
      // Clear the URL parameter silently
      window.history.replaceState({}, "", "/admin/login");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Proxy (middleware) will verify email whitelist on redirect.
    router.push("/admin");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0f0a05", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Ambient background blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(184,74,30,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(200,154,46,0.08) 0%, transparent 70%)
          `,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(184,74,30,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(184,74,30,0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Login card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Glow effect behind card */}
        <div
          className="absolute -inset-1 rounded-3xl blur-xl opacity-30"
          style={{ background: "linear-gradient(135deg, #b84a1e, #c89a2e)" }}
        />

        <div
          className="relative rounded-2xl p-8 md:p-10"
          style={{
            backgroundColor: "rgba(26, 16, 8, 0.95)",
            border: "1px solid rgba(184, 74, 30, 0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Logo area */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(184,74,30,0.2), rgba(200,154,46,0.1))",
                border: "1px solid rgba(184, 74, 30, 0.3)",
              }}
            >
              <span className="text-3xl">🏛</span>
            </div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#faf6ee",
              }}
            >
              Admin Portal
            </h1>
            <p className="text-sm" style={{ color: "rgba(250,246,238,0.4)" }}>
              Langtoo Content Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "rgba(250,246,238,0.5)" }}
              >
                Email
              </label>
              <div className="relative">
                <span
                  className="absolute inset-y-0 left-3 flex items-center text-base pointer-events-none"
                  style={{ color: "rgba(184,74,30,0.6)" }}
                >
                  ✉
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl outline-none transition-all text-sm"
                  style={{
                    backgroundColor: "rgba(250,246,238,0.05)",
                    border: "1px solid rgba(184,74,30,0.2)",
                    color: "#faf6ee",
                    caretColor: "#b84a1e",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(184,74,30,0.6)";
                    e.target.style.backgroundColor = "rgba(250,246,238,0.07)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(184,74,30,0.2)";
                    e.target.style.backgroundColor = "rgba(250,246,238,0.05)";
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "rgba(250,246,238,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute inset-y-0 left-3 flex items-center text-base pointer-events-none"
                  style={{ color: "rgba(184,74,30,0.6)" }}
                >
                  🔒
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-11 py-3 rounded-xl outline-none transition-all text-sm"
                  style={{
                    backgroundColor: "rgba(250,246,238,0.05)",
                    border: "1px solid rgba(184,74,30,0.2)",
                    color: "#faf6ee",
                    caretColor: "#b84a1e",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(184,74,30,0.6)";
                    e.target.style.backgroundColor = "rgba(250,246,238,0.07)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(184,74,30,0.2)";
                    e.target.style.backgroundColor = "rgba(250,246,238,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-xs transition-colors"
                  style={{ color: "rgba(250,246,238,0.3)" }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = "rgba(250,246,238,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = "rgba(250,246,238,0.3)";
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                }}
              >
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all relative overflow-hidden cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(184,74,30,0.4)"
                  : "linear-gradient(135deg, #b84a1e, #d4641e)",
                color: "#faf6ee",
                opacity: loading ? 0.7 : 1,
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(184,74,30,0.35)",
                transform: loading ? "none" : undefined,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 6px 24px rgba(184,74,30,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 20px rgba(184,74,30,0.35)";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in to Admin"
              )}
            </button>
          </form>

          {/* Footer note */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: "rgba(250,246,238,0.2)" }}
          >
            Access restricted to authorised administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0a05] text-white flex items-center justify-center">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
