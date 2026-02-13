import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM ?? "Link360 <onboarding@resend.dev>";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface PledgeConfirmationParams {
  to: string;
  userName: string;
  poolTitle: string;
  estShipping: number;
  estPickup: number;
  totalFt3: number;
}

export async function sendPledgeConfirmation(params: PledgeConfirmationParams) {
  if (!resend) {
    console.log("[EMAIL STUB] Pledge confirmation:", params);
    return { ok: true };
  }
  const { to, userName, poolTitle, estShipping, estPickup, totalFt3 } = params;
  const total = estShipping + estPickup;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `Pledge received – ${poolTitle}`,
    html: `
      <p>Hi ${userName},</p>
      <p>We received your shipping interest for <strong>${poolTitle}</strong>.</p>
      <p>Estimated shipping: $${estShipping.toFixed(2)} | Pickup fee: $${estPickup.toFixed(2)} | Total: $${total.toFixed(2)}</p>
      <p>Volume: ${totalFt3.toFixed(2)} ft³</p>
      <p>This is interest-only; no payment is due now. We’ll contact you when the container is confirmed.</p>
      <p>— Link360</p>
    `,
  });
  if (error) throw new Error(error.message);
}

export interface AdminPledgeNotificationParams {
  adminEmails: string[];
  poolTitle: string;
  userName: string;
  userEmail: string;
  totalFt3: number;
  estRevenue: number;
}

export async function sendAdminPledgeNotification(params: AdminPledgeNotificationParams) {
  if (!resend) {
    console.log("[EMAIL STUB] Admin notification:", params);
    return { ok: true };
  }
  const { adminEmails, poolTitle, userName, userEmail, totalFt3, estRevenue } = params;
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmails,
    subject: `New pledge: ${poolTitle} – ${userName}`,
    html: `
      <p>New pledge received.</p>
      <p>Pool: ${poolTitle}</p>
      <p>From: ${userName} &lt;${userEmail}&gt;</p>
      <p>Volume: ${totalFt3.toFixed(2)} ft³ | Est. revenue: $${estRevenue.toFixed(2)}</p>
      <p>— Link360</p>
    `,
  });
  if (error) throw new Error(error.message);
}
