import https from "node:https";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Posts JSON to a URL, following a single 302 redirect as POST (not GET).
// node:https is used instead of fetch because the WHATWG fetch spec converts
// POST→GET on 301/302, which drops the body before it reaches Apps Script.
function httpsPost(url: string, body: string, timeoutMs = 12_000): Promise<Record<string, unknown> | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Apps Script request timed out")), timeoutMs);

    function post(target: string) {
      const u = new URL(target);
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            post(res.headers.location);
            return;
          }
          let raw = "";
          res.on("data", (chunk) => { raw += chunk; });
          res.on("end", () => {
            clearTimeout(timer);
            try { resolve(JSON.parse(raw)); }
            catch { resolve(null); }
          });
        },
      );
      req.on("error", (err) => { clearTimeout(timer); reject(err); });
      req.write(body);
      req.end();
    }

    post(url);
  });
}

const MAX_BODY_BYTES = 250_000;
const ALLOWED_PATHS = new Set(["user", "practitioner"]);
const ALLOWED_ARMS = new Set(["neutral", "frame_a", "frame_b"]);

type SurveyPayload = {
  schema_version?: unknown;
  anonymous_session_id?: unknown;
  respondent_path?: unknown;
  assigned_arm?: unknown;
  started_at?: unknown;
  completed_at?: unknown;
  consent?: unknown;
  answers?: unknown;
  question_answers?: unknown;
};

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    value.length <= 40
  );
}

function validatePayload(payload: SurveyPayload): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Invalid submission.";
  }
  if (
    typeof payload.anonymous_session_id !== "string" ||
    !/^[a-f0-9-]{16,80}$/i.test(payload.anonymous_session_id)
  ) {
    return "Invalid anonymous session.";
  }
  if (!ALLOWED_PATHS.has(String(payload.respondent_path))) {
    return "Invalid respondent path.";
  }
  if (!ALLOWED_ARMS.has(String(payload.assigned_arm))) {
    return "Invalid assignment arm.";
  }
  if (!isIsoDate(payload.started_at) || !isIsoDate(payload.completed_at)) {
    return "Invalid survey timestamps.";
  }
  if (payload.consent !== true) {
    return "Consent is required.";
  }
  if (
    !payload.answers ||
    typeof payload.answers !== "object" ||
    Array.isArray(payload.answers) ||
    !payload.question_answers ||
    typeof payload.question_answers !== "object" ||
    Array.isArray(payload.question_answers)
  ) {
    return "Invalid survey answers.";
  }
  return null;
}

export async function POST(request: Request) {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const appsScriptSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

  if (!appsScriptUrl || !appsScriptSecret) {
    console.error("Survey backend environment variables are not configured.");
    return NextResponse.json(
      { ok: false, error: "Submission service is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Submission is too large." },
      { status: 413 },
    );
  }

  let payload: SurveyPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON submission." },
      { status: 400 },
    );
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 },
    );
  }

  try {
    const requestBody = JSON.stringify({
      secret: appsScriptSecret,
      payload,
    });

    // Apps Script exec URLs return a 302 redirect. node:https lets us follow
    // the redirect as a POST (preserving the body) rather than converting to GET.
    const result = await httpsPost(appsScriptUrl, requestBody);

    if (!result?.ok) {
      console.error("Apps Script rejected a survey submission.", {
        upstreamStatus: result?.status ?? "no-response",
      });
      return NextResponse.json(
        { ok: false, error: "The response could not be saved. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      responseId:
        typeof result.responseId === "string" ? result.responseId : null,
    });
  } catch (error) {
    console.error("Apps Script request failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: "The response could not be saved. Please try again." },
      { status: 502 },
    );
  }
}
