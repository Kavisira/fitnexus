"use client";

export async function sendOtpAction(input: {
  sessionToken?: string;
  email?: string;
  phone?: string;
  targetType: "EMAIL" | "PHONE";
}) {
  const response = await fetch("/api/auth/otp/send", {
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