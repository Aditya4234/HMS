"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LoginForm from "@/components/LoginForm";
import { api } from "@/lib/api";
import { storeAuthData } from "@/lib/auth";

const GoogleLoginButton = dynamic(
  () => import("@/components/GoogleLoginButton"),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSuccess = useCallback(
    async (credential: string) => {
      setGoogleLoading(true);
      setError(undefined);

      try {
        const { data, error: apiError } = await api.googleLogin(credential);

        if (apiError || !data) {
          setError(apiError || "Login failed");
          setGoogleLoading(false);
          return;
        }

        storeAuthData(data.accessToken, data.user);
        router.push("/dashboard");
      } catch {
        setError("An unexpected error occurred");
        setGoogleLoading(false);
      }
    },
    [router]
  );

  const handleEmailLogin = async (_email: string, _password: string) => {
    setIsLoading(true);
    setError(undefined);

    await new Promise((r) => setTimeout(r, 1000));

    setError("Email login is coming soon. Use Google Sign-In.");
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white px-6 py-8 shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5 sm:px-8">
            {/* Google Sign-In */}
            <div className="flex flex-col items-center">
              {googleLoading ? (
                <div className="flex h-12 w-full max-w-xs items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                  <svg
                    className="h-5 w-5 animate-spin text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Connecting with Google...
                  </span>
                </div>
              ) : (
                <GoogleLoginButton
                  onSuccess={handleSuccess}
                  onError={(err) => setError(err)}
                />
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-400">
                  or sign in with email
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <LoginForm
              onLogin={handleEmailLogin}
              isLoading={isLoading}
            />

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Hotel Management System. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
