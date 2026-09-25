import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, verifySession } from "@/lib/auth";
import { getLeads, type LeadStatus } from "@/lib/db";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySession(token);

  if (!session) {
    return null;
  }

  return session;
}

export async function GET(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as LeadStatus | "all" | null;
  const search = searchParams.get("search") ?? "";
  const limit = Number(searchParams.get("limit") ?? "250");

  const result = await getLeads({
    status: status && ["new", "contacted", "qualified", "proposal", "won", "lost"].includes(status) ? status : "all",
    search,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 250,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ leads: result.leads, username: session.username });
}
