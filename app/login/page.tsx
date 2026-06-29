"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import { loginAction } from "@/features/auth/actions/login.action";
import Image from "next/image";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import InputField from "@/components/ui/InputField";
import PasswordField from "@/components/ui/PasswordField";
export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await loginAction({ loginId, password });

      toast.success("Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: "loginId" | "password", value: string) {
    if (field === "loginId") setLoginId(value);
    if (field === "password") setPassword(value);

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!loginId.trim()) {
      nextErrors.loginId = "Email or mobile number is required";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  return (
    <main className="min-h-dvh bg-white lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-black text-white lg:block">
        <img
          src="/images/login-gym-bg.png"
          alt="FitNexus gym background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex min-h-dvh flex-col justify-between px-14 py-6 xl:py-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14">
                <div className="relative h-14 w-14">
                </div>
              </div>

            </div>
          </div>

          <div className="max-w-lg">
            <h2 className="mb-6 text-3xl 2xl:text-6xl font-black leading-tight">
              Manage.
              <br />
              Track.
              <br />
              <span className="text-orange-500">Grow.</span>
            </h2>
            <p className="max-w-md text-xl leading-8 text-white/90">
              Everything your gym needs in one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp size={22} />}
              title="Grow Revenue"
              text="Increase membership and revenue effortlessly."
            />
            <FeatureCard
              icon={<Users size={22} />}
              title="Happy Members"
              text="Deliver an exceptional member experience."
            />
            <FeatureCard
              icon={<BriefcaseBusiness size={22} />}
              title="Smart Management"
              text="Manage your gym operations from anywhere."
            />
          </div>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center px-6 py-6 xl:py-8">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-black text-slate-950">Welcome Back!</h2>
            <p className="mt-3 text-lg text-slate-500">
              Sign in to continue to{" "}
              <span className="font-semibold text-orange-600">FitNexus</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <InputField
              label="Email Address / Mobile Number"
              value={loginId}
              onChange={(value) => updateField("loginId", value)}
              placeholder="Enter your email or mobile"
              icon={<Mail size={19} />}
              error={errors.loginId}
              autoComplete="username"
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-orange-600 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <PasswordField
                label="Password"
                value={password}
                onChange={(value) => updateField("password", value)}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 accent-orange-600 cursor-pointer"
              />
              Remember me
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 xl:h-14 w-full items-center justify-center gap-3 rounded-xl bg-orange-600 text-base font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-10 text-center text-slate-500">
            Don&apos;t have an account?{" "}
            <button className="font-semibold text-orange-600 cursor-pointer" onClick={() => router.push("/register")}
            >Sign Up</button>
          </div>
        </div>
      </section>
    </main>
  );
}