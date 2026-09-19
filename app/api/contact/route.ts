import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const getEmailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.EMAIL_TO ?? user;

  if (!host || !user || !pass || !to) {
    return null;
  }

  return { host, port, user, pass, to };
};

export async function POST(request: Request) {
  const form = await request.formData();
  const data = Object.fromEntries(form.entries()) as Record<string, string>;
  const name = data.name ?? "Not provided";
  const business = data.business ?? "Not provided";
  const website = data.website ?? "Not provided";
  const email = data.email ?? "Not provided";
  const phone = data.phone ?? "Not provided";
  const businessType = data.businessType ?? "Not provided";

  console.log("DMK lead:", data);

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
        html: `
          <h2>New Website Review Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Business:</strong> ${business}</p>
          <p><strong>Business Type:</strong> ${businessType}</p>
          <p><strong>Website:</strong> ${website}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
        `,
      });
      console.log("Lead email sent successfully");
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