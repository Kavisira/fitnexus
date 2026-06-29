"use client";

export async function resetPasswordAction(input: {
  resetSessionToken: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch("/api/auth/forgot-password/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Password reset failed");
  }

  return result.data;
}