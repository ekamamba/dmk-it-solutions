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

  const result = await getLeads({
    status: status && ["new", "contacted", "qualified", "proposal", "won", "lost"].includes(status) ? status : "all",
    search,
    limit: 10000,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const rows = [
    ["ID", "Name", "Business", "Website", "Email", "Phone", "Business Type", "Status", "Created At"],
    ...result.leads.map((lead) => [
      String(lead.id),
      lead.name,
      lead.business,
      lead.website,
      lead.email,
      lead.phone ?? "",
      lead.businessType ?? "",
      lead.status,
      lead.createdAt,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="dmk-leads.csv"',
    },
  });
}
