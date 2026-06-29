import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or NEXTAUTH_SECRET is required");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export type AuthTokenPayload = {
  sessionId: string;
  userId: string;
  organizationId: string;
};

export async function createAccessToken(payload: AuthTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);

  return payload as AuthTokenPayload & {
    iat: number;
    exp: number;
  };
}