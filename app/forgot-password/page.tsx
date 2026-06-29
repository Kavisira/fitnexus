"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

import InputField from "@/components/ui/InputField";
import PasswordField from "@/components/ui/PasswordField";
import { forgotPasswordAction } from "@/features/auth/actions/forgot-password.action";
import { verifyForgotPasswordOtpAction } from "@/features/auth/actions/verify-forgot-password-otp.action";
import { resetPasswordAction } from "@/features/auth/actions/reset-password.action";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetSessionToken, setResetSessionToken] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState("");

  function clearError(field: string) {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }

  async function handleSendOtp() {
    if (!loginId.trim()) {
      setErrors({ loginId: "Email or mobile number is required" });
      return;
    }

    setLoading("SEND_OTP");

    try {
      const data = await forgotPasswordAction({ loginId });
      setResetSessionToken(data.resetSessionToken);
      toast.success(`OTP sent successfully. Dev OTP: ${data.otpCode}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OTP send failed");
    } finally {
      setLoading("");
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim()) {
      setErrors({ otpCode: "OTP is required" });
      return;
    }

    setLoading("VERIFY_OTP");

    try {
      await verifyForgotPasswordOtpAction({
        resetSessionToken,
        otpCode,
      });

      setOtpVerified(true);
      toast.success("OTP verified successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading("");
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!otpVerified) {
      toast.error("Please verify OTP first");
      return;
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
    ) {
      nextErrors.password =
        "Password must include uppercase, lowercase, number, and special character";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Password and confirm password must match";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading("RESET_PASSWORD");

    try {
      await resetPasswordAction({
        resetSessionToken,
        password,
        confirmPassword,
      });

      toast.success("Password reset successfully");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading("");
    }
  }

  return (
    <main className="h-dvh overflow-hidden bg-white lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-black text-white lg:block">
        <img
          src="/images/login-gym-bg.png"
          alt="FitNexus gym background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex h-dvh flex-col justify-center px-12 py-8">
          <div className="max-w-xl">
            <h2 className="mb-5 text-5xl font-black leading-tight">
              Reset.
              <br />
              Secure.
              <br />
              <span className="text-orange-500">Continue.</span>
            </h2>
            <p className="max-w-md text-lg leading-7 text-white/90">
              Recover your FitNexus account securely and get back to managing your gym.
            </p>
          </div>
        </div>
      </section>

      <section className="flex h-dvh items-center justify-center overflow-y-auto px-6 py-6">
        <div className="w-full max-w-lg">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-950">
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email or mobile number and verify OTP to reset password.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField
              label="Email / Mobile Number"
              value={loginId}
              onChange={(value) => {
                setLoginId(value);
                clearError("loginId");
              }}
              placeholder="Enter email or mobile"
              icon={<Mail size={19} />}
              error={errors.loginId}
              disabled={Boolean(resetSessionToken)}
            />

            {!resetSessionToken && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading === "SEND_OTP"}
                className="h-11 w-full rounded-xl bg-orange-600 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading === "SEND_OTP" ? "Sending OTP..." : "Send OTP"}
              </button>
            )}

            {resetSessionToken && !otpVerified && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  OTP
                </label>

                <div className="flex gap-2">
                  <input
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      clearError("otpCode");
                    }}
                    placeholder="Enter OTP"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading === "VERIFY_OTP"}
                    className="rounded-lg bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {loading === "VERIFY_OTP" ? "..." : "Verify"}
                  </button>
                </div>

                {errors.otpCode && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.otpCode}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading === "SEND_OTP"}
                  className="mt-2 text-xs font-bold text-orange-600 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {otpVerified && (
              <><p className="flex items-center gap-1 text-xs font-bold text-green-600">
                              <CheckCircle2 size={14} />
                              OTP verified
                          </p><PasswordField
                                  label="New Password"
                                  value={password}
                                  onChange={(value) => {
                                      setPassword(value);
                                      clearError("password");
                                  } }
                                  error={errors.password}
                                  disabled={!otpVerified} /><PasswordField
                                  label="Confirm Password"
                                  value={confirmPassword}
                                  onChange={(value) => {
                                      setConfirmPassword(value);
                                      clearError("confirmPassword");
                                  } }
                                  error={errors.confirmPassword}
                                  disabled={!otpVerified}
                                  placeholder="Confirm password" /><button
                                      type="submit"
                                      disabled={!otpVerified || loading === "RESET_PASSWORD"}
                                      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-orange-600 text-base font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                  {loading === "RESET_PASSWORD" ? "Resetting..." : "Reset Password"}
                                  {loading !== "RESET_PASSWORD" && <ArrowRight size={20} />}
                              </button></>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}