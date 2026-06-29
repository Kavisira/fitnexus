"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Rocket,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { registerAction } from "@/features/auth/actions/register.action";
import { sendOtpAction } from "@/features/auth/actions/send-otp.action";
import { verifyOtpAction } from "@/features/auth/actions/verify-otp.action";

import InputField from "@/components/ui/InputField";
import PasswordField from "@/components/ui/PasswordField";
import FeatureCard from "@/components/ui/FeatureCard";

type RegisterForm = {
  ownerName: string;
  organizationName: string;
  mainBranchName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    ownerName: "",
    organizationName: "",
    mainBranchName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [sessionToken, setSessionToken] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState("");

  function updateField(field: keyof RegisterForm, value: string) {
    const finalValue =
      field === "phone" ? value.replace(/\D/g, "").slice(0, 15) : value;

    setForm((prev) => ({ ...prev, [field]: finalValue }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });

    if (field === "email" || field === "phone") {
      setSessionToken("");
      setEmailOtp("");
      setPhoneOtp("");
      setEmailVerified(false);
      setPhoneVerified(false);
      setEmailOtpSent(false);
      setPhoneOtpSent(false);
    }
  }

  function validateContact() {
    const nextErrors: Record<string, string> = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    const phone = form.phone.replace(/\D/g, "");

    if (!/^\d{7,15}$/.test(phone)) {
      nextErrors.phone = "Mobile number must contain between 7 and 15 digits";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (form.ownerName.trim().length < 3) {
      nextErrors.ownerName = "Owner name must be at least 3 characters";
    }

    if (form.organizationName.trim().length < 3) {
      nextErrors.organizationName =
        "Organization name must be at least 3 characters";
    }

    if (form.mainBranchName.trim().length < 3) {
      nextErrors.mainBranchName =
        "Main branch name must be at least 3 characters";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    const phone = form.phone.replace(/\D/g, "");

    if (!/^\d{7,15}$/.test(phone)) {
      nextErrors.phone = "Mobile number must contain between 7 and 15 digits";
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
        form.password
      )
    ) {
      nextErrors.password =
        "Password must include uppercase, lowercase, number, and special character";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Password and confirm password must match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSendOtp(targetType: "EMAIL" | "PHONE") {
    if (!validateContact()) return;

    setOtpLoading(`SEND_${targetType}`);

    try {
      const data = await sendOtpAction({
        sessionToken: sessionToken || undefined,
        email: sessionToken ? undefined : form.email.trim().toLowerCase(),
        phone: sessionToken ? undefined : form.phone.replace(/\D/g, ""),
        targetType,
      });

      setSessionToken(data.sessionToken);

      if (targetType === "EMAIL") {
        setEmailOtpSent(true);
      }

      if (targetType === "PHONE") {
        setPhoneOtpSent(true);
      }

      toast.success(`${targetType} OTP sent. Dev OTP: ${data.otpCode}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OTP send failed");
    } finally {
      setOtpLoading("");
    }
  }

  async function handleVerifyOtp(targetType: "EMAIL" | "PHONE") {
    const otpCode = targetType === "EMAIL" ? emailOtp : phoneOtp;

    if (!sessionToken) {
      return toast.error("Please send OTP first");
    }

    if (!otpCode.trim()) {
      return toast.error("Enter OTP");
    }

    setOtpLoading(`VERIFY_${targetType}`);

    try {
      const data = await verifyOtpAction({
        sessionToken,
        targetType,
        otpCode,
      });

      setEmailVerified(data.emailVerified);
      setPhoneVerified(data.phoneVerified);

      toast.success(`${targetType} verified successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setOtpLoading("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    if (!sessionToken) {
      return toast.error("Please verify email and mobile number");
    }

    if (!emailVerified || !phoneVerified) {
      return toast.error("Please verify email and mobile number");
    }

    setLoading(true);

    try {
      await registerAction({
        sessionToken,
        ownerName: form.ownerName,
        organizationName: form.organizationName,
        mainBranchName: form.mainBranchName,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      toast.success("Registration completed successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
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

        <div className="relative z-10 flex h-dvh flex-col justify-between px-12 py-8">
          <div />

          <div className="max-w-xl">
            <h2 className="mb-5 text-3xl font-black leading-tight 2xl:text-6xl">
              Start.
              <br />
              Manage.
              <br />
              <span className="text-orange-500">Scale.</span>
            </h2>
            <p className="max-w-md text-lg leading-7 text-white/90">
              Create your gym account and start managing your fitness business
              with confidence.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <FeatureCard
              icon={<Rocket size={22} />}
              title="Fast Setup"
              text="Create gym, branch and admin in one step."
            />
            <FeatureCard
              icon={<ShieldCheck size={22} />}
              title="Secure Login"
              text="Enterprise-grade authentication and role-based access."
            />
            <FeatureCard
              icon={<ChartNoAxesCombined size={22} />}
              title="Ready to Grow"
              text="Scale from a single gym to multiple branches."
            />
          </div>
        </div>
      </section>

      <section className="flex h-dvh items-center justify-center overflow-y-auto px-6 py-6">
        <div className="w-full max-w-lg">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-950">
              Create Gym Account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Register your gym and verify your contact details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <InputField
              label="Owner Name"
              value={form.ownerName}
              onChange={(value) => updateField("ownerName", value)}
              placeholder="Enter owner name"
              icon={<User size={19} />}
              error={errors.ownerName}
            />

            <InputField
              label="Organization Name"
              value={form.organizationName}
              onChange={(value) => updateField("organizationName", value)}
              placeholder="Enter gym name"
              icon={<Building2 size={19} />}
              error={errors.organizationName}
            />

            <InputField
              label="Main Branch Name"
              value={form.mainBranchName}
              onChange={(value) => updateField("mainBranchName", value)}
              placeholder="Anna Nagar / Main Branch"
              icon={<MapPin size={19} />}
              error={errors.mainBranchName}
            />

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <div>
                <InputField
                  label="Email Address"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="owner@gym.com"
                  icon={<Mail size={19} />}
                  error={errors.email}
                  disabled={emailVerified}
                />
              {form.email && 
                <VerifyContactBox
                  otpValue={emailOtp}
                  otpSent={emailOtpSent}
                  verified={emailVerified}
                  loading={otpLoading}
                  targetType="EMAIL"
                  onOtpChange={setEmailOtp}
                  onSendOtp={() => handleSendOtp("EMAIL")}
                  onVerifyOtp={() => handleVerifyOtp("EMAIL")}
                />
              }
              </div>

              <div>
                <InputField
                  label="Mobile Number"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="Enter mobile number"
                  icon={<Phone size={19} />}
                  error={errors.phone}
                  type="tel"
                  maxLength={15}
                  disabled={phoneVerified}
                />
              {form.phone &&
                <VerifyContactBox
                  otpValue={phoneOtp}
                  otpSent={phoneOtpSent}
                  verified={phoneVerified}
                  loading={otpLoading}
                  targetType="PHONE"
                  onOtpChange={setPhoneOtp}
                  onSendOtp={() => handleSendOtp("PHONE")}
                  onVerifyOtp={() => handleVerifyOtp("PHONE")}
                />
              }
              </div>
            </div>
            <div className="grid grid-cols1 gap-3 xl:grid-cols-2">
              <div>
                <PasswordField
                  label="Password"
                  value={form.password}
                  onChange={(value) => updateField("password", value)}
                  error={errors.password}
                />
              </div>
              <div>
                <PasswordField
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(value) => updateField("confirmPassword", value)}
                  error={errors.confirmPassword}
                  placeholder="Confirm password"
                />
              </div>
            </div>




            <button
              type="submit"
              disabled={loading || !emailVerified || !phoneVerified || !form.password || !form.confirmPassword || !form.mainBranchName || !form.organizationName || !form.ownerName}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-orange-600 text-base font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="cursor-pointer font-semibold text-orange-600"
            >
              Sign In
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function VerifyContactBox({
  otpValue,
  otpSent,
  verified,
  loading,
  targetType,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
}: {
  otpValue: string;
  otpSent: boolean;
  verified: boolean;
  loading: string;
  targetType: "EMAIL" | "PHONE";
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
}) {
  if (verified) {
    return (
      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600">
        <CheckCircle2 size={14} />
        Verified
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      {!otpSent ? (
        <button
          type="button"
          onClick={onSendOtp}
          disabled={loading === `SEND_${targetType}`}
          className="h-9 w-full rounded-lg bg-orange-600 text-xs font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === `SEND_${targetType}`
            ? "Sending..."
            : `Verify ${targetType === "EMAIL" ? "Email" : "Mobile"}`}
        </button>
      ) : (
        <>
          <div className="mb-2 flex gap-2">
            <input
              value={otpValue}
              onChange={(e) =>
                onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter OTP"
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={onVerifyOtp}
              disabled={loading === `VERIFY_${targetType}`}
              className="rounded-lg bg-slate-900 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === `VERIFY_${targetType}` ? "..." : "Verify"}
            </button>
          </div>

          <button
            type="button"
            onClick={onSendOtp}
            disabled={loading === `SEND_${targetType}`}
            className="text-xs font-bold text-orange-600 disabled:opacity-50"
          >
            {loading === `SEND_${targetType}` ? "Sending..." : "Resend OTP"}
          </button>
        </>
      )}
    </div>
  );
}