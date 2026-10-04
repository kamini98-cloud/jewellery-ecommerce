"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");

    // Temporary admin credentials
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "Admin@123";

    if (
      username.trim() !== ADMIN_USERNAME ||
      password !== ADMIN_PASSWORD
    ) {
      setError("Invalid username or password.");
      return;
    }

    const adminUser = {
      id: "admin-001",
      name: "Admin",
      username: ADMIN_USERNAME,
      role: "admin",
    };

    login(adminUser);

    router.push("/admin");
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ================= HEADER ================= */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Login to access the admin dashboard.
          </p>
        </div>

        {/* ================= LOGIN FORM ================= */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          {/* USERNAME */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Login
          </button>
        </form>

        {/* ================= DEMO CREDENTIALS ================= */}
        <div className="mt-6 border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-500">
            Demo Credentials
          </p>

          <p className="mt-2 text-sm">
            Username:{" "}
            <span className="font-medium">admin</span>
          </p>

          <p className="mt-1 text-sm">
            Password:{" "}
            <span className="font-medium">Admin@123</span>
          </p>
        </div>
      </div>
    </main>
  );
}