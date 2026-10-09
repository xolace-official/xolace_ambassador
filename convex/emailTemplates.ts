// Literal hex is required here: email clients render in their own engine and
// do not read the CSS custom properties from globals.css.
const BRAND = {
  primary: "#ff00c8",
  primaryDark: "#d300a5",
  ink: "#0c0c1d",
  body: "#3d3d52",
  muted: "#6b6b80",
  surface: "#ffffff",
  page: "#f7f9fb",
  border: "#dfe6e9",
  tint: "#fdf0fa",
} as const;

// White on the pure primary fails contrast, so buttons use the darkened shade.
const BUTTON = `background:${BRAND.primaryDark};color:#ffffff`;

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${BRAND.body}">${text}</p>`;
}

function detail(label: string, value: string) {
  return `<tr>
<td style="padding:8px 0;font-size:15px;color:${BRAND.muted};white-space:nowrap">${label}</td>
<td style="padding:8px 0;font-size:15px;color:${BRAND.ink};font-weight:600;text-align:right;word-break:break-word">${value}</td>
</tr>`;
}

function button(label: string, href: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;border-radius:999px;${BUTTON};text-decoration:none;font-weight:700;font-size:15px">${escapeHtml(label)}</a>`;
}

function slotRow(label: string | null) {
  if (!label) return "";
  return `<div style="margin:0 0 20px;padding:14px 18px;border-radius:12px;background:${BRAND.tint};border-left:4px solid ${BRAND.primary};font-size:15px;color:${BRAND.ink}"><strong>${escapeHtml(label)}</strong></div>`;
}

function layout(args: {
  eyebrow: string;
  title: string;
  content: string;
  logoUrl: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(args.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.page}">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden">
<tr><td style="padding:32px 36px;border-bottom:1px solid ${BRAND.border}">
<img src="${escapeHtml(args.logoUrl)}" alt="Xolace" width="132" style="display:block;height:auto;border:0" />
</td></tr>
<tr><td style="padding:8px 36px 0">
<div style="height:4px;width:56px;border-radius:999px;background:${BRAND.primary}"></div>
</td></tr>
<tr><td style="padding:28px 36px 36px">
<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.primaryDark}">${escapeHtml(args.eyebrow)}</p>
<h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:${BRAND.ink}">${escapeHtml(args.title)}</h1>
${args.content}
</td></tr>
</table>
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:center">
Xolace Ambassadors &middot; Building a world where people feel heard.<br />
<a href="${escapeHtml(baseUrl())}" style="color:${BRAND.muted}">${escapeHtml(baseUrl().replace(/^https?:\/\//, ""))}</a>
</p>
</td></tr>
</table>
</body>
</html>`;
}

// Single source for the public origin used in every link we email. A localhost
// fallback would silently ship dead buttons to applicants, so an unconfigured
// deployment resolves to the real domain instead.
export function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://xolaceinc.com";
}

export function loginUrl() {
  return `${baseUrl()}/login`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export function applicationReceivedEmail(args: {
  name: string;
  selectedSlot: string | null;
  logoUrl: string;
}) {
  return {
    subject: "We received your Xolace Ambassador application",
    html: layout({
      eyebrow: "Application received",
      title: `Thanks, ${args.name}`,
      logoUrl: args.logoUrl,
      content:
        paragraph(
          "Thank you for applying to join the Xolace Ambassadors Program. We have your application and our team will read through it carefully.",
        ) +
        slotRow(args.selectedSlot) +
        paragraph(
          "There is nothing you need to do right now. If the team would like to meet you, we will email you a time and a joining link.",
        ) +
        `<p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:${BRAND.muted}">We will be in touch soon with the next steps.</p>`,
    }),
    text: `Hi ${args.name},\n\nThank you for applying to join the Xolace Ambassadors Program. We have your application and our team will read through it carefully.\n\n${
      args.selectedSlot
        ? `Your selected meeting time: ${args.selectedSlot}\n\n`
        : ""
    }There is nothing you need to do right now. If the team would like to meet you, we will email you a time and a joining link.\n\nWe will be in touch soon with the next steps.`,
  };
}

export function meetingScheduledEmail(args: {
  name: string;
  scheduleUrl: string;
  selectedSlot: string | null;
  logoUrl: string;
}) {
  return {
    subject: "Join your meeting with the Xolace Ambassadors team",
    html: layout({
      eyebrow: "Your meeting",
      title: "Let's meet",
      logoUrl: args.logoUrl,
      content:
        paragraph(
          "Thanks for your interest in the Xolace Ambassadors Program. We would love to meet you and hear about your story, what you are drawn to, and how you would like to contribute.",
        ) +
        slotRow(args.selectedSlot) +
        paragraph(
          "Use the button below to join at the time you picked. You do not need to book anything else.",
        ) +
        `<div style="margin:28px 0">${button("Join meeting", args.scheduleUrl)}</div>` +
        `<p style="margin:0;font-size:14px;line-height:1.7;color:${BRAND.muted}">If the time no longer works, just reply to this email and we will find another.</p>`,
    }),
    text: `Hi ${args.name},\n\nThanks for your interest in the Xolace Ambassadors Program. We would love to meet you.\n\nYour selected meeting time: ${
      args.selectedSlot ?? "not selected"
    }\n\nJoin the meeting here: ${args.scheduleUrl}\n\nIf the time no longer works, just reply to this email and we will find another.`,
  };
}

export function declinedApplicationEmail(args: {
  name: string;
  note: string;
  logoUrl: string;
}) {
  return {
    subject: "An update on your Xolace Ambassador application",
    html: layout({
      eyebrow: "Application update",
      title: "Thank you for applying",
      logoUrl: args.logoUrl,
      content:
        paragraph(
          "Thank you for taking the time to apply to the Xolace Ambassadors Program. After reviewing your application, we are not able to move forward at this time.",
        ) +
        `<div style="margin:24px 0;padding:18px 20px;border-radius:12px;background:${BRAND.tint};border-left:4px solid ${BRAND.primary};font-size:15px;line-height:1.7;color:${BRAND.body}">${escapeHtml(args.note)}</div>` +
        paragraph(
          "We appreciate your interest in Xolace and wish you every success. You are welcome to apply again in a future intake.",
        ),
    }),
    text: `Hi ${args.name},\n\nThank you for applying to the Xolace Ambassadors Program. After reviewing your application, we are not able to move forward at this time.\n\nFeedback:\n${args.note}\n\nWe appreciate your interest in Xolace.`,
  };
}

export function acceptedApplicationEmail(args: {
  name: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  referralCode: string;
  selectedSlot: string | null;
  logoUrl: string;
}) {
  return {
    subject: "You're in — welcome to Xolace Ambassadors",
    html: layout({
      eyebrow: "Welcome to the program",
      title: `You're in, ${args.name}`,
      logoUrl: args.logoUrl,
      content:
        paragraph(
          "Congratulations and welcome to the Xolace Ambassadors Program. Your application has been accepted, and we are excited to have you with us.",
        ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;padding:20px;border:1px solid ${BRAND.border};border-radius:12px;background:${BRAND.page}">
${detail("Email", escapeHtml(args.email))}
${detail("Temporary password", escapeHtml(args.temporaryPassword))}
${detail("Referral code", escapeHtml(args.referralCode))}
${args.selectedSlot ? detail("Meeting time", escapeHtml(args.selectedSlot)) : ""}
</table>` +
        paragraph(
          "Sign in with the temporary password below. You will be asked to create a new password before you can enter the portal.",
        ) +
        `<div style="margin:28px 0">${button("Visit portal", args.loginUrl)}</div>` +
        `<p style="margin:0;font-size:14px;line-height:1.7;color:${BRAND.muted}">Please keep these account details private and do not forward this email.</p>`,
    }),
    text: `Hi ${args.name},\n\nCongratulations and welcome to the Xolace Ambassadors Program. Your application has been accepted.\n\nEmail: ${args.email}\nTemporary password: ${args.temporaryPassword}\nReferral code: ${args.referralCode}\nMeeting time: ${args.selectedSlot ?? "Not selected"}\n\nVisit the portal: ${args.loginUrl}\n\nYou will be asked to create a new password before entering the portal. Please keep these details private.`,
  };
}
