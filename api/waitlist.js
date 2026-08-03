const validStates = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]);

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const normalize = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const body = request.body || {};
  if (body.companyWebsite) return response.status(200).json({ ok: true });

  const submission = {
    name: normalize(body.name, 120),
    email: normalize(body.email, 180).toLowerCase(),
    state: normalize(body.state, 2).toUpperCase(),
    phone: normalize(body.phone, 40),
    bookSize: normalize(body.bookSize, 80),
    staffCount: normalize(body.staffCount, 8),
    reason: normalize(body.reason, 3000),
    additionalInfo: normalize(body.additionalInfo, 3000),
  };

  const hasRequiredFields = submission.name
    && submission.email
    && submission.state
    && submission.phone
    && submission.bookSize
    && submission.staffCount
    && submission.reason;
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email);
  const staffCountIsValid = /^\d{1,5}$/.test(submission.staffCount);

  if (!hasRequiredFields || !emailIsValid || !validStates.has(submission.state) || !staffCountIsValid) {
    return response.status(400).json({ error: "Please check the required fields and try again." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL;
  const fromEmail = process.env.WAITLIST_FROM_EMAIL;

  if (!apiKey || !notificationEmail || !fromEmail) {
    return response.status(503).json({ error: "The waiting list is being connected. Please try again shortly." });
  }

  const rows = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["State", submission.state],
    ["Phone", submission.phone],
    ["Book size", submission.bookSize],
    ["Number of staff", submission.staffCount],
    ["Why they want to attend", submission.reason],
    ["Additional information", submission.additionalInfo || "Not provided"],
  ];

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [notificationEmail],
      reply_to: submission.email,
      subject: `MEGA 2026 waiting list · ${submission.name} · ${submission.state}`,
      html: `
        <div style="background:#eef1ef;padding:32px 16px;color:#17232b;font-family:Arial,sans-serif">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
            <div style="background:#0a1822;padding:28px 32px;color:#f4f5f2">
              <p style="margin:0 0 8px;color:#f07a55;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">MEGA / 26</p>
              <h1 style="margin:0;font-size:28px;line-height:1.15">New waiting-list request</h1>
            </div>
            <div style="padding:28px 32px">
              ${rows.map(([label, value]) => `
                <div style="padding:14px 0;border-bottom:1px solid #d8e0dd">
                  <div style="margin-bottom:5px;color:#5b6a71;font-size:12px;font-weight:700;text-transform:uppercase">${escapeHtml(label)}</div>
                  <div style="font-size:16px;line-height:1.55;white-space:pre-wrap">${escapeHtml(value)}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    console.error("Resend waitlist email failed", emailResponse.status, await emailResponse.text());
    return response.status(502).json({ error: "We could not submit the form. Please try again." });
  }

  return response.status(200).json({ ok: true });
}
