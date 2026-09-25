import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveLead } from "@/lib/db";

const getEmailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.EMAIL_TO ?? "info@dmkitsolutions.com";

  if (!host || !user || !pass || !to) {
    return null;
  }

  return { host, port, user, pass, to };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildLeadEmailHtml = ({
  title,
  intro,
  rows,
  footer,
}: {
  title: string;
  intro: string;
  rows: Array<{ label: string; value: string }>;
  footer: string;
}) => `
  <!DOCTYPE html>
  <html lang="en">
    <body style="margin:0; padding:0; background-color:#f5f8fc; font-family:Arial, Helvetica, sans-serif; color:#172033;">
      <div style="max-width:680px; margin:0 auto; padding:24px 16px;">
        <div style="background:linear-gradient(90deg, #0b1736 0%, #1769e0 55%, #19b5fe 100%); border-radius:18px 18px 0 0; padding:22px 24px;">
          <div style="display:inline-block; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:999px; padding:8px 14px; font-size:12px; letter-spacing:1px; color:#ffffff; font-weight:700; text-transform:uppercase;">
            DMK IT Solutions
          </div>
        </div>

        <div style="background:#ffffff; border:1px solid #e4eaf2; border-top:none; border-radius:0 0 18px 18px; padding:28px 24px 20px; box-shadow:0 14px 40px rgba(11,23,54,0.08);">
          <h1 style="margin:0 0 12px; font-size:28px; line-height:1.25; color:#0b1736;">${escapeHtml(title)}</h1>
          <p style="margin:0 0 22px; font-size:16px; line-height:1.6; color:#172033;">${escapeHtml(intro)}</p>

          <div style="background:#f5f8fc; border:1px solid #e4eaf2; border-radius:12px; padding:16px;">
            ${rows
              .map(
                (row) => `
                  <div style="padding:10px 0; border-bottom:1px solid #dfe8f3;">
                    <div style="font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#1769e0; margin-bottom:4px;">${escapeHtml(row.label)}</div>
                    <div style="font-size:15px; line-height:1.5; color:#172033; word-break:break-word;">${escapeHtml(row.value)}</div>
                  </div>
                `,
              )
              .join("")}
          </div>

          <p style="margin:18px 0 0; font-size:14px; line-height:1.6; color:#172033;">${escapeHtml(footer)}</p>
        </div>
      </div>
    </body>
  </html>
`;

export async function POST(request: Request) {
  const form = await request.formData();
  const data = Object.fromEntries(form.entries()) as Record<string, string>;
  const name = (data.name ?? "Not provided").trim();
  const business = (data.business ?? "Not provided").trim();
  const website = (data.website ?? "Not provided").trim();
  const email = (data.email ?? "Not provided").trim();
  const phone = (data.phone ?? "").trim();
  const businessType = (data.businessType ?? "Not provided").trim();

  console.log("DMK lead:", data);

  const leadSaveResult = await saveLead({
    name,
    business,
    website,
    email,
    phone,
    businessType,
  });

  if (!leadSaveResult.success) {
    console.warn("Lead was not saved to the database:", leadSaveResult.error);
  } else {
    console.log("Lead saved to CRM database with ID:", leadSaveResult.id);
  }

  const smtpConfig = getEmailConfig();

  if (smtpConfig) {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"DMK Website Form" <${smtpConfig.user}>`,
        to: smtpConfig.to,
        replyTo: email,
        subject: `New website review request from ${name}`,
        html: buildLeadEmailHtml({
          title: "New Website Review Request",
          intro: "A new lead has been submitted through the DMK website audit form.",
          rows: [
            { label: "Name", value: name },
            { label: "Business", value: business },
            { label: "Business Type", value: businessType },
            { label: "Website", value: website },
            { label: "Email", value: email },
            { label: "Phone", value: phone || "Not provided" },
          ],
          footer: "Please follow up with this lead as soon as possible.",
        }),
      });

      if (email && email !== "Not provided") {
        await transporter.sendMail({
          from: `"DMK IT Solutions" <${smtpConfig.user}>`,
          to: email,
          replyTo: smtpConfig.to,
          subject: "Your DMK website review request has been received",
          html: buildLeadEmailHtml({
            title: `Thanks for reaching out, ${name}`,
            intro: "We received your website review request and will be in touch soon.",
            rows: [
              { label: "Business", value: business },
              { label: "Website", value: website },
              { label: "Email", value: email },
              { label: "Phone", value: phone || "Not provided" },
            ],
            footer: "If you need a faster response, you can reply directly to this email.",
          }),
        });
      }

      console.log("Lead emails sent successfully to DMK and the user");
    } catch (error) {
      console.error("Failed to send lead email:", error);
      return NextResponse.json({ error: "Unable to send email right now." }, { status: 500 });
    }
  } else {
    console.warn("SMTP email config is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_TO to enable email delivery.");
  }

  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  const normalizedHost = host.replace(/^0\.0\.0\.0(?::\d+)?$/, "localhost");
  const origin = `${forwardedProto}://${normalizedHost}`;

  return NextResponse.redirect(new URL("/website-audit/thank-you", origin));
}