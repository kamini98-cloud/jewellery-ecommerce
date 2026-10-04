"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // ================= STATES =================
  const [step, setStep] = useState("mobile");

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");

  // ================= MOBILE SUBMIT =================
  const handleMobileSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // For now we directly move to OTP screen
    // Later: send real OTP from backend/SMS service
    setStep("otp");
  };

  // ================= OTP VERIFY =================
  const handleOtpSubmit = (event) => {
    event.preventDefault();

    setError("");

    // Temporary demo OTP
    if (otp !== "123456") {
      setError("Invalid OTP. Please try again.");
      return;
    }

    // Check if this mobile number already exists
    // Temporary frontend logic using localStorage
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const existingUser = JSON.parse(savedUser);

      if (existingUser.mobile === mobile) {
        login(existingUser);
        router.push("/account");
        return;
      }
    }

    // New user
    setStep("name");
  };

  // ================= CREATE ACCOUNT =================
  const handleNameSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const userData = {
      id: Date.now(),
      name: name.trim(),
      mobile,
    };

    login(userData);

    router.push("/account");
  };

  // ================= GO BACK =================
  const handleBack = () => {
    setError("");

    if (step === "otp") {
      setOtp("");
      setStep("mobile");
    }

    if (step === "name") {
      setStep("otp");
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ================= MOBILE STEP ================= */}
        {step === "mobile" && (
          <>
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Welcome
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                Login or Sign Up
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Enter your mobile number to continue.
              </p>
            </div>

            <form
              onSubmit={handleMobileSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium"
                >
                  Mobile Number
                </label>

                <div className="flex">
                  <div className="flex items-center border border-r-0 border-gray-300 bg-gray-50 px-4 text-sm">
                    +91
                  </div>

                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(event) =>
                      setMobile(
                        event.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="Enter mobile number"
                    maxLength={10}
                    required
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Continue
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </>
        )}

        {/* ================= OTP STEP ================= */}
        {step === "otp" && (
          <>
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Verify Mobile
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                Enter OTP
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                We sent a 6-digit OTP to
              </p>

              <p className="mt-1 text-sm font-medium">
                +91 {mobile}
              </p>
            </div>

            <form
              onSubmit={handleOtpSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium"
                >
                  Enter OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.5em] outline-none transition focus:border-black"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Demo OTP: 123456
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full text-sm text-gray-500 underline"
              >
                Change Mobile Number
              </button>
            </form>
          </>
        )}

        {/* ================= NAME STEP ================= */}
        {step === "name" && (
          <>
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Almost There
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                Tell Us Your Name
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                This helps us personalize your account.
              </p>
            </div>

            <form
              onSubmit={handleNameSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Your Name
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
                  autoFocus
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full text-sm text-gray-500 underline"
              >
                Back
              </button>
            </form>
          </>
        )}

      </div>
    </main>
  );
}