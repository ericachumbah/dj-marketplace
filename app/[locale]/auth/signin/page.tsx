"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Github, Chrome, AlertCircle, Eye, EyeOff } from "lucide-react";
import { usePathname } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Extract locale from pathname
  const locale = pathname.split("/")[1] || "en";

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setTimeout(() => {
        setError(decodeURIComponent(errorParam));
      }, 0);
    }
  }, [searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { 
        email, 
        password, 
        redirect: true,
        callbackUrl: `/${locale}/`
      });
      
      if (result?.error) {
        setError(result.error || "Sign in failed");
        setLoading(false);
      }
      // If successful, redirect will be handled by NextAuth
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Sign in error:", err);
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 shrink-0 w-5 h-5 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Try using: demo@example.com / demo
            </p>
          </div>
        </div>
      )}

      {/* Email Sign In */}
      <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          {loading ? "Signing in..." : "Sign In with Email"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* OAuth */}
      <div className="space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl: `/${locale}/dashboard` })}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
        >
          <Chrome className="w-4 h-4" />
          Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: `/${locale}/dashboard` })}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
        >
          <Github className="w-4 h-4" />
          GitHub
        </button>
      </div>

      {/* Links */}
      <div className="mt-6 text-center text-sm text-gray-600 space-y-3">
        <p>
          New here?{" "}
          <Link href={`/${locale}/auth/signup`} className="text-blue-600 hover:underline font-medium">
            Create account
          </Link>
        </p>
        <p className="border-t pt-3">
          Want to become a DJ?{" "}
          <Link href={`/${locale}/dj/signup`} className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
