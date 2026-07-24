import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  PRACTITIONER_FLOW,
  PRACTITIONER_MESSAGES,
  QUESTIONS,
  USER_FLOW,
  USER_MESSAGES,
} from "../app/survey-config.js";
import {
  assignArm,
  buildSubmissionPayload,
  createInitialState,
  createOptionOrders,
  getOrderedOptions,
  getVisibleFlow,
  normaliseRecruitmentSource,
  pruneAnswersForFlow,
  submitSurvey,
  toggleCheckboxValue,
  validateAnswer,
} from "../app/survey-engine.js";

test("routes the two respondent pathways independently", () => {
  const user = getVisibleFlow("user", { u_age: "yes" });
  const practitioner = getVisibleFlow("practitioner", {
    t_status: "current_independent",
  });

  assert.deepEqual(user.filter((id) => id.startsWith("t")), []);
  assert.deepEqual(practitioner.filter((id) => id.startsWith("u")), []);
  assert.equal(user[0], "u_age");
  assert.equal(practitioner[0], "t_status");
  assert.equal(user.includes("u_consent"), false);
  assert.equal(practitioner.includes("t_consent"), false);
});

test("routes ineligible adults to a close before assignment", () => {
  assert.deepEqual(getVisibleFlow("user", { u_age: "no" }), [
    "u_age",
    "u_ineligible",
  ]);
  assert.deepEqual(
    getVisibleFlow("user", { u_age: "prefer_not_to_say" }),
    ["u_age", "u_ineligible"],
  );
});

test("routes non-current practitioner categories to a separate close", () => {
  for (const status of [
    "trained_not_practising",
    "in_training",
    "other_mental_health_role",
    "not_practitioner",
    "prefer_not_to_say",
  ]) {
    assert.deepEqual(getVisibleFlow("practitioner", { t_status: status }), [
      "t_status",
      "t_ineligible",
    ]);
  }
});

test("supports all three assignment arms and preserves an existing arm", () => {
  assert.equal(assignArm(null, () => 0), "neutral");
  assert.equal(assignArm(null, () => 0.34), "frame_a");
  assert.equal(assignArm(null, () => 0.99), "frame_b");
  assert.equal(assignArm("frame_a", () => 0.99), "frame_a");
});

test("persists assignment, answer state and randomised order through refresh", () => {
  const state = createInitialState("open_public");
  state.respondent_path = "user";
  state.assigned_arm = "frame_b";
  state.current_id = "u7";
  state.answers = {
    u_age: "yes",
    u_consent: true,
    u1: "considering",
    u3: { values: ["looked_for_information"] },
    u5: "somewhat_likely",
  };

  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(restored.assigned_arm, "frame_b");
  assert.deepEqual(restored.answers.u3, {
    values: ["looked_for_information"],
  });
  assert.deepEqual(restored.option_orders, state.option_orders);
  assert.equal(restored.current_id, "u7");
});

test("keeps U10 conditional on neutral, unlikely or insufficient U5 answers", () => {
  assert.equal(
    getVisibleFlow("user", { u_age: "yes", u5: "very_likely" }).includes(
      "u10",
    ),
    false,
  );
  for (const value of [
    "neither",
    "somewhat_unlikely",
    "very_unlikely",
    "insufficient_information",
  ]) {
    assert.equal(
      getVisibleFlow("user", { u_age: "yes", u5: value }).includes("u10"),
      true,
    );
  }
});

test("prunes answers that become hidden after a branch changes", () => {
  const answers = pruneAnswersForFlow("user", {
    u_age: "yes",
    u5: "very_likely",
    u10: "need_more_information",
  });
  assert.equal("u10" in answers, false);
  assert.equal(answers.u5, "very_likely");
});

test("randomises substantive choices while keeping fixed choices at the bottom", () => {
  const orders = createOptionOrders(() => 0);
  for (const question of Object.values(QUESTIONS).filter(
    (item) => item.randomize,
  )) {
    const ordered = getOrderedOptions(question, orders);
    const firstFixed = ordered.findIndex((option) => option.fixed);
    if (firstFixed >= 0) {
      assert.equal(
        ordered.slice(firstFixed).every((option) => option.fixed),
        true,
        `${question.id} must keep every fixed option at the bottom`,
      );
    }
    assert.deepEqual(
      new Set(ordered.map((option) => option.value)),
      new Set(question.options.map((option) => option.value)),
    );
  }
});

test("makes exclusive checkbox choices technically exclusive", () => {
  const question = QUESTIONS.u3;
  let answer = toggleCheckboxValue(
    question,
    { values: [] },
    "looked_for_information",
    true,
  );
  answer = toggleCheckboxValue(question, answer, "none", true);
  assert.deepEqual(answer.values, ["none"]);
  answer = toggleCheckboxValue(
    question,
    answer,
    "contacted_practitioner",
    true,
  );
  assert.deepEqual(answer.values, ["contacted_practitioner"]);
});

test("requires Other text but permits genuinely optional comprehension text", () => {
  assert.match(
    validateAnswer(QUESTIONS.u10, { value: "other", text: "" }),
    /Complete/,
  );
  assert.equal(
    validateAnswer(QUESTIONS.u10, {
      value: "other",
      text: "Another reason",
    }),
    null,
  );
  assert.equal(
    validateAnswer(QUESTIONS.u7, { text: "", not_sure: false }),
    null,
  );
});

test("builds stable analysis-variable names in the local payload", () => {
  const state = createInitialState("personal_network", new Date("2026-07-24T00:00:00Z"));
  state.respondent_path = "user";
  state.assigned_arm = "frame_b";
  state.consent = true;
  state.answers = {
    u_consent: true,
    u5: "somewhat_likely",
    u7: { text: "Six sessions and a review", not_sure: false },
    u_gender: { value: "self_describe", text: "Agender" },
  };
  const payload = buildSubmissionPayload(
    state,
    new Date("2026-07-24T00:10:00Z"),
  );

  assert.equal(payload.respondent_path, "user");
  assert.equal(payload.assigned_arm, "frame_b");
  assert.equal(payload.recruitment_source, "personal_network");
  assert.equal(payload.answers.user_stated_consideration, "somewhat_likely");
  assert.equal(
    payload.answers.user_comprehension_text,
    "Six sessions and a review",
  );
  assert.equal(payload.answers.user_gender_self_description, "Agender");
  assert.equal(payload.consent, true);
});

test("stores only known recruitment-source codes", () => {
  assert.equal(
    normaliseRecruitmentSource("practitioner_organisation"),
    "practitioner_organisation",
  );
  assert.equal(normaliseRecruitmentSource("made_up_source"), "unknown");
});

test("keeps the required architecture order", () => {
  assert.ok(USER_FLOW.indexOf("u3") < USER_FLOW.indexOf("user_message"));
  assert.ok(USER_FLOW.indexOf("user_message") < USER_FLOW.indexOf("u5"));
  assert.ok(USER_FLOW.indexOf("u5") < USER_FLOW.indexOf("u7"));
  assert.ok(USER_FLOW.indexOf("u7") < USER_FLOW.indexOf("u6"));
  assert.ok(USER_FLOW.indexOf("u10") < USER_FLOW.indexOf("u2"));
  assert.ok(USER_FLOW.indexOf("uf1") < USER_FLOW.indexOf("u_age_group"));

  assert.ok(
    PRACTITIONER_FLOW.indexOf("t_setting") <
      PRACTITIONER_FLOW.indexOf("practitioner_message"),
  );
  assert.ok(
    PRACTITIONER_FLOW.indexOf("practitioner_message") <
      PRACTITIONER_FLOW.indexOf("t8"),
  );
  assert.ok(PRACTITIONER_FLOW.indexOf("t8") < PRACTITIONER_FLOW.indexOf("t10"));
  assert.ok(PRACTITIONER_FLOW.indexOf("t14") < PRACTITIONER_FLOW.indexOf("t_work"));
});

test("keeps applicable facts in every experimental message arm", () => {
  const checks = [
    /individual/i,
    /online small[- ]group/i,
    /75 minutes/i,
    /4–6 adults/i,
    /six weekly(?: counselling or psychotherapy)? sessions/i,
    /progress review/i,
    /one school of therapy/i,
    /(?:progress become visible|make progress visible)/i,
  ];
  for (const messageSet of [USER_MESSAGES, PRACTITIONER_MESSAGES]) {
    for (const [arm, message] of Object.entries(messageSet)) {
      for (const pattern of checks) {
        assert.match(message.body, pattern, `${arm} is missing ${pattern}`);
      }
    }
    const counts = Object.values(messageSet).map(
      (message) => message.body.trim().split(/\s+/).length,
    );
    assert.ok(Math.max(...counts) / Math.min(...counts) <= 1.2);
  }
});

test("contains no pricing or payment experiment copy in survey configuration", () => {
  const visibleCopy = JSON.stringify(QUESTIONS);
  const forbidden = [
    /₹/,
    /\bwillingness[- ]to[- ]pay\b/i,
    /\baffordability\b/i,
    /\bper[- ]session rate\b/i,
    /\bpayment schedule\b/i,
    /\bcommission\b/i,
    /\bTDS\b/,
    /\bcancellation fee\b/i,
    /\bno[- ]show fee\b/i,
  ];
  forbidden.forEach((pattern) => assert.doesNotMatch(visibleCopy, pattern));
});

test("does not collect direct contact identifiers", () => {
  const dataEntryQuestions = Object.values(QUESTIONS).filter((question) =>
    [
      "radio",
      "checkbox",
      "select",
      "optional-text",
      "open-comprehension",
    ].includes(question.type),
  );
  const titles = dataEntryQuestions.map((question) => question.title).join(" ");
  assert.doesNotMatch(titles, /\bemail\b|\bphone\b|\bfull name\b|\bemployer\b|\bclinic name\b/i);
});

test("includes mobile, focus, target-size and reduced-motion safeguards", () => {
  const css = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /min-width:\s*320px/i);
  assert.match(css, /@media\s*\(max-width:\s*599px\)/i);
  assert.match(css, /min-height:\s*54px/i);
  assert.match(css, /:focus-visible/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
  assert.match(css, /forced-colors:\s*active/i);
});

test("contains no third-party analytics, pixels or session replay", () => {
  const source = [
    readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../app/survey-engine.js", import.meta.url), "utf8"),
  ].join("\n");
  assert.doesNotMatch(
    source,
    /google-analytics|googletagmanager|hotjar|fullstory|mixpanel|segment\.com|facebook pixel|clarity\.ms/i,
  );
});

test("submission adapter accepts a successful backend response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ok: true, responseId: "test-response" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  try {
    assert.deepEqual(await submitSurvey({ test: true }), {
      status: "submitted",
      responseId: "test-response",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("submission adapter preserves the draft when the backend fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ok: false, error: "Please retry." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });

  try {
    assert.deepEqual(await submitSurvey({ test: true }), {
      status: "error",
      message: "Please retry.",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
