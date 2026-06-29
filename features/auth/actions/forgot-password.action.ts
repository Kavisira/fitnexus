"use client";

export async function forgotPasswordAction(input: { loginId: string }) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "OTP send failed");
  }

  return result.data;
}