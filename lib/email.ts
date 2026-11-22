/**
 * lib/email.ts
 *
 * Sends enquiry notifications to DEMO_INBOX_EMAIL via configured Brevo SMTP or Resend.
 */

import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export interface EnquiryEmailPayload {
  name: string;
  contact: string;
  preferredTime: string;
  reason: string;
  note?: string;
}

export async function sendEnquiryEmail(details: EnquiryEmailPayload): Promise<{ subject: string; body: string }> {
  const to = env.DEMO_INBOX_EMAIL;
  const subject = `New website enquiry: ${details.reason}`;

  const textBody = `
New website enquiry received:

Patient Name:   ${details.name}
Contact:        ${details.contact}
Preferred Time: ${details.preferredTime}
Reason:         ${details.reason}
${details.note ? `Note:           ${details.note}\n` : ""}
Submitted at:   ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}

This is a sample enquiry notification from the Alder & Finch Dental demo website.
`.trim();

  if (!to) {
    console.warn("[email] DEMO_INBOX_EMAIL not configured, skipping notification");
    return { subject, body: textBody };
  }

  // Option 1: Resend
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Alder & Finch Dental <onboarding@resend.dev>",
          to: [to],
          subject,
          text: textBody,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[email] Resend API error:", err);
      }
    } catch (err) {
      console.error("[email] Resend send error:", err);
    }

    return { subject, body: textBody };
  }

  // Option 2: SMTP (Brevo)
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    try {
      const port = Number(env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 12px; background-color: #fafaf9;">
          <h2 style="color: #1c1917; margin-top: 0; font-size: 20px; font-weight: 600;">New website enquiry</h2>
          <p style="color: #78716c; font-size: 14px; margin-top: 4px;">A new appointment enquiry has been submitted through the Alder & Finch Dental website.</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #78716c; width: 140px;"><strong>Patient Name:</strong></td>
              <td style="padding: 8px 0; color: #1c1917; font-weight: 500;">${details.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78716c;"><strong>Contact Info:</strong></td>
              <td style="padding: 8px 0; color: #1c1917; font-weight: 500;">${details.contact}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78716c;"><strong>Preferred Time:</strong></td>
              <td style="padding: 8px 0; color: #1c1917; font-weight: 500;">${details.preferredTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78716c;"><strong>Reason for Visit:</strong></td>
              <td style="padding: 8px 0; color: #1c1917; font-weight: 500;">${details.reason}</td>
            </tr>
            ${
              details.note
                ? `<tr>
              <td style="padding: 8px 0; color: #78716c; vertical-align: top;"><strong>Patient Note:</strong></td>
              <td style="padding: 8px 0; color: #1c1917;">${details.note}</td>
            </tr>`
                : ""
            }
          </table>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="color: #a8a29e; font-size: 12px; margin-bottom: 0; font-style: italic;">
            This is a sample enquiry notification from the Alder & Finch Dental demo website.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"Alder & Finch Dental" <${env.SMTP_USER}>`,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });
    } catch (err) {
      console.error("[email] SMTP send error:", err);
    }
  }

  return { subject, body: textBody };
}
