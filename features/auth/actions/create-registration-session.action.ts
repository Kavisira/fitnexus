"use client";

export async function createRegistrationSessionAction(input: {
  email: string;
  phone: string;
}) {
  const response = await fetch("/api/auth/registration/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration session failed");
  }

  return result.data;
}