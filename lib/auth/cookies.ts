import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "fitnexus_access_token";

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
}

export async function getAccessTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function clearAccessTokenCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export const authCookieNames = {
  accessToken: ACCESS_TOKEN_COOKIE,
};