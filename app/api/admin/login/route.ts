import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authenticateUser, getSessionCookieName, signSession, verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  const user = await authenticateUser(username, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const session = signSession(user);
  const response = NextResponse.json({ success: true, username: user.username, role: user.role });

  response.cookies.set(getSessionCookieName(), session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySession(sessionToken);

  return NextResponse.json({ loggedIn: !!session, username: session?.username ?? null, role: session?.role ?? null });
}
