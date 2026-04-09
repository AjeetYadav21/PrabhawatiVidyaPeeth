import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createToken, verifyPassword } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { AdminUserModel } from "@/lib/models";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import type { LoginPayload } from "@/types/auth";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { limited, retryAfterSeconds } = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);

  if (limited) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  let body: LoginPayload;
  try {
    body = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? sanitizeString(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await AdminUserModel.findOne({ email }).lean();

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await createToken({
    userId: user._id.toString(),
    email: user.email
  });

  const response = NextResponse.json({
    ok: true,
    user: { email: user.email }
  });

  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24
  });

  return response;
}
