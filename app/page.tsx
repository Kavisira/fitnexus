import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth.service";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}