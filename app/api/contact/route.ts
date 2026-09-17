import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const data = Object.fromEntries(form.entries());
  console.log("DMK lead:", data);

  // Production TODO:
  // Connect this route to your preferred email/CRM provider.
  // The form currently logs the lead server-side so the application runs
  // without requiring a third-party API key.

  return NextResponse.redirect(new URL("/website-audit/thank-you", request.url));
}