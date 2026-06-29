"use client";

export async function verifyForgotPasswordOtpAction(input: {
  resetSessionToken: string;
  otpCode: string;
}) {
  const response = await fetch("/api/auth/forgot-password/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "OTP verification failed");
  }

  return result.data;
}