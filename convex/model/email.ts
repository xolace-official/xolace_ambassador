export const EMAIL_LOGO_URL =
  "https://res.cloudinary.com/dnucdwa71/image/upload/v1780657998/main-logo_ip0ag6.png";

type Email = { subject: string; html: string; text: string };

// Resend accepts at most 100 messages per batch request.
const BATCH_SIZE = 100;

function resendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error(
      "Configure RESEND_API_KEY and RESEND_FROM_EMAIL before sending email.",
    );
  }
  return { apiKey, from: `Xolace Ambassador Team <${fromEmail}>` };
}

async function postToResend(path: string, apiKey: string, body: unknown) {
  const response = await fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const responseBody = await response.text();
    let detail = responseBody;
    try {
      const parsed = JSON.parse(responseBody) as { message?: string };
      detail = parsed.message ?? responseBody;
    } catch {
      detail = responseBody;
    }
    throw new Error(`The email could not be sent: ${detail}`);
  }
}

export async function sendEmail(recipient: string, email: Email) {
  const { apiKey, from } = resendConfig();
  await postToResend("/emails", apiKey, { from, to: [recipient], ...email });
}

// Best-effort send: returns false instead of throwing so a failing email
// provider never blocks the underlying state change (e.g. scheduling).
export async function trySendEmail(recipient: string, email: Email) {
  try {
    await sendEmail(recipient, email);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

// Resend's default limit is 2 requests per second.
const SINGLE_SEND_SPACING_MS = 600;

// One message per recipient so no ambassador sees another's address. Returns
// whether each message was accepted, in the same order as `messages`.
export async function trySendEmailBatch(
  messages: { recipient: string; email: Email }[],
) {
  const delivered = messages.map(() => false);
  let config: ReturnType<typeof resendConfig>;
  try {
    config = resendConfig();
  } catch (error) {
    console.error("Email batch send failed:", error);
    return delivered;
  }
  const { apiKey, from } = config;

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);
    try {
      await postToResend(
        "/emails/batch",
        apiKey,
        chunk.map(({ recipient, email }) => ({
          from,
          to: [recipient],
          ...email,
        })),
      );
      delivered.fill(true, i, i + chunk.length);
    } catch (error) {
      // Resend rejects the whole batch if any one address is invalid, so
      // retry one by one and let only the bad address fail.
      console.error("Email batch rejected, sending individually:", error);
      for (const [offset, { recipient, email }] of chunk.entries()) {
        await new Promise((resolve) =>
          setTimeout(resolve, SINGLE_SEND_SPACING_MS),
        );
        delivered[i + offset] = await trySendEmail(recipient, email);
      }
    }
  }
  return delivered;
}
