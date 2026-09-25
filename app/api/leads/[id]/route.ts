import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionCookieName, verifySession } from "@/lib/auth";
import { getLeadById, updateLeadStatus, type LeadStatus } from "@/lib/db";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySession(token);

  if (!session) {
    return null;
  }

  return session;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getLeadById(Number(id));

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ lead: result.lead, username: session.username, role: session.role });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  const status = body.status as LeadStatus | undefined;

  if (!status || !["new", "contacted", "qualified", "proposal", "won", "lost"].includes(status)) {
    return NextResponse.json({ error: "Invalid lead status." }, { status: 400 });
  }

  const result = await updateLeadStatus(Number(id), status);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, affectedRows: result.affectedRows, role: session.role });
}
