import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { JWT_EXPIRATION } from "@/lib/constants";
import type { JWTPayload } from "@/types/auth";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: JWTPayload) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (!payload.sub || typeof payload.email !== "string") {
    throw new Error("Invalid token payload");
  }

  return {
    userId: payload.sub,
    email: payload.email,
    iat: payload.iat,
    exp: payload.exp
  };
}
