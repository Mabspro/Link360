import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM ?? "Link360 <onboarding@resend.dev>";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://link360.vercel.app";

/** Branded HTML email wrapper with Link360 header, body, and footer. */
function brandedEmailWrapper(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#0A2540 0%,#1474B4 100%);padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.01em;">🚢 Link360</h1>
            <p style="margin:4px 0 0;color:#D4A574;font-size:13px;">Community Container Shipping · NorCal → Zambia</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">Link360 Shipping · NorCal to Zambia</p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              <a href="${siteUrl}" style="color:#1474B4;text-decoration:none;">link360.vercel.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Escape for HTML to prevent injection in email body/subject. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  const safeName = escapeHtml(userName);
  const safeTitle = escapeHtml(poolTitle);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `Pledge received – ${safeTitle}`,
    html: brandedEmailWrapper(`
      <h2 style="color:#0A2540;margin:0 0 16px 0;font-size:20px;">Pledge received!</h2>
      <p style="color:#374151;margin:0 0 12px 0;">Hi ${safeName},</p>
      <p style="color:#374151;margin:0 0 12px 0;">We received your shipping interest for <strong>${safeTitle}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;">Estimated shipping</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;font-weight:600;text-align:right;">$${estShipping.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;">Pickup fee</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;font-weight:600;text-align:right;">$${estPickup.toFixed(2)}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;font-weight:600;">Total (est.)</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;font-weight:700;text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      </table>
      <p style="color:#374151;margin:0 0 12px 0;">Volume: <strong>${totalFt3.toFixed(2)} ft³</strong></p>
      <p style="color:#6b7280;margin:0 0 8px 0;font-size:14px;">This is interest-only — no payment is due now. We'll contact you when the container is confirmed.</p>
    `),
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
  const safeTitle = escapeHtml(poolTitle);
  const safeName = escapeHtml(userName);
  const safeEmail = escapeHtml(userEmail);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmails,
    subject: `New pledge: ${safeTitle} – ${safeName}`,
    html: brandedEmailWrapper(`
      <h2 style="color:#0A2540;margin:0 0 16px 0;font-size:20px;">New pledge received</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Pool</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;font-weight:600;">${safeTitle}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">From</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;">${safeName} &lt;${safeEmail}&gt;</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Volume</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;font-weight:600;">${totalFt3.toFixed(2)} ft³</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#6b7280;">Est. revenue</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#0A2540;font-weight:600;">$${estRevenue.toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;"><a href="${siteUrl}/admin/dashboard" style="display:inline-block;padding:10px 24px;background:#0A2540;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">View in dashboard →</a></p>
    `),
  });
  if (error) throw new Error(error.message);
}
