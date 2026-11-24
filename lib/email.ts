/**
 * lib/email.ts
 *
 * Sends notifications via configured Brevo SMTP (or Resend).
 * From address: jawad@zalvrohq.com
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

export interface AppointmentEmailPayload {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  startsAt: Date;
  label: string;
}

export interface AppointmentEmailPreview {
  patient: { subject: string; body: string };
  doctor: { subject: string; body: string };
}

function escapePlainText(text: string): string {
  return text.replace(/[\r\n\x00-\x1F\x7F]/g, " ").trim();
}

/**
 * Sends an enquiry notification to DEMO_INBOX_EMAIL.
 */
export async function sendEnquiryEmail(
  details: EnquiryEmailPayload
): Promise<{ subject: string; body: string }> {
  const to = env.DEMO_INBOX_EMAIL;
  const safeName = escapePlainText(details.name);
  const safeReason = escapePlainText(details.reason);
  const subject = `New website enquiry: ${safeReason}`;

  const textBody = `
New website enquiry received:

Patient Name:   ${safeName}
Contact:        ${escapePlainText(details.contact)}
Preferred Time: ${escapePlainText(details.preferredTime)}
Reason:         ${safeReason}
${details.note ? `Note:           ${escapePlainText(details.note)}\n` : ""}
Submitted at:   ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}

This is a sample enquiry notification from the Alder & Finch Dental demo website.
`.trim();

  if (!to) {
    return { subject, body: textBody };
  }

  await sendMail({
    to,
    subject,
    text: textBody,
  });

  return { subject, body: textBody };
}

/**
 * Sends two appointment emails (patient confirmation + doctor notification)
 * and returns previews for UI display.
 */
export async function sendAppointmentEmails(
  payload: AppointmentEmailPayload
): Promise<AppointmentEmailPreview> {
  const safePatientName = escapePlainText(payload.patientName);
  const safePatientEmail = escapePlainText(payload.patientEmail);
  const safeDoctorName = escapePlainText(payload.doctorName);
  const safeDoctorEmail = escapePlainText(payload.doctorEmail);
  const safeLabel = escapePlainText(payload.label);

  // 1. Patient Confirmation Email
  const patientSubject =
    "Your appointment request: Alder & Finch Dental (sample)";

  const patientBody = `
This is a sample booking made on a demo website and no real appointment exists.

Dear ${safePatientName},

Thank you for requesting an appointment with Alder & Finch Dental.

Doctor:      ${safeDoctorName}
Date & Time: ${safeLabel} (Australia/Sydney)
Duration:    30 minutes
Location:    Level 1, 12 Example Street, Sydney NSW 2000

Please note that this is a sample booking made on a demonstration website created by Zalvro. No real appointment has been booked.

Sample website designed by Zalvro. Reply to this email if you want it removed.
`.trim();

  // 2. Doctor Notification Email
  const doctorSubject = `New booking: ${safePatientName} with ${safeDoctorName}, ${safeLabel}`;

  const doctorBody = `
New booking notification:

Doctor:            ${safeDoctorName} (placeholder recipient: ${safeDoctorEmail})
Date & Time:       ${safeLabel} (Australia/Sydney)
Duration:          30 minutes
Patient Name:      ${safePatientName}
Patient Email:     ${safePatientEmail}
Submitted at:      ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}

This notification was generated from the Alder & Finch Dental demo website.
`.trim();

  const preview: AppointmentEmailPreview = {
    patient: { subject: patientSubject, body: patientBody },
    doctor: { subject: doctorSubject, body: doctorBody },
  };

  // Deliver patient email to patientEmail
  await sendMail({
    to: safePatientEmail,
    subject: patientSubject,
    text: patientBody,
  });

  // Deliver doctor notification to DEMO_INBOX_EMAIL (not placeholder doctor email)
  const doctorRecipient = env.DEMO_INBOX_EMAIL;
  if (doctorRecipient) {
    await sendMail({
      to: doctorRecipient,
      subject: doctorSubject,
      text: doctorBody,
    });
  }

  return preview;
}

// ---------------------------------------------------------------------------
// Low-level mail transport
// ---------------------------------------------------------------------------

async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const from = "Alder & Finch Dental <jawad@zalvrohq.com>";

  // 1. Try Brevo / SMTP first
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

      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
      return;
    } catch (err) {
      console.error("[email] SMTP transport error:", err);
    }
  }

  // 2. Try Resend if configured
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to: [options.to],
          subject: options.subject,
          text: options.text,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[email] Resend API error:", errText);
      }
    } catch (err) {
      console.error("[email] Resend transport error:", err);
    }
  }
}
