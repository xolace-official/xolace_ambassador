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

// `rejected`: Resend answered and definitely did not send (e.g. 4xx
// validation). `ambiguous`: no answer, a 5xx, or an idempotency conflict, so
// the request may have been accepted. `rateLimited`: not processed, retryable.
type ResendFailure = "rejected" | "ambiguous" | "rateLimited";

class ResendError extends Error {
  constructor(
    message: string,
    readonly failure: ResendFailure,
  ) {
    super(message);
  }
}

function classifyStatus(status: number): ResendFailure {
  if (status === 429) return "rateLimited";
  // 409 is a concurrent or mismatched replay of an idempotency key.
  if (status === 409 || status >= 500) return "ambiguous";
  return "rejected";
}

async function postToResend(
  path: string,
  apiKey: string,
  idempotencyKey: string,
  body: unknown,
) {
  let response: Response;
  try {
    response = await fetch(`https://api.resend.com${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new ResendError(
      `The email request did not complete: ${String(error)}`,
      "ambiguous",
    );
  }
  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    let detail = responseBody;
    try {
      const parsed = JSON.parse(responseBody) as { message?: string };
      detail = parsed.message ?? responseBody;
    } catch {
      detail = responseBody;
    }
    throw new ResendError(
      `The email could not be sent (${response.status}): ${detail}`,
      classifyStatus(response.status),
    );
  }
}

// Delays before replaying a request whose outcome is unknown or rate limited.
const REPLAY_DELAYS_MS = [1000, 3000];

// Replays use the same idempotency key and body, so Resend sends at most once
// and answers a replay of an accepted request with the original response.
// Throws with `ambiguous` if any attempt may have been accepted.
async function postWithReplay(path: string, apiKey: string, body: unknown) {
  const idempotencyKey = crypto.randomUUID();
  let mayHaveBeenAccepted = false;
  for (let attempt = 0; ; attempt++) {
    try {
      await postToResend(path, apiKey, idempotencyKey, body);
      return;
    } catch (error) {
      if (!(error instanceof ResendError)) throw error;
      if (error.failure === "ambiguous") mayHaveBeenAccepted = true;
      const retryable = error.failure !== "rejected";
      if (!retryable || attempt >= REPLAY_DELAYS_MS.length) {
        if (mayHaveBeenAccepted && error.failure !== "ambiguous") {
          throw new ResendError(error.message, "ambiguous");
        }
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, REPLAY_DELAYS_MS[attempt]),
      );
    }
  }
}

export async function sendEmail(recipient: string, email: Email) {
  const { apiKey, from } = resendConfig();
  await postWithReplay("/emails", apiKey, { from, to: [recipient], ...email });
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

// `sent`: accepted. `failed`: definitely not sent, safe to retry later.
// `unknown`: may have been sent; retrying risks a duplicate email.
export type BatchSendResult = "sent" | "failed" | "unknown";

function failureResult(error: unknown): BatchSendResult {
  return error instanceof ResendError && error.failure === "ambiguous"
    ? "unknown"
    : "failed";
}

// One message per recipient so no ambassador sees another's address. Returns
// each message's outcome, in the same order as `messages`.
export async function trySendEmailBatch(
  messages: { recipient: string; email: Email }[],
) {
  const results: BatchSendResult[] = messages.map(() => "failed");
  let config: ReturnType<typeof resendConfig>;
  try {
    config = resendConfig();
  } catch (error) {
    console.error("Email batch send failed:", error);
    return results;
  }
  const { apiKey, from } = config;

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);
    try {
      await postWithReplay(
        "/emails/batch",
        apiKey,
        chunk.map(({ recipient, email }) => ({
          from,
          to: [recipient],
          ...email,
        })),
      );
      results.fill("sent", i, i + chunk.length);
    } catch (error) {
      const result = failureResult(error);
      if (result === "unknown") {
        // Resend may have accepted the batch, so sending individually could
        // email everyone twice.
        console.error("Email batch outcome unknown, not resending:", error);
        results.fill("unknown", i, i + chunk.length);
        continue;
      }
      // Resend rejects the whole batch if any one address is invalid, so
      // retry one by one and let only the bad address fail.
      console.error("Email batch rejected, sending individually:", error);
      for (const [offset, { recipient, email }] of chunk.entries()) {
        await new Promise((resolve) =>
          setTimeout(resolve, SINGLE_SEND_SPACING_MS),
        );
        try {
          await postWithReplay("/emails", apiKey, {
            from,
            to: [recipient],
            ...email,
          });
          results[i + offset] = "sent";
        } catch (sendError) {
          console.error("Email send failed:", sendError);
          results[i + offset] = failureResult(sendError);
        }
      }
    }
  }
  return results;
}
