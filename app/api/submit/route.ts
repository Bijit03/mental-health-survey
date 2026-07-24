import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    // Apps Script exec URLs return a 302 redirect. The Fetch spec converts POST
    // to GET when following 301/302, dropping the body. We follow manually so
    // the POST body reaches doPost on the redirect target.
    const redirectResponse = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });

    const targetUrl =
      redirectResponse.status >= 300 && redirectResponse.status < 400
        ? redirectResponse.headers.get("location")
        : null;

    const upstream = targetUrl
      ? await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
          signal: AbortSignal.timeout(12_000),
        })
      : redirectResponse;

    const result = await upstream.json().catch(() => null);

    if (!upstream.ok || !result?.ok) {
      console.error("Apps Script rejected a survey submission.", {
        status: upstream.status,
        upstreamStatus: result?.status,
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
    });
    return NextResponse.json(
      { ok: false, error: "The response could not be saved. Please try again." },
      { status: 502 },
    );
  }
}
