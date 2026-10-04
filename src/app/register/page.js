"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Temporary frontend registration
    const userData = {
      name,
      email,
    };

    // Automatically log in after registration
    login(userData);

    router.push("/");
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="mb-8 text-center">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Create Account
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Join Our Store
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Create an account to manage your orders and wishlist.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Password */}
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
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Create Account
          </button>

        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}

          <Link
            href="/login"
            className="font-medium text-black underline"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}