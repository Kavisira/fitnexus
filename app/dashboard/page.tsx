import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Dumbbell,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">
              Dashboard In Progress 🚧
            </h1>
            <p className="mt-2 text-slate-500">
              Authentication module is completed. Business dashboard will be
              delivered in Sprint 2.
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>

        <section className="mb-8 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-4">
              <Dumbbell size={34} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Welcome to FitNexus</h2>
              <p className="mt-1 text-white/85">
                Sprint 1 foundation is ready for testing.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <StatusCard
            title="Sprint 1 Completed"
            icon={<ShieldCheck />}
            items={[
              "Login",
              "Logout",
              "Registration",
              "Email Verification",
              "Mobile Verification",
              "Forgot Password",
              "Password Reset",
              "Secure Session Management",
            ]}
          />

          <StatusCard
            title="Coming in Sprint 2"
            icon={<BarChart3 />}
            items={[
              "Business Dashboard",
              "Member Management",
              "Branch Management",
              "Role & User Management",
              "Attendance",
              "Membership Plans",
              "Revenue Analytics",
              "Reports",
            ]}
          />
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-slate-950">
            <Clock3 className="text-orange-600" />
            Development Progress
          </h3>

          <Progress label="Authentication Foundation" value="100%" width="w-full" />
          <Progress label="Core Dashboard" value="30%" width="w-[30%]" />
          <Progress label="Member Management" value="0%" width="w-[2%]" />
          <Progress label="Analytics" value="0%" width="w-[2%]" />
        </div>
      </div>
    </main>
  );
}

function StatusCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-slate-950">
        <span className="text-orange-600">{icon}</span>
        {title}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 size={17} className="text-green-600" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Progress({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="text-orange-600">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full bg-orange-600 ${width}`} />
      </div>
    </div>
  );
}