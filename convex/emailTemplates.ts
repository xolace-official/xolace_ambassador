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

function layout(title: string, content: string, logoUrl: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f7f6;font-family:Arial,sans-serif;color:#18342d"><div style="max-width:600px;margin:0 auto;padding:32px 16px"><div style="background:#ffffff;border:1px solid #dfe8e3;border-radius:20px;overflow:hidden"><div style="padding:28px 32px;border-bottom:1px solid #e8efeb"><img src="${escapeHtml(logoUrl)}" alt="Xolace" width="120" style="display:block;height:auto" /></div><div style="padding:32px"><h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#18342d">${escapeHtml(title)}</h1>${content}</div></div><p style="padding:20px;text-align:center;font-size:12px;color:#71827b">Xolace Ambassadors · Building a world where people feel heard.</p></div></body></html>`;
}

function button(label: string, href: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#18342d;color:#ffffff;text-decoration:none;font-weight:700">${escapeHtml(label)}</a>`;
}

export function applicationReceivedEmail(args: {
  name: string;
  scheduleUrl: string;
  selectedSlot: string | null;
  logoUrl: string;
}) {
  const name = escapeHtml(args.name);
  const slot = args.selectedSlot
    ? `<p style="font-size:16px;line-height:1.7">Your selected meeting time: <strong>${escapeHtml(args.selectedSlot)}</strong></p>`
    : "";
  const content = `<p style="font-size:16px;line-height:1.7">Hi ${name},</p><p style="font-size:16px;line-height:1.7">Thank you for applying to become a Xolace Ambassador. We’ve received your application and our team will review it carefully.</p>${slot}<p style="font-size:16px;line-height:1.7">If you’d like to speak with the team, you can schedule a short meeting at a time that works for you.</p><p style="margin:28px 0">${button("Schedule a meeting", args.scheduleUrl)}</p><p style="font-size:14px;line-height:1.7;color:#60736b">We’ll be in touch soon with the next steps.</p>`;
  return {
    subject: "We received your Xolace Ambassador application",
    html: layout("Application received", content, args.logoUrl),
    text: `Hi ${args.name},\n\nThank you for applying to become a Xolace Ambassador. We received your application.\n\nSelected meeting time: ${args.selectedSlot ?? "Not selected"}\n\nSchedule a meeting: ${args.scheduleUrl}\n\nWe’ll be in touch soon.`,
  };
}

export function meetingScheduledEmail(args: {
  name: string;
  scheduleUrl: string;
  selectedSlot: string | null;
  logoUrl: string;
}) {
  const slot = args.selectedSlot
    ? `<p style="font-size:16px;line-height:1.7">Your selected meeting time: <strong>${escapeHtml(args.selectedSlot)}</strong></p>`
    : "";
  const content = `<p style="font-size:16px;line-height:1.7">Hi ${escapeHtml(args.name)},</p><p style="font-size:16px;line-height:1.7">Thanks for your interest in the Xolace Ambassadors Program. We’d love to meet you and learn more about your story, interests, and how you’d like to contribute.</p>${slot}<p style="font-size:16px;line-height:1.7">Please choose a convenient time using the link below.</p><p style="margin:28px 0">${button("Choose a meeting time", args.scheduleUrl)}</p><p style="font-size:14px;line-height:1.7;color:#60736b">We look forward to meeting you.</p>`;
  return {
    subject: "Choose a time to meet the Xolace Ambassadors team",
    html: layout("Let’s meet", content, args.logoUrl),
    text: `Hi ${args.name},\n\nWe’d love to meet you. Your selected meeting time is ${args.selectedSlot ?? "not selected"}. Choose a convenient time here: ${args.scheduleUrl}\n\nWe look forward to meeting you.`,
  };
}

export function declinedApplicationEmail(args: {
  name: string;
  note: string;
  logoUrl: string;
}) {
  const content = `<p style="font-size:16px;line-height:1.7">Hi ${escapeHtml(args.name)},</p><p style="font-size:16px;line-height:1.7">Thank you for taking the time to apply to the Xolace Ambassadors Program. After reviewing your application, we’re unable to move forward at this time.</p><div style="margin:24px 0;padding:18px;border-left:4px solid #18342d;background:#f2f6f3;font-size:15px;line-height:1.7">${escapeHtml(args.note)}</div><p style="font-size:16px;line-height:1.7">We appreciate your interest in Xolace and wish you every success.</p>`;
  return {
    subject: "An update on your Xolace Ambassador application",
    html: layout("Application update", content, args.logoUrl),
    text: `Hi ${args.name},\n\nThank you for applying to the Xolace Ambassadors Program. We’re unable to move forward at this time.\n\nFeedback:\n${args.note}\n\nWe appreciate your interest in Xolace.`,
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
  const content = `<p style="font-size:16px;line-height:1.7">Hi ${escapeHtml(args.name)},</p><p style="font-size:16px;line-height:1.7">Congratulations and welcome to the Xolace Ambassadors Program. Your application has been accepted, and we’re excited to have you with us.</p><div style="margin:24px 0;padding:20px;border:1px solid #dfe8e3;border-radius:12px;background:#f7faf8"><p style="margin:0 0 10px;font-weight:700">Your account details</p><p style="margin:6px 0">Email: <strong>${escapeHtml(args.email)}</strong></p><p style="margin:6px 0">Temporary password: <strong>${escapeHtml(args.temporaryPassword)}</strong></p><p style="margin:6px 0">Referral code: <strong>${escapeHtml(args.referralCode)}</strong></p>${args.selectedSlot ? `<p style="margin:6px 0">Selected meeting time: <strong>${escapeHtml(args.selectedSlot)}</strong></p>` : ""}</div><p style="font-size:16px;line-height:1.7">Sign in with the temporary password below. You’ll be asked to create a new password before you can enter the portal.</p><p style="margin:28px 0">${button("Sign in to Xolace", args.loginUrl)}</p><p style="font-size:14px;line-height:1.7;color:#60736b">Please keep your account details private.</p>`;
  return {
    subject: "Congratulations — welcome to Xolace Ambassadors",
    html: layout("Welcome to the program", content, args.logoUrl),
    text: `Hi ${args.name},\n\nCongratulations and welcome to the Xolace Ambassadors Program.\n\nEmail: ${args.email}\nTemporary password: ${args.temporaryPassword}\nReferral code: ${args.referralCode}\nSelected meeting time: ${args.selectedSlot ?? "Not selected"}\n\nSign in at ${args.loginUrl}. You will be asked to create a new password before entering the portal.`,
  };
}
