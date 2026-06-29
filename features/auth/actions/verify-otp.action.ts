"use client";

export async function verifyOtpAction(input: {
  sessionToken: string;
  targetType: "EMAIL" | "PHONE";
  otpCode: string;
}) {
  const response = await fetch("/api/auth/otp/verify", {
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